# Customer Messaging — Web Socket Integration (Vemtap-Web)

How to wire real-time customer chat into **Vemtap-Web** (Vite + React 18 + TanStack Query). It covers the socket URL, auth, every event, tick and presence rules, and the REST calls it depends on.

- **Backend source of truth:** `Vemtap/apps/backend/src/modules/messaging/messaging.gateway.ts`
- **Behaviour reference (already working in the mobile app):** `vemtap-app/src/features/merchantChat/`. Read it for the logic, but everything below is written for the browser.
- **Web screens to wire up:** these currently read static data from `src/scripts/messagesData.ts`:
  - `src/scripts/MessagesScreen.tsx` (mobile-width thread list)
  - `src/scripts/ConversationScreen.tsx` (mobile-width chat)
  - `src/scripts/desktop/DesktopMessagesScreen.tsx` (desktop layout)

---

## 1. Socket URL

The socket uses **Socket.IO v4** (not a raw `WebSocket`) on the **`/messaging` namespace**, at the **server root**.

```
<API ORIGIN>/messaging
```

| Environment | `VITE_API_BASE_URL`                  | REST base (`getApiBaseUrl()`)        | Socket URL                             |
| ----------- | ------------------------------------ | ------------------------------------ | -------------------------------------- |
| Local       | `http://localhost:3002/api`          | `http://localhost:3002/api/v1`       | `http://localhost:3002/messaging`      |
| Test        | `https://testapi.vemtap.com/api`     | `https://testapi.vemtap.com/api/v1`  | `https://testapi.vemtap.com/messaging` |

Get it from the existing client. Don't add a new env var:

```ts
import { getApiBaseUrl } from '../services/api/client';

export const SOCKET_ORIGIN = new URL(getApiBaseUrl()).origin; // strips /api/v1
export const MESSAGING_SOCKET_URL = `${SOCKET_ORIGIN}/messaging`;
```

> ⚠️ **Never include `/api` or `/api/v1` in the socket URL.** NestJS applies the global prefix to HTTP routes only, so `…/api/messaging` fails with `Invalid namespace`.

- **CORS:** the gateway allows `origin: '*'`, so the Vite dev server (`localhost:5173`) can connect straight to the backend. You don't need a Vite proxy.
- **HTTPS:** from an `https://` page, the API origin must also be `https://`. Socket.IO then uses `wss://` automatically, and browsers block mixed content.
- **Reverse proxy (deploys):** the proxy must forward WebSocket upgrades on `/socket.io/` (in nginx: `proxy_http_version 1.1`, plus `Upgrade` and `Connection` headers).

---

## 2. Install

```bash
cd Vemtap-Web
npm i socket.io-client@^4
```

---

## 3. Connect & authenticate (browser)

The token is the same JWT the REST client uses. It's stored in `localStorage` under `vemtap_access_token`, so read it with `getAccessToken()` from `src/services/api/client.ts`.

Create the socket **once per tab** as a module singleton (suggested file: `src/services/messagingSocket.ts`):

```ts
import { io, type Socket } from 'socket.io-client';
import { getAccessToken, getApiBaseUrl, hasApiConfig } from './api/client';
import { authService } from './authService';

let socket: Socket | null = null;
let activeThreadId: string | null = null;   // thread on screen right now

export function getMessagingSocket(): Socket | null {
  if (socket || !hasApiConfig() || !getAccessToken()) return socket;

  socket = io(`${new URL(getApiBaseUrl()).origin}/messaging`, {
    transports: ['websocket'],
    // A function, so every (re)connect reads the latest token from storage.
    auth: (cb) => cb({ token: getAccessToken() ?? '' }),
    reconnection: true,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 15_000,
  });

  // The server drops a bad or expired token without sending an error. Socket.IO
  // does NOT auto-reconnect after a server-side disconnect, so refresh and retry.
  socket.on('disconnect', async (reason) => {
    if (reason !== 'io server disconnect') return;
    try {
      await authService.refresh();          // writes the new token to localStorage
      socket?.connect();
    } catch {
      /* refresh failed: the REST layer fires SESSION_EXPIRED_EVENT, so sign out */
    }
  });

  return socket;
}

export function disposeMessagingSocket(): void {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
  activeThreadId = null;
}

export const setActiveThread = (id: string | null) => { activeThreadId = id; };
export const getActiveThread = () => activeThreadId;

export const joinThread    = (threadId: string) => socket?.emit('joinThread', { threadId });
export const leaveThread   = (threadId: string) => socket?.emit('leaveThread', { threadId });
export const emitTyping    = (threadId: string, isTyping: boolean) => socket?.emit('typing', { threadId, isTyping });
export const markRead      = (threadId: string, messageIds?: string[]) => socket?.emit('markRead', { threadId, messageIds });
export const markDelivered = (threadId: string, messageId: string) => socket?.emit('markDelivered', { threadId, messageId });
```

