import { SessionOutput } from "./dtos/session-output.dto";

export abstract class ListSessionsUseCase {
  public abstract execute(credentialId: number): Promise<SessionOutput[]>;
}
