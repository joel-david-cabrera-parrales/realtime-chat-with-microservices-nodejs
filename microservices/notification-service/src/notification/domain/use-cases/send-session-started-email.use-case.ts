import { SessionCreatedEmailData } from "./dtos/session-email.dto";

export abstract class SendSessionStartedEmailUseCase {
  public abstract execute(data: SessionCreatedEmailData): Promise<void>;
}
