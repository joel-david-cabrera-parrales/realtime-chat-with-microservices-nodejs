import { SessionDomainException } from "./session-domain.exception";

export class InvalidIpAddressException extends SessionDomainException {
  constructor() {
    super("INVALID_IP_ADDRESS", "La dirección IP no es válida");
  }
}
