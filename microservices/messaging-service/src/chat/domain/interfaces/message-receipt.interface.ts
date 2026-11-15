import { ConversationCode } from "../value-objects/conversation-code.value-object";
import { CredentialCode } from "../value-objects/credential-code.value-object";
import { MessageCode } from "../value-objects/message-code.value-object";
import { MessageReceiptCode } from "../value-objects/message-receipt-code.value-object";
import { ReceiptStatusValue } from "../value-objects/receipt-status.value-object";

export interface MessageReceiptProps {
  code: MessageReceiptCode;
  messageCode: MessageCode;
  conversationCode: ConversationCode;
  credentialCode: CredentialCode;
  status: ReceiptStatusValue;
  deliveredAt: Date;
  readAt: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageReceiptProps {
  messageCode: string;
  conversationCode: string;
  credentialCode: string;
}

export interface RehydrateMessageReceiptProps {
  code: string;
  messageCode: string;
  conversationCode: string;
  credentialCode: string;
  status: string;
  deliveredAt: Date;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageReceiptPrimitives {
  code: string;
  messageCode: string;
  conversationCode: string;
  credentialCode: string;
  status: string;
  deliveredAt: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}
