import { ChatDomainException } from "./chat-domain.exception";

export class ReceiptNotFoundException extends ChatDomainException {
  constructor(messageCode: string, credentialCode: string) {
    super("RECEIPT_NOT_FOUND", `No existe acuse del mensaje "${messageCode}" para la credencial "${credentialCode}"`);
  }
}
