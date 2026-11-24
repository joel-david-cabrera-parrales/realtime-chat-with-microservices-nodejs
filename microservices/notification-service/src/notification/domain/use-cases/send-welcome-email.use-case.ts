import { WelcomeEmailData } from "./dtos/session-email.dto";

export abstract class SendWelcomeEmailUseCase {
  public abstract execute(data: WelcomeEmailData): Promise<void>;
}