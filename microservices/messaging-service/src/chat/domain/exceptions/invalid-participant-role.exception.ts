import { ChatDomainException } from "./chat-domain.exception";

export class InvalidParticipantRoleException extends ChatDomainException {
  constructor(value: string) {
    super("INVALID_PARTICIPANT_ROLE", `El rol de participante "${value}" no es válido`);
  }
}
