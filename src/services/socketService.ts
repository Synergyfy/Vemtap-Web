import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from './api/client';

export type SocketNamespace = '/' | '/messaging' | '/support' | '/notifications' | '/pos';

type SocketEventHandler = (...args: any[]) => void;

const SOCKET_NAMESPACES: SocketNamespace[] = ['/', '/messaging', '/support', '/notifications', '/pos'];
const sockets = new Map<SocketNamespace, Socket>();

const normalizeBaseUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('ws://') || trimmed.startsWith('wss://')) {
    return trimmed.replace(/\/+$/, '');
  }

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed.replace(/\/+$/, '');
  }

  const parsed = new URL(trimmed);
  const origin = `${parsed.protocol === 'https:' ? 'wss:' : 'ws:'}//${parsed.host}`;
  const pathname = parsed.pathname.replace(/\/api\/v\d+$/i, '').replace(/\/api$/i, '');

  return `${origin}${pathname === '/' ? '' : pathname}`.replace(/\/+$/, '');
};

const readConfiguredSocketBaseUrl = () => {
  const configured =
    (import.meta.env.VITE_WS_BASE_URL ??
      import.meta.env.VITE_SOCKET_BASE_URL ??
      import.meta.env.EXPO_PUBLIC_WS_BASE_URL ??
      '') as string;

  if (configured) return normalizeBaseUrl(configured);

  const apiBaseUrl =
    (import.meta.env.VITE_API_BASE_URL ??
      import.meta.env.EXPO_PUBLIC_API_BASE_URL ??
      '') as string;

  return normalizeBaseUrl(apiBaseUrl);
};

const getNamespaceUrl = (namespace: SocketNamespace) => {
  const baseUrl = readConfiguredSocketBaseUrl();
  if (!baseUrl) return '';

  const suffix = namespace === '/' ? '' : namespace;
  return `${baseUrl}${suffix}`;
};

const getSocketAuth = () => {
  const token = getAccessToken();
  return {
    token: token ?? '',
    Authorization: token ? `Bearer ${token}` : undefined,
  };
};

const createSocket = (namespace: SocketNamespace) => {
  const url = getNamespaceUrl(namespace);
  if (!url) return null;

  const socket = io(url, {
    autoConnect: false,
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 6,
    timeout: 10000,
    auth: getSocketAuth(),
  });

  socket.on('connect', () => {
    console.info(`Socket connected to ${namespace}`);
  });

  socket.on('connect_error', (error: Error) => {
    console.warn(`Socket connection failed for ${namespace}:`, error.message);
  });

  socket.on('disconnect', (reason: string) => {
    console.info(`Socket disconnected from ${namespace}: ${reason}`);
  });

  sockets.set(namespace, socket);
  return socket;
};

export const socketService = {
  getBaseUrl: () => readConfiguredSocketBaseUrl(),
  hasConfig: () => Boolean(readConfiguredSocketBaseUrl()),
  connect: (namespace: SocketNamespace = '/messaging') => {
    if (SOCKET_NAMESPACES.includes(namespace) === false) {
      return null;
    }

    let socket = sockets.get(namespace);
    if (!socket) {
      const nextSocket = createSocket(namespace);
      if (!nextSocket) return null;
      socket = nextSocket;
    }

    if (!socket) {
      return null;
    }

    if (socket.disconnected) {
      socket.auth = getSocketAuth();
      socket.connect();
    }

    return socket;
  },
  disconnect: (namespace: SocketNamespace = '/messaging') => {
    const socket = sockets.get(namespace);
    if (!socket) return;
    socket.disconnect();
    sockets.delete(namespace);
  },
  disconnectAll: () => {
    SOCKET_NAMESPACES.forEach((namespace) => socketService.disconnect(namespace));
  },
  isConnected: (namespace: SocketNamespace = '/messaging') => {
    const socket = sockets.get(namespace);
    return Boolean(socket && socket.connected);
  },
  getSocket: (namespace: SocketNamespace = '/messaging') => sockets.get(namespace) ?? null,
  on: (namespace: SocketNamespace, event: string, handler: SocketEventHandler) => {
    const socket = socketService.connect(namespace);
    if (!socket) return () => undefined;
    socket.on(event, handler);
    return () => socket.off(event, handler);
  },
  emit: (namespace: SocketNamespace, event: string, payload?: unknown) => {
    const socket = socketService.connect(namespace);
    if (!socket) return false;
    socket.emit(event, payload);
    return true;
  },
};

export default socketService;
