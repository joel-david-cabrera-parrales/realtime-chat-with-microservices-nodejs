export interface MessageReceiptOutput {
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