**What the server does on connect:**
- It joins this socket to `user_<yourUserId>`. That room carries `notification`, `threadDeleted` and your receipts.
- It marks you online and broadcasts the change.
- It moves every business message still in `SENT` on your threads to `DELIVERED`, and tells the business.

### Browser lifecycle

| When | Do |
| ---- | -- |
| The user is signed in (`AuthContext`) | Call `getMessagingSocket()` and bind the listeners (section 6) once, at app level. |
| The user signs out, or `SESSION_EXPIRED_EVENT` fires | Call `disposeMessagingSocket()` and clear the messaging queries from the cache. |
| `document.visibilitychange` → visible, or `window` `online` | If `!socket.connected`, call `socket.connect()`. On `connect`, refetch (section 4, step 7). |
| Several tabs are open | Each tab has its own socket. The server tracks presence per socket, so you stay online until the last tab closes. |

Unlike the mobile app, **don't disconnect when the tab is hidden**. Browsers keep WebSockets open in background tabs, and staying connected keeps delivery ticks and presence accurate.

---

## 4. Integration steps

1. **Connect** once the user is signed in (section 3).
2. **Thread list:** use `GET /customer/messaging/threads`, which replaces `MOBILE_THREADS` in the screens.
3. **Opening a thread** (`ConversationScreen` mount, or selecting a thread in the desktop list):
   1. Fetch history: `GET /customer/messaging/threads/:threadId`
   2. `setActiveThread(threadId)` and `joinThread(threadId)`
   3. Set `customerUnreadCount` to 0 in the cached list, so the badge clears straight away
   4. `markRead(threadId)` turns the business's ticks blue
   5. `POST /customer/messaging/threads/:threadId/read` saves the cleared badge
4. **Sending:** use **REST**, not the socket: `POST /customer/messaging/threads/:threadId/reply`. Add the returned message to the transcript.
5. **Listen** for the events in section 6 at app level, not per screen.
6. **Closing a thread** (unmount, or switching threads on desktop): `leaveThread(threadId)` and `setActiveThread(null)`.
7. **On every `connect`** (first connect and every reconnect):
   - Re-join the active thread.
   - Re-send `presence:subscribe`.
   - Refetch the thread list and the open transcript.
   - Send `markRead` for the open thread.

   Rooms don't survive a reconnect, and events sent while you were disconnected are lost.

---

## 5. Events you EMIT (client → server)

| Event                  | Payload                                                           | Ack (callback)                    | Purpose |
| ---------------------- | ----------------------------------------------------------------- | --------------------------------- | ------- |
| `joinThread`           | `{ threadId }`                                                    | `{ status: 'joined', threadId }`  | Join `thread_<id>` to receive `newMessage`, `messageUpdate` and `userTyping` for it. |
| `leaveThread`          | `{ threadId }`                                                    | `{ status: 'left', threadId }`    | Leave the thread room. |
| `typing`               | `{ threadId, isTyping: boolean }`                                 | none                              | The business receives it as `userTyping`. |
| `markDelivered`        | `{ threadId, messageId?: string, messageIds?: string[] }`         | none                              | Second grey tick for the business. Send it when their message arrives for a thread that is **not** open. Only moves `SENT` → `DELIVERED`. |
| `markRead`             | `{ threadId, messageIds?: string[] }`                             | none                              | Blue ticks for the business. Leave out `messageIds` to mark all of them. Moves `SENT`/`DELIVERED` → `READ`. |
| `presence:subscribe`   | `{ businessIds?: string[], userIds?: string[] }`                  | `{ users: {…}, businesses: {…} }` | Snapshot plus live `presence:update`. Customers follow `thread.businessId`. |
| `presence:unsubscribe` | `{ businessIds?: string[], userIds?: string[] }`                  | `{ ok: true }`                    | Stop live updates. |
| `presence:get`         | `{ businessIds?: string[], userIds?: string[] }`                  | `{ users: {…}, businesses: {…} }` | Snapshot only. Joins no room. |

