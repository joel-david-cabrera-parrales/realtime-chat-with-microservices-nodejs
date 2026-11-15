export const CHAT_EVENT_NAMES = {
  messageCreated: "chat.message.created",
  messageUpdated: "chat.message.updated",
  messageDeleted: "chat.message.deleted",
  messageDelivered: "chat.message.delivered",
  messageRead: "chat.message.read",
  conversationCreated: "chat.conversation.created",
  conversationRenamed: "chat.conversation.renamed",
  conversationDeleted: "chat.conversation.deleted",
  participantAdded: "chat.conversation.participant.added",
  participantRemoved: "chat.conversation.participant.removed",
  participantLeft: "chat.conversation.participant.left",
} as const;

export const SOCKET_EVENT_NAMES = {
  presenceOnline: "chat.presence.online",
  presenceOffline: "chat.presence.offline",
  typing: "chat.typing",
  typingStop: "chat.typing.stopped",
} as const;
