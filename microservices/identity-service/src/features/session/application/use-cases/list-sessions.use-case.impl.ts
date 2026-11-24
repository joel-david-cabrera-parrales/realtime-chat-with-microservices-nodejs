import { SessionRepository } from "../../domain/repositories/session.repository";
import { SessionOutput } from "../../domain/use-cases/dtos/session-output.dto";
import { ListSessionsUseCase } from "../../domain/use-cases/list-sessions.use-case";
import { DomainEvent } from "../../../../shared/domain/events/domain-event";
import { DomainEventResult } from "../../../../shared/domain/events/domain-event-result";

export class ListSessionsUseCaseImpl extends ListSessionsUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {
    super();
  }

  public async execute(credentialId: number): Promise<DomainEventResult<SessionOutput[]>> {
    const sessions = await this.sessionRepository.findByCredentialId(credentialId);

    const output: SessionOutput[] = [];
    const events: DomainEvent[] = [];

    for (const session of sessions) {
      if (session.expireIfNeeded()) {
        await this.sessionRepository.save(session);
      }

      output.push(session.toPrimitives());
      events.push(...session.pullEvents());
    }

    return { output, events };
  }
}
