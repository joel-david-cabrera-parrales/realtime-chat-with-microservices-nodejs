import { ChatDomainException } from "./chat-domain.exception";

export class InvalidMessageReceiptCodeException extends ChatDomainException {
  constructor(value: string) {
    super("INVALID_MESSAGE_RECEIPT_CODE", `El código de acuse "${value}" no es válido`);
  }
}
