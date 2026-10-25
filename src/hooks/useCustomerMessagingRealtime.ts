import { useEffect } from 'react';
import {
  getActiveThread,
  getMessagingSocket,
  joinThread,
  leaveThread,
  markDelivered,
  markRead,
  setActiveThread,
} from '../services/messagingSocket';

type MessagingRealtimeEvent =
  | 'connect'
  | 'newMessage'
  | 'notification'
  | 'messageStatus'
  | 'messageRead'
  | 'messageUpdate'
  | 'threadDeleted'
  | 'userTyping'
  | 'presence:update';

const dispatchRealtimeEvent = (type: MessagingRealtimeEvent, payload: unknown) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('vemtap:messaging', { detail: { type, payload } }));
};

export function useCustomerMessagingRealtime(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const socket = getMessagingSocket();
    if (!socket) return;

    const onMessage = (message: { id?: string; threadId?: string; direction?: 'INBOUND' | 'OUTBOUND'; content?: string }) => {
      if (!message?.id || !message?.threadId) return;
      dispatchRealtimeEvent('newMessage', message);

      const activeThreadId = getActiveThread();
      if (message.direction === 'OUTBOUND') {
        if (activeThreadId === message.threadId) {
          markRead(message.threadId, [message.id]);
        } else {
          markDelivered(message.threadId, message.id);
        }
      }
    };

    const onNotification = (notification: { message?: { id?: string; threadId?: string } }) => {
      if (notification?.message) {
        onMessage(notification.message);
      }
    };

    const onMessageStatus = (payload: unknown) => dispatchRealtimeEvent('messageStatus', payload);
    const onMessageRead = (payload: unknown) => dispatchRealtimeEvent('messageRead', payload);
    const onThreadDeleted = (payload: unknown) => dispatchRealtimeEvent('threadDeleted', payload);
    const onUserTyping = (payload: unknown) => dispatchRealtimeEvent('userTyping', payload);
    const onPresenceUpdate = (payload: unknown) => dispatchRealtimeEvent('presence:update', payload);
    const onConnect = () => {
      const activeThreadId = getActiveThread();
      if (activeThreadId) {
        joinThread(activeThreadId);
      }
      dispatchRealtimeEvent('connect', { activeThreadId });
    };

    socket.on('newMessage', onMessage);
    socket.on('notification', onNotification);
    socket.on('messageStatus', onMessageStatus);
    socket.on('messageRead', onMessageRead);
    socket.on('threadDeleted', onThreadDeleted);
    socket.on('userTyping', onUserTyping);
    socket.on('presence:update', onPresenceUpdate);
    socket.on('connect', onConnect);

    const onVisible = () => {
      if (document.visibilityState === 'visible' && socket.disconnected) {
        socket.connect();
      }
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onVisible);

    return () => {
      socket.off('newMessage', onMessage);
      socket.off('notification', onNotification);
      socket.off('messageStatus', onMessageStatus);
      socket.off('messageRead', onMessageRead);
      socket.off('threadDeleted', onThreadDeleted);
      socket.off('userTyping', onUserTyping);
      socket.off('presence:update', onPresenceUpdate);
      socket.off('connect', onConnect);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onVisible);
    };
  }, [enabled]);
}

export function useCustomerThreadBinding(threadId: string | null, enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      if (threadId) {
        leaveThread(threadId);
      }
      setActiveThread(null);
      return;
    }

    if (!threadId) {
      const activeThreadId = getActiveThread();
      if (activeThreadId) {
        leaveThread(activeThreadId);
      }
      setActiveThread(null);
      return;
    }

    setActiveThread(threadId);
    joinThread(threadId);

    return () => {
      leaveThread(threadId);
      if (getActiveThread() === threadId) {
        setActiveThread(null);
      }
    };
  }, [enabled, threadId]);
}
