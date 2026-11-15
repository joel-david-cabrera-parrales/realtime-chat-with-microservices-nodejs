import { ConversationCode } from "../value-objects/conversation-code.value-object";
import { CredentialCode } from "../value-objects/credential-code.value-object";
import { MessageCode } from "../value-objects/message-code.value-object";
import { MessageContent } from "../value-objects/message-content.value-object";
import { MessageStatusValue } from "../value-objects/message-status.value-object";

export interface MessageProps {
  code: MessageCode;
  conversationCode: ConversationCode;
  senderCredentialCode: CredentialCode;
  content: MessageContent;
  status: MessageStatusValue;
  deliveredAt: Date | undefined;
  readAt: Date | undefined;
  editedAt: Date | undefined;
  deletedAt: Date | undefined;
  deletedBy: CredentialCode | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageProps {
  conversationCode: string;
  senderCredentialCode: string;
  content: string;
}

export interface RehydrateMessageProps {
  code: string;
  conversationCode: string;
  senderCredentialCode: string;
  content: string;
  status: string;
  deliveredAt: Date | null;
  readAt: Date | null;
  editedAt: Date | null;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessagePrimitives {
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