- The server ignores `markDelivered` and `markRead` unless you're the thread's customer. They only affect business messages (`direction: 'OUTBOUND'`).
- `markRead` over the socket does **not** clear `customerUnreadCount`. Only `POST /threads/:id/read` clears it.
- Each presence snapshot entry has the shape `{ [id]: { isOnline: boolean, lastSeen: string | null } }`.

---

## 6. Events you LISTEN to (server → client)

| Event             | Arrives via                                  | Payload |
| ----------------- | -------------------------------------------- | ------- |
| `newMessage`      | `thread_<id>` (only while joined)            | `Message` (section 8) |
| `notification`    | `user_<yourId>` (always)                     | `{ type: 'new_message', title: 'New Message', body /* first 50 chars */, threadId, message: Message }` |
| `messageUpdate`   | `thread_<id>`                                | Edit: `{ id, content, isEdited: true, type: 'EDIT', threadId }`<br>Delete: `{ id, isDeleted: true, type: 'DELETE', threadId }` |
| `messageStatus`   | `thread_<id>` + `user_<yourId>`              | `{ threadId, messageId, messageIds: string[], status: 'DELIVERED' }` |
| `messageRead`     | `thread_<id>` + `user_<yourId>`              | `{ threadId, messageId, messageIds: string[], status: 'READ' }` |
| `threadDeleted`   | `thread_<id>` + `user_<yourId>`              | `{ threadId }` |
| `userTyping`      | `thread_<id>`                                | `{ userId, threadId, isTyping: boolean }` |
| `presence:update` | `presence:business:<id>` (while subscribed)  | `{ kind: 'business' \| 'user', id, isOnline: boolean, lastSeen: string \| null }` |

`inboxUpdate` is **staff-only**, so customers never receive it.

### Handling rules

1. **Dedupe by `message.id`.** A business reply in the open thread arrives twice: once as `newMessage` and once inside `notification`. Keep a `Set` of the last ~200 ids.
2. **`notification.message` is the message.** For threads that aren't open it's the only copy you get, so feed it through the same handler as `newMessage`.
3. **Ack by direction:** `OUTBOUND` means the business wrote it. Send `markRead` if its thread is open, otherwise `markDelivered`. `INBOUND` means you wrote it, so never ack it.
4. **Receipts only move forward:** `SENT (1) < DELIVERED (2) < READ (3)`. Use `messageIds`, falling back to `[messageId]`.
5. **Deleted messages** show the content `"Message deleted"`.

### App-level bridge (suggested `src/hooks/useCustomerMessagingRealtime.ts`)

Mount this once inside the signed-in customer shell. It updates the TanStack Query cache (`src/services/queryClient.ts`), so screens just read queries.

