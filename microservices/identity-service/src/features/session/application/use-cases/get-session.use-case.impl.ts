import { SessionRepository } from "../../domain/repositories/session.repository";
import { SessionOutput } from "../../domain/use-cases/dtos/session-output.dto";
import { GetSessionUseCase } from "../../domain/use-cases/get-session.use-case";
import { SessionId } from "../../domain/value-objects/session-id.value-object";
import { DomainEventResult } from "../../../../shared/domain/events/domain-event-result";

export class GetSessionUseCaseImpl extends GetSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {
    super();
  }

  public async execute(id: string): Promise<DomainEventResult<SessionOutput | null>> {
    const session = await this.sessionRepository.findById(SessionId.create(id));

    if (session === null) {
      return { output: null, events: [] };
    }

    if (session.expireIfNeeded()) {
      await this.sessionRepository.save(session);
    }

    return {
      output: session.toPrimitives(),
      events: session.pullEvents(),
    };
  }
}
