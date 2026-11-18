export interface ParticipantDTO {
  credentialCode: string;
  role: string;
  status: string;
  joinedAt: string;
  leftAt: string | null;
}

export interface ConversationDTO {
  code: string;
  type: string;
  title: string | null;
  participants: ParticipantDTO[];
  createdBy: string;
  lastMessageAt: string | null;
  lastMessage?: {
    code: string;
    senderCredentialCode: string;
    content: string;
    createdAt: string;
  } | null;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ConversationListDTO {
  conversations: ConversationDTO[];
  nextCursor: string | null;
}

export interface MessageDTO {
  code: string;
  conversationCode: string;
  senderCredentialCode: string;
  content: string;
  status: string;
  deliveredAt: string | null;
  readAt: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageListDTO {
  messages: MessageDTO[];
  nextCursor: string | null;
}
