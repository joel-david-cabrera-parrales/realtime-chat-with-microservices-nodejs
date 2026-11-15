export interface CreateConversationInput {
  type: string;
  title?: string | undefined;
  participantCredentialCodes: string[];
  createdBy: string;
}

export interface GetConversationInput {
  code: string;
  actorCredentialCode: string;
}

export interface ListConversationsInput {
  actorCredentialCode: string;
  cursor?: string | undefined;
  limit?: number | undefined;
}

export interface AddParticipantInput {
  conversationCode: string;
  actorCredentialCode: string;
  participantCredentialCode: string;
}

export interface RemoveParticipantInput {
  conversationCode: string;
  actorCredentialCode: string;
  participantCredentialCode: string;
}

export interface LeaveConversationInput {
  conversationCode: string;
  actorCredentialCode: string;
}

export interface RenameConversationInput {
  conversationCode: string;
  actorCredentialCode: string;
  title: string;
}

export interface DeleteConversationInput {
  conversationCode: string;
  actorCredentialCode: string;
}

export interface ParticipantOutput {
  credentialCode: string;
  role: string;
  status: string;
  joinedAt: string;
  leftAt: string | null;
}

export interface ConversationOutput {
  code: string;
  type: string;
  title: string | null;
  participants: ParticipantOutput[];
  createdBy: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ConversationListOutput {
  conversations: ConversationOutput[];
  nextCursor: string | null;
}