```ts
import { useEffect } from 'react';
import { queryClient } from '../services/queryClient';
import { getMessagingSocket, getActiveThread, joinThread, markRead, markDelivered } from '../services/messagingSocket';

const keys = {
  all: ['customerMessaging'] as const,
  threads: () => ['customerMessaging', 'threads'] as const,
  messages: (threadId: string) => ['customerMessaging', 'messages', threadId] as const,
};
const RANK: Record<string, number> = { SENT: 1, DELIVERED: 2, READ: 3 };

export function useCustomerMessagingRealtime(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const socket = getMessagingSocket();
    if (!socket) return;
    const seen = new Set<string>();

    const onMessage = (m: Message) => {
      if (!m?.id || !m.threadId || seen.has(m.id)) return;
      seen.add(m.id);
      if (seen.size > 200) seen.delete(seen.values().next().value!);

      const isOpen = getActiveThread() === m.threadId;
      if (isOpen) {
        queryClient.setQueryData<Message[]>(keys.messages(m.threadId), (rows = []) =>
          rows.some((r) => r.id === m.id) ? rows : [...rows, m]);
      }
      queryClient.setQueryData<Thread[]>(keys.threads(), (rows) => rows?.map((t) => {
        if (t.id !== m.threadId) return t;
        const unread = (t.customerUnreadCount ?? 0) + (m.direction === 'OUTBOUND' && !isOpen ? 1 : 0);
        return { ...t, lastMessageContent: m.content, lastActivityAt: m.createdAt,
                 customerUnreadCount: unread, categories: threadCategoriesFor(t, unread) };
      }));
      if (m.direction === 'OUTBOUND') {
        isOpen ? markRead(m.threadId, [m.id]) : markDelivered(m.threadId, m.id);
      }
    };

    const onReceipt = (r: { threadId: string; messageId?: string; messageIds?: string[]; status: string }) => {
      const ids = new Set(r.messageIds ?? (r.messageId ? [r.messageId] : []));
      queryClient.setQueryData<Message[]>(keys.messages(r.threadId), (rows) => rows?.map((m) =>
        ids.has(m.id) && (RANK[r.status] ?? 0) > (RANK[m.status] ?? 0) ? { ...m, status: r.status } : m));
    };

    const onUpdate = (u: { id: string; threadId: string; type: 'EDIT' | 'DELETE'; content?: string }) => {
      queryClient.setQueryData<Message[]>(keys.messages(u.threadId), (rows) => rows?.map((m) =>
        m.id !== u.id ? m : u.type === 'DELETE'
          ? { ...m, content: 'Message deleted', isDeleted: true }
          : { ...m, content: u.content ?? m.content, isEdited: true }));
      queryClient.invalidateQueries({ queryKey: keys.threads() });
    };

    const onThreadDeleted = ({ threadId }: { threadId: string }) => {
      queryClient.removeQueries({ queryKey: keys.messages(threadId) });
      queryClient.invalidateQueries({ queryKey: keys.threads() });
    };

    const onConnect = () => {
      const active = getActiveThread();
      if (active) { joinThread(active); markRead(active); }
      queryClient.invalidateQueries({ queryKey: keys.all });
    };

    const onNotification = (n: { message?: Message }) => { if (n?.message) onMessage(n.message); };
    const onRead = (r: Parameters<typeof onReceipt>[0]) => onReceipt({ ...r, status: 'READ' });

    socket.on('newMessage', onMessage);
    socket.on('notification', onNotification);
    socket.on('messageStatus', onReceipt);
    socket.on('messageRead', onRead);
    socket.on('messageUpdate', onUpdate);
    socket.on('threadDeleted', onThreadDeleted);
    socket.on('connect', onConnect);

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !socket.connected) socket.connect();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onVisible);

    return () => {
      socket.off('newMessage', onMessage);
      socket.off('notification', onNotification);
      socket.off('messageStatus', onReceipt);
      socket.off('messageRead', onRead);
      socket.off('messageUpdate', onUpdate);
      socket.off('threadDeleted', onThreadDeleted);
      socket.off('connect', onConnect);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onVisible);
    };
  }, [enabled]);
}
```

