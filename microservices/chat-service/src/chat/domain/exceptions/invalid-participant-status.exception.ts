import { ChatDomainException } from "./chat-domain.exception";

export class InvalidParticipantStatusException extends ChatDomainException {
  constructor(value: string) {
    super("INVALID_PARTICIPANT_STATUS", `El estado de participante "${value}" no es válido`);
  }
}
