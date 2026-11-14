import { SessionRevokedEmailData } from "./dtos/session-email.dto";

export abstract class SendSessionRevokedEmailUseCase {
  public abstract execute(data: SessionRevokedEmailData): Promise<void>;
}