Scope the query keys by account (for example, add the user's id) so another account in the same browser never sees cached threads. The mobile app keys by `uniqueCode`.

---

## 7. Features to build (matching the mobile app)

### 7.1 Message ticks (sent / delivered / read)

Ticks appear on **your own** messages only (`direction === 'INBOUND'` for the customer).

| Backend `status`                          | UI state    | Icon (`Icon.tsx` / Material Symbols) | Colour        | Meaning |
| ----------------------------------------- | ----------- | ------------------------------------ | ------------- | ------- |
| `PENDING`, `QUEUED`, `FAILED`, `REJECTED` | `pending`   | `schedule` (clock)                   | grey          | Not sent yet |
| `SENT` (and any unknown value)            | `sent`      | `check` (✓)                          | grey          | Server has it |
| `DELIVERED`                               | `delivered` | `done_all` (✓✓)                      | grey          | Reached a staff device |
| `READ`                                    | `read`      | `done_all` (✓✓)                      | brand primary | A staff member opened the chat |

```ts
export type BubbleStatus = 'pending' | 'sent' | 'delivered' | 'read';
export function bubbleStatusOf(status?: string | null): BubbleStatus {
  if (status === 'PENDING' || status === 'QUEUED' || status === 'FAILED' || status === 'REJECTED') return 'pending';
  if (status === 'READ') return 'read';
  if (status === 'DELIVERED') return 'delivered';
  return 'sent';
}
```

How a message moves through the ticks:
1. You send it, and the `/reply` response is the saved message, usually `SENT` (**✓ grey**).
2. A staff device receives it, or a staff member comes online, and `messageStatus` `DELIVERED` arrives (**✓✓ grey**).
3. A staff member opens the thread, and `messageRead` `READ` arrives (**✓✓ blue**).
4. Receipts also reach your `user_<id>` room, so ticks stay correct when the chat isn't open.
5. Never move a status backwards.

For accessibility, give each icon `aria-label` / `title` text: `Sending`, `Sent`, `Delivered`, `Read`.

Your acks drive the business's ticks. If the web client skips `markDelivered` and `markRead`, the merchant sees single ticks forever.

### 7.2 Online / offline and last seen

- A business is **online** while any of its staff has a `/messaging` socket open. Customers follow `thread.businessId`.
- **Chat header:** show `Active now` when online, otherwise `Last seen <time>`, or `Offline` when `lastSeen` is `null`. Until the thread has loaded, show the neutral reply line instead of saying "Offline".
- **Thread list:** show a green dot for each online row. Send one `presence:subscribe` with every visible `businessId`.
- Re-send `presence:subscribe` on every `connect`, or presence freezes after a reconnect.
- The mobile list and conversation can't both be mounted, but on **desktop** the list and the open chat are visible together. **Reference-count** subscriptions and only `presence:unsubscribe` an id when nothing on screen still uses it. Port `usePresence.ts` from the mobile app; it has no React Native dependencies.
- `lastSeen` formatting: under 1 min shows `just now`, under 1 h `5 min ago`, under 24 h `3h ago`, under 7 days `2d ago`, older `Oct 14, 10:42 AM`.
- Presence lives in server memory. After a server restart `lastSeen` is `null` until the business reconnects.

```ts
socket.emit('presence:subscribe', { businessIds }, (snap) => setStatuses(snap.businesses));
socket.on('presence:update', ({ kind, id, isOnline, lastSeen }) => {
  if (kind === 'business') setStatus(id, { isOnline, lastSeen });
});
```

### 7.3 Typing indicator

- **Send:** on the composer `<input>`/`<textarea>` `onChange`, emit `typing` with `isTyping: true` when the text isn't empty. Debounce `isTyping: false` to about 3 s after the last keystroke, and also emit it on send and on blur.
- **Receive:** `userTyping` shows "typing…" under the business name while the thread is open. Clear it after about 5 s with no update, in case the `false` event never arrives.
- The mobile customer app doesn't have this yet. The business app already sends it, so the web customer can show it immediately.

### 7.4 Unread counts and the badge

- Each thread row has `customerUnreadCount`. Show a per-row badge, a total in the hub header and nav, and a count on the Unread chip.
- **Opening a chat:** follow section 4, step 3, in order. Without the REST `/read` call the badge comes back on the next fetch.
- **A business message for a closed chat:** add 1 to the count and update the snippet, time and `categories`.
- **A business message for the open chat:** don't change the count. Append the message and send `markRead`.
- Optional: put the unread total in `document.title`, for example `(3) Vemtap`.

### 7.5 Thread list filters

The chips are `All · Unread · Deals · Bookings`, plus a search box over business name and snippet. Recompute `categories` the same way the server does whenever you patch a row:

```ts
export function threadCategoriesFor(t: Thread, unread: number): string[] {
  const c: string[] = [];
  if (unread > 0) c.push('unread');
  if (t.subjectType === 'DEAL' || t.subjectType === 'CLAIM') c.push('deals');
  else if (t.subjectType === 'BOOKING' || t.subjectType === 'ORDER') c.push('bookings');
  return c;
}
```

### 7.6 Images

1. Add `<input type="file" accept="image/jpeg,image/png,image/webp">` behind the attachment button (`src/scripts/desktop/MessagesAttachmentButton.tsx`). On mobile widths you can add `capture="environment"` to offer the camera.
2. Check the file client-side: JPG/PNG/WebP only, 10 MB or less.
3. Upload with the existing helper: `uploadFile<{ url: string }>('/customer/messaging/media', file)` (from `src/services/api/client.ts`, field `file`).
4. Show a preview on the composer. Don't send yet, so the user can add a caption.
5. Send `POST /threads/:id/reply` with `{ content, mediaUrl }`. The caption is optional when an image is attached.
6. Render `message.mediaUrl` as an `<img>` above the bubble text.

### 7.7 Starting a chat

`POST /threads/start` with `{ branchId, content, subjectType }` creates the thread and sends the first message:
- Use `subjectType: 'GENERAL'` by default. Use `DEAL`/`CLAIM`/`ORDER` with `claimId`/`orderId` when the chat was opened from a deal or order (for example `ContactBusinessSheet` / `ContactBusinessModal`, or the desktop `MessagesSelectRecipientModal`).
- Keep the draft until the call succeeds.
- Then open the returned `threadId` as normal.
- When the thread has a `claimId`, show the linked-deal card at the top.

### 7.8 Edit, delete and quoting

- Edit with `PATCH /messages/:id` and delete with `DELETE /messages/:id`. Both work only on your own messages and both broadcast `messageUpdate`.
- Quote by sending `replyToId` on `/reply`. The message comes back with `replyTo`.
- A natural place for the actions is `src/scripts/desktop/MessagesChatActions.tsx` (hover menu or right-click). The mobile app doesn't expose these yet.

### 7.9 Timestamps and scrolling

- Use `message.timestamp`, falling back to `createdAt`.
- Bubble time looks like `10:42 AM`.
- Day separators read `Today`, `Yesterday` or `Oct 14`, shown above the first message and wherever the day changes.
- Scroll to the newest message on load, on send and when a message arrives. If the user has scrolled up to read history, show a "new messages" pill instead of jumping.

---

## 8. `Message` and `Thread` shapes

```ts
interface Message {
  id: string;
  threadId: string;
  branchId: string;
  customerId: string;
  content: string;
  channel: 'IN_HOUSE' | string;
  direction: 'INBOUND' | 'OUTBOUND';   // INBOUND = customer → business, OUTBOUND = business → customer
  status: 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'REJECTED';
  from: string | null;
  to: string | null;
  replyToId: string | null;
  replyTo?: Message | null;
  mediaUrl?: string | null;
  mediaMimeType?: string | null;
  metadata?: Record<string, unknown>;
  isEdited: boolean;
  isDeleted: boolean;
  timestamp: string;
  createdAt: string;
}

interface Thread {
  id: string;
  branchId: string;
  businessId: string;                 // use this for presence
  customerId: string;
  lastMessageContent: string;
  lastActivityAt: string;
  customerUnreadCount: number;
  subjectType: 'GENERAL' | 'DEAL' | 'CLAIM' | 'ORDER' | 'BOOKING';
  categories?: string[];              // 'unread' | 'deals' | 'bookings'
  claimId: string | null;
  orderId: string | null;
  branch?: { name?: string; phone?: string; code?: string };
  business?: { name?: string; phone?: string };
}
```

---

## 9. REST endpoints

All endpoints use the existing `api` client from `src/services/api/client.ts`, which adds the Bearer token and retries once after a token refresh. Paths are relative to `getApiBaseUrl()`, and each one requires the **CUSTOMER** role.

| Method   | Path                                         | Body                                                            | Web call |
| -------- | -------------------------------------------- | --------------------------------------------------------------- | -------- |
| `GET`    | `/customer/messaging/threads`                | `?branchId=` creates the thread if missing                      | `api.get<Thread[]>(…)` |
| `POST`   | `/customer/messaging/threads/start`          | `{ branchId, content, subjectType?, claimId?, orderId? }`       | `api.post(…)` |
| `GET`    | `/customer/messaging/threads/:threadId`      | none                                                            | `api.get<Message[]>(…)` |
| `POST`   | `/customer/messaging/threads/:threadId/reply`| `{ content, replyToId?, metadata?, mediaUrl?, mediaMimeType? }` | `api.post<Message>(…)` |
| `POST`   | `/customer/messaging/threads/:threadId/read` | none                                                            | `api.post(…)` |
| `DELETE` | `/customer/messaging/threads/:threadId`      | none                                                            | `api.del(…)` |
| `PATCH`  | `/customer/messaging/messages/:id`           | `{ content }`                                                   | `api.patch(…)` |
| `DELETE` | `/customer/messaging/messages/:id`           | none                                                            | `api.del(…)` |
| `POST`   | `/customer/messaging/media`                  | multipart `file` (JPG/PNG/WebP, max 10 MB) → `{ url }`          | `uploadFile<{ url: string }>(…, file)` |

Suggested file: `src/services/messagingService.ts`, in the same style as the other services. Export it from `src/services/index.ts`.

---

## 10. Suggested file layout

```
Vemtap-Web/src/
├── services/
│   ├── messagingService.ts           # REST calls (section 9)
│   └── messagingSocket.ts            # socket singleton + emit helpers (section 3)
├── hooks/
│   ├── useCustomerMessaging.ts       # useQuery/useMutation for threads, messages, reply, read, start
│   ├── useCustomerMessagingRealtime.ts  # app-level event bridge (section 6)
│   └── usePresence.ts                # ref-counted presence (section 7.2)
└── scripts/
    ├── MessagesScreen.tsx            # swap MOBILE_THREADS → useCustomerThreads()
    ├── ConversationScreen.tsx        # swap mock → useCustomerThreadMessages(threadId)
    └── desktop/DesktopMessagesScreen.tsx
```

Mount `useCustomerMessagingRealtime(isSignedIn)` once near the top of `App.tsx` for the customer shell. On sign-out, call `disposeMessagingSocket()` and `queryClient.removeQueries({ queryKey: ['customerMessaging'] })`.

---

## 11. Troubleshooting

| Symptom | Cause / fix |
| ------- | ----------- |
| `Invalid namespace` | The URL contains `/api` or `/api/v1`. Use `new URL(getApiBaseUrl()).origin + '/messaging'`. |
| Connects, then drops at once, with no auto-reconnect | The token is bad or expired, so the server disconnected (`reason: 'io server disconnect'`). Refresh with `authService.refresh()`, then call `socket.connect()`. |
| Mixed content / blocked `ws://` | The page is HTTPS but the API URL is HTTP. Use an `https://` API origin. |
| Works locally, fails after deploy | The proxy isn't forwarding WebSocket upgrades on `/socket.io/`. |
| No `newMessage` in the open chat | You didn't call `joinThread`, or didn't re-join after a reconnect. `notification` still arrives. |
| Unread count goes up by 2 | You aren't deduping `newMessage` and `notification` by id. |
| Badge reappears after opening a chat | You only emitted `markRead`. Also call `POST /threads/:id/read`. |
| Ticks go from blue back to grey | You applied a late `DELIVERED` after `READ`. Only move status forward. |
| Presence frozen after Wi-Fi drop | You aren't re-sending `presence:subscribe` on `connect`. |
| Duplicate listeners / double events | The bridge is mounted per screen or under StrictMode without cleanup. Mount it once and `off` the listeners in cleanup. |
