import { ChatDomainException } from "./chat-domain.exception";

export class InvalidDirectKeyException extends ChatDomainException {
  constructor(value: string) {
    super("INVALID_DIRECT_KEY", `La clave directa "${value}" no es válida`);
  }
}
