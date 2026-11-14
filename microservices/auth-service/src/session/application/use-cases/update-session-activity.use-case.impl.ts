import { SessionNotFoundException } from "../../domain/exceptions/session-not-found.exception";
import { SessionRepository } from "../../domain/repositories/session.repository";
import { SessionOutput } from "../../domain/use-cases/dtos/session-output.dto";
import { UpdateSessionActivityUseCase } from "../../domain/use-cases/update-session-activity.use-case";
import { SessionId } from "../../domain/value-objects/session-id.value-object";
import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";

export class UpdateSessionActivityUseCaseImpl extends UpdateSessionActivityUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {
    super();
  }

  public async execute(id: string): Promise<DomainEventResult<SessionOutput>> {
    const sessionId = SessionId.create(id);
    const session = await this.sessionRepository.findById(sessionId);

    if (session === null) {
      throw new SessionNotFoundException(id);
    }

    session.touch();

    await this.sessionRepository.save(session);

    return {
      output: session.toPrimitives(),
      events: session.pullEvents(),
    };
  }
}
