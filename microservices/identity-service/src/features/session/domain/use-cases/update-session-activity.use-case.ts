import { DomainEventResult } from "../../../../shared/domain/events/domain-event-result";
import { SessionOutput } from "./dtos/session-output.dto";

export abstract class UpdateSessionActivityUseCase {
  public abstract execute(id: string): Promise<DomainEventResult<SessionOutput>>;
}
