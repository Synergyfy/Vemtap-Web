import type { Socket } from 'socket.io-client';
import { authService } from './authService';
import { getAccessToken, hasApiConfig } from './api/client';
import { socketService } from './socketService';

let activeThreadId: string | null = null;

const socketMeta = (socket: Socket) => socket as Socket & { __vemtapMessagingBound?: boolean };

const buildAuthPayload = () => {
  const token = getAccessToken() ?? '';
  return {
    token,
    Authorization: token ? `Bearer ${token}` : undefined,
  };
};

export function getMessagingSocket(): Socket | null {
  if (!hasApiConfig() || !getAccessToken()) {
    return null;
  }

  const socket = socketService.getSocket('/messaging') ?? socketService.connect('/messaging');
  if (!socket) {
    return null;
  }

  const trackedSocket = socketMeta(socket);
  trackedSocket.auth = buildAuthPayload();

  if (!trackedSocket.__vemtapMessagingBound) {
    trackedSocket.on('connect', () => {
      if (activeThreadId) {
        socket.emit('joinThread', { threadId: activeThreadId });
        socket.emit('presence:subscribe', { businessIds: [activeThreadId] });
      }
    });

    trackedSocket.on('disconnect', async (reason) => {
      if (reason !== 'io server disconnect') return;
      try {
        await authService.refresh();
        socket.connect();
      } catch {
        // The REST layer handles the authenticated session expiry flow.
      }
    });

    trackedSocket.__vemtapMessagingBound = true;
  }

  return socket;
}

export function disposeMessagingSocket(): void {
  socketService.disconnect('/messaging');
  activeThreadId = null;
}

export const setActiveThread = (id: string | null) => {
  activeThreadId = id;
  if (!id) return;
  const socket = getMessagingSocket();
  if (socket && socket.connected) {
    socket.emit('joinThread', { threadId: id });
  }
};

export const getActiveThread = () => activeThreadId;

export const joinThread = (threadId: string) => {
  setActiveThread(threadId);
  const socket = getMessagingSocket();
  if (!socket) return;
  socket.emit('joinThread', { threadId });
};

export const leaveThread = (threadId: string) => {
  const socket = getMessagingSocket();
  if (!socket) return;
  socket.emit('leaveThread', { threadId });
  if (activeThreadId === threadId) {
    activeThreadId = null;
  }
};

export const emitTyping = (threadId: string, isTyping: boolean) => {
  const socket = getMessagingSocket();
  if (!socket) return;
  socket.emit('typing', { threadId, isTyping });
};

export const markRead = (threadId: string, messageIds?: string[]) => {
  const socket = getMessagingSocket();
  if (!socket) return;
  socket.emit('markRead', { threadId, messageIds });
};

export const markDelivered = (threadId: string, messageId?: string, messageIds?: string[]) => {
  const socket = getMessagingSocket();
  if (!socket) return;
  socket.emit('markDelivered', { threadId, messageId, messageIds });
};

export const messagingSocket = {
  connect: () => getMessagingSocket(),
  disconnect: () => disposeMessagingSocket(),
  getSocket: () => getMessagingSocket(),
  setActiveThread,
  getActiveThread,
  joinThread,
  leaveThread,
  emitTyping,
  markRead,
  markDelivered,
};
