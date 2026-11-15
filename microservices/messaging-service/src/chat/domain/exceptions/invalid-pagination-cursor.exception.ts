import { ChatDomainException } from "./chat-domain.exception";

export class InvalidPaginationCursorException extends ChatDomainException {
  constructor(value: string) {
    super("INVALID_PAGINATION_CURSOR", `El cursor de paginación "${value}" no es válido`);
  }
}
