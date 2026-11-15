export interface SendMessageInput {
  conversationCode: string;
  senderCredentialCode: string;
  content: string;
}

export interface GetMessageInput {
  code: string;
  actorCredentialCode: string;
}

export interface ListMessagesInput {
  conversationCode: string;
  actorCredentialCode: string;
  cursor?: string | undefined;
  limit?: number | undefined;
}

export interface EditMessageInput {
  code: string;
  actorCredentialCode: string;
  content: string;
}

export interface DeleteMessageInput {
  code: string;
  actorCredentialCode: string;
}

export interface MarkMessageDeliveredInput {
  code: string;
  actorCredentialCode: string;
}

export interface MarkMessageReadInput {
  code: string;
  actorCredentialCode: string;
}

export interface MessageOutput {
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

export interface MessageListOutput {
  messages: MessageOutput[];
  nextCursor: string | null;
}
