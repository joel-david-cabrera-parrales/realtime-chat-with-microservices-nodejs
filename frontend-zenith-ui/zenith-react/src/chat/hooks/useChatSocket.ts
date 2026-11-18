import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { env } from '@/shared/env';
import { authStorage } from '@/shared/storage/auth.storage';
import { SOCKET_EVENTS, SOCKET_PATH } from '../realtime/socket-events';

export interface UseChatSocketOptions {
  onTyping?: (payload: { conversationCode: string; credentialCode: string; isTyping: boolean }) => void;
  onPresenceOnline?: (payload: { credentialCode: string; conversationCode: string | null; since: string }) => void;
  onPresenceOffline?: (payload: { credentialCode: string; conversationCode: string; at: string }) => void;
  onMessageReceived?: (message: unknown) => void;
  onRealtimeEvent?: (eventName: string, payload: unknown) => void;
}

export interface UseChatSocketReturn {
  socket: Socket | null;
  connected: boolean;
  emitTyping: (conversationCode: string, isTyping: boolean) => void;
}

/** Socket.IO client for the authenticated messaging-service connection. */
export function useChatSocket(options: UseChatSocketOptions = {}): UseChatSocketReturn {
  const callbacksRef = useRef(options);
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    callbacksRef.current = options;
  }, [options]);

  const connect = useCallback(() => {
    if (socketRef.current) return;

    const token = authStorage.getToken();
    if (!token) return;

    const socket = io(env.API_BASE_URL, {
      path: SOCKET_PATH,
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (error) => {
      setConnected(false);
      console.error('[chat socket] connect_error:', error.message);
    });
    socket.onAny((eventName: string, payload: unknown) => {
      callbacksRef.current.onRealtimeEvent?.(eventName, payload);
    });

    socket.on(SOCKET_EVENTS.typing, (payload) => callbacksRef.current.onTyping?.(payload));
    socket.on(SOCKET_EVENTS.typingStopped, (payload) => callbacksRef.current.onTyping?.(payload));
    socket.on(SOCKET_EVENTS.presenceOnline, (payload) => callbacksRef.current.onPresenceOnline?.(payload));
    socket.on(SOCKET_EVENTS.presenceOffline, (payload) => callbacksRef.current.onPresenceOffline?.(payload));
    socket.on(SOCKET_EVENTS.messageCreated, (payload) => callbacksRef.current.onMessageReceived?.(payload));
    socket.on(SOCKET_EVENTS.messageUpdated, (payload) => callbacksRef.current.onMessageReceived?.(payload));

    socketRef.current = socket;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [connect]);

  const emitTyping = useCallback((conversationCode: string, isTyping: boolean) => {
    // The service expires typing state itself and emits chat.typing.stopped.
    if (!isTyping) return;
    socketRef.current?.emit(SOCKET_EVENTS.typingRequest, { conversationCode });
  }, []);

  return { socket: socketRef.current, connected, emitTyping };
}
