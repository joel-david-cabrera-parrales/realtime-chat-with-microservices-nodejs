import { SessionOutput } from "./dtos/session-output.dto";

export abstract class UpdateSessionActivityUseCase {
  public abstract execute(id: string): Promise<SessionOutput>;
}
