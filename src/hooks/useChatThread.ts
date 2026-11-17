import { useCallback, useEffect, useRef, useState } from 'react';
import { messageService, chatDayLabel, type MessageItem, type MessageThread, type MessageTick } from '../services/messageService';
import { emitTyping, joinThread, leaveThread, markRead, subscribeBusinessPresence, unsubscribeBusinessPresence } from '../services/messagingSocket';
import { useSessionUser } from './useSessionUser';

const TICK_ORDER: Record<MessageTick, number> = { failed: 0, pending: 1, sent: 2, delivered: 3, read: 4 };
const TYPING_IDLE_MS = 2000;
const TYPING_EXPIRE_MS = 5000;

const clock = (date: Date) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);

interface RealtimeDetail {
  type: string;
  payload: Record<string, unknown>;
}

/**
 * One live customer chat, shared by the desktop and mobile message pages:
 * history from `GET /customer/messaging/threads/:id`, sending through
 * `POST .../reply`, and the socket's messages, receipts, typing and presence.
 */
export function useChatThread(threadId: string | null | undefined) {
  const myId = useSessionUser().data?.id;
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(Boolean(threadId));
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const typingExpiry = useRef<number | undefined>(undefined);
  const typingIdle = useRef<number | undefined>(undefined);
  const iAmTyping = useRef(false);

  useEffect(() => {
    setThread(null);
    setMessages([]);
    setTyping(false);
    setOnline(null);
    if (!threadId) {
      setLoading(false);
      return;
    }
    let ignore = false;
    setLoading(true);
    joinThread(threadId);
    messageService
      .getThread(threadId)
      .then((next) => {
        if (ignore) return;
        setThread(next);
        setMessages(next?.messages ?? []);
        // Opening the chat reads what the business sent, so they see blue ticks.
        const unseen = (next?.messages ?? []).filter((message) => message.sender === 'merchant').map((message) => String(message.id));
        if (unseen.length) markRead(threadId, unseen);
        void messageService.markAsRead(threadId);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
      leaveThread(threadId);
    };
  }, [threadId]);

  const businessId = thread?.businessId;
  useEffect(() => {
    if (!businessId) return;
    subscribeBusinessPresence(businessId, setOnline);
    return () => unsubscribeBusinessPresence(businessId);
  }, [businessId]);

  useEffect(() => {
    if (!threadId) return;
    const onEvent = (event: Event) => {
      const { type, payload } = (event as CustomEvent<RealtimeDetail>).detail;
      if (type === 'presence:update') {
        if (payload.kind === 'business' && payload.id === businessId) setOnline(payload.isOnline === true);
        return;
      }
      if (payload.threadId !== threadId) return;

      if (type === 'newMessage') {
        const incoming = messageService.toMessage(payload, thread?.name);
        setTyping(false);
        setMessages((current) => {
          if (current.some((message) => message.id === incoming.id)) return current;
          // Our own message echoed back replaces its "sending" bubble.
          const local = incoming.sender === 'you' ? current.findIndex((message) => message.tick === 'pending' && message.body === incoming.body) : -1;
          if (local >= 0) return current.map((message, index) => (index === local ? incoming : message));
          return [...current, incoming];
        });
      }

      if (type === 'messageUpdate') {
        setMessages((current) =>
          current.map((message) =>
            message.id === payload.id
              ? payload.type === 'DELETE'
                ? { ...message, deleted: true, body: '', media: undefined }
                : { ...message, body: String(payload.content ?? message.body), edited: true }
              : message,
          ),
        );
      }

      if (type === 'messageStatus' || type === 'messageRead') {
        const ids = (Array.isArray(payload.messageIds) ? payload.messageIds : [payload.messageId]).map(String);
        const tick: MessageTick = type === 'messageRead' ? 'read' : 'delivered';
        setMessages((current) =>
          current.map((message) =>
            ids.includes(String(message.id)) && message.tick && TICK_ORDER[message.tick] < TICK_ORDER[tick] ? { ...message, tick } : message,
          ),
        );
      }

      if (type === 'userTyping' && payload.userId !== myId) {
        window.clearTimeout(typingExpiry.current);
        setTyping(payload.isTyping === true);
        if (payload.isTyping === true) typingExpiry.current = window.setTimeout(() => setTyping(false), TYPING_EXPIRE_MS);
      }
    };
    window.addEventListener('vemtap:messaging', onEvent);
    return () => {
      window.removeEventListener('vemtap:messaging', onEvent);
      window.clearTimeout(typingExpiry.current);
    };
  }, [threadId, businessId, myId, thread?.name]);

  const stopTyping = useCallback(() => {
    window.clearTimeout(typingIdle.current);
    if (iAmTyping.current && threadId) emitTyping(threadId, false);
    iAmTyping.current = false;
  }, [threadId]);

  /** Call as the customer types; the "stopped" signal follows by itself. */
  const notifyTyping = useCallback(() => {
    if (!threadId) return;
    if (!iAmTyping.current) emitTyping(threadId, true);
    iAmTyping.current = true;
    window.clearTimeout(typingIdle.current);
    typingIdle.current = window.setTimeout(stopTyping, TYPING_IDLE_MS);
  }, [threadId, stopTyping]);

  useEffect(() => stopTyping, [stopTyping]);

  /** Sends a message; resolves false when the API refused it. */
  const send = useCallback(
    async (text: string) => {
      const body = text.trim();
      if (!body || !threadId) return false;
      stopTyping();
      const now = new Date();
      const localId = `local-${now.getTime()}`;
      setMessages((current) => [
        ...current,
        { id: localId, sender: 'you', author: 'You', time: clock(now), day: chatDayLabel(now.toISOString()), body, tick: 'pending' },
      ]);
      try {
        const saved = messageService.toMessage(await messageService.sendReply(threadId, body), thread?.name);
        setMessages((current) => {
          // The socket's echo may have landed first.
          if (current.some((message) => message.id === saved.id)) return current.filter((message) => message.id !== localId);
          return current.map((message) => (message.id === localId ? saved : message));
        });
        return true;
      } catch {
        setMessages((current) => current.map((message) => (message.id === localId ? { ...message, tick: 'failed' } : message)));
        return false;
      }
    },
    [threadId, stopTyping, thread?.name],
  );

  /** Sends an image or PDF; resolves to the reason when it failed. */
  const sendFile = useCallback(
    async (file: File): Promise<string | null> => {
      if (!threadId) return 'This chat isn’t available.';
      const now = new Date();
      const localId = `local-${now.getTime()}`;
      setMessages((current) => [
        ...current,
        {
          id: localId,
          sender: 'you',
          author: 'You',
          time: clock(now),
          day: chatDayLabel(now.toISOString()),
          body: '',
          media: URL.createObjectURL(file),
          mediaType: file.type,
          tick: 'pending',
        },
      ]);
      try {
        const saved = messageService.toMessage(await messageService.sendFile(threadId, file), thread?.name);
        setMessages((current) => {
          if (current.some((message) => message.id === saved.id)) return current.filter((message) => message.id !== localId);
          return current.map((message) => (message.id === localId ? saved : message));
        });
        return null;
      } catch (error) {
        setMessages((current) => current.map((message) => (message.id === localId ? { ...message, tick: 'failed' } : message)));
        return error instanceof Error ? error.message : 'That file couldn’t be sent.';
      }
    },
    [threadId, thread?.name],
  );

  /** Resolves to the reason when the API refused the change. */
  const editMessage = useCallback(async (id: string, content: string): Promise<string | null> => {
    try {
      await messageService.editMessage(id, content);
      setMessages((current) => current.map((message) => (message.id === id ? { ...message, body: content, edited: true } : message)));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'This message couldn’t be edited.';
    }
  }, []);

  const deleteMessage = useCallback(async (id: string): Promise<string | null> => {
    try {
      await messageService.deleteMessage(id);
      setMessages((current) => current.map((message) => (message.id === id ? { ...message, deleted: true, body: '', media: undefined } : message)));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'This message couldn’t be deleted.';
    }
  }, []);

  return { thread, messages, loading, typing, online, send, sendFile, editMessage, deleteMessage, notifyTyping };
}
