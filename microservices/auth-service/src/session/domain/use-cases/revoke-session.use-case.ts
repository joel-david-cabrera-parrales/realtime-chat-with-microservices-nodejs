import { SessionOutput } from "./dtos/session-output.dto";

export abstract class RevokeSessionUseCase {
  public abstract execute(id: string): Promise<SessionOutput>;
}
