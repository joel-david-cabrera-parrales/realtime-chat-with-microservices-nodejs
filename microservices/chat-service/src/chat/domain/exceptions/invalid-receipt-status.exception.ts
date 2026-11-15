import { ChatDomainException } from "./chat-domain.exception";

export class InvalidReceiptStatusException extends ChatDomainException {
  constructor(value: string) {
    super("INVALID_RECEIPT_STATUS", `El estado de acuse "${value}" no es válido`);
  }
}
