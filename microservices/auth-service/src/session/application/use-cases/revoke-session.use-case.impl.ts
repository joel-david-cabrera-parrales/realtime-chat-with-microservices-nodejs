import { SessionNotFoundException } from "../../domain/exceptions/session-not-found.exception";
import { SessionRepository } from "../../domain/repositories/session.repository";
import { TokenRepository } from "../../domain/repositories/token.repository";
import { SessionRevocationService } from "../../domain/services/session-revocation.service";
import { SessionOutput } from "../../domain/use-cases/dtos/session-output.dto";
import { RevokeSessionUseCase } from "../../domain/use-cases/revoke-session.use-case";
import { SessionId } from "../../domain/value-objects/session-id.value-object";

export class RevokeSessionUseCaseImpl extends RevokeSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly tokenRepository: TokenRepository,
  ) {
    super();
  }

  public async execute(id: string): Promise<SessionOutput> {
    const sessionId = SessionId.create(id);
    const session = await this.sessionRepository.findById(sessionId);

    if (session === null) {
      throw new SessionNotFoundException(id);
    }

    const tokens = await this.tokenRepository.findBySessionId(sessionId);

    SessionRevocationService.revoke(session, tokens);

    await this.sessionRepository.save(session);

    for (const token of tokens) {
      await this.tokenRepository.save(token);
    }

    return session.toPrimitives();
  }
}
