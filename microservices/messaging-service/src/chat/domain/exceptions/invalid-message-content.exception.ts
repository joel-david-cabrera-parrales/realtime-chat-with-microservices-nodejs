import { ChatDomainException } from "./chat-domain.exception";

export class InvalidMessageContentException extends ChatDomainException {
  constructor(value: string) {
    super("INVALID_MESSAGE_CONTENT", `El contenido del mensaje "${value}" no es válido`);
  }
}
