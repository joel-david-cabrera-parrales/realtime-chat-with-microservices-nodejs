export const SOCKET_PATH = '/api/chat/socket.io';

export const SOCKET_EVENTS = {
  typing: 'chat.typing',
  typingStopped: 'chat.typing.stopped',
  presenceOnline: 'chat.presence.online',
  presenceOffline: 'chat.presence.offline',
  messageCreated: 'chat.message.created',
  messageUpdated: 'chat.message.updated',
  typingRequest: 'chat:typing',
} as const;
