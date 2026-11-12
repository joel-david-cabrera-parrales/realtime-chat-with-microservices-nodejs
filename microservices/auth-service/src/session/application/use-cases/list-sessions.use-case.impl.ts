import { SessionRepository } from "../../domain/repositories/session.repository";
import { SessionOutput } from "../../domain/use-cases/dtos/session-output.dto";
import { ListSessionsUseCase } from "../../domain/use-cases/list-sessions.use-case";

export class ListSessionsUseCaseImpl extends ListSessionsUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {
    super();
  }

  public async execute(credentialId: number): Promise<SessionOutput[]> {
    const sessions = await this.sessionRepository.findByCredentialId(credentialId);

    for (const session of sessions) {
      if (session.expireIfNeeded()) {
        await this.sessionRepository.save(session);
      }
    }

    return sessions.map((session) => session.toPrimitives());
  }
}
