import { SessionOutput } from "./dtos/session-output.dto";

export abstract class GetSessionUseCase {
  public abstract execute(id: string): Promise<SessionOutput | null>;
}
