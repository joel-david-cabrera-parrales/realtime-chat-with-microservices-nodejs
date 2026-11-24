import { Session } from "../../domain/aggregates/session.aggregate";
import { CredentialNotAuthenticatedException } from "../../domain/exceptions/credential-not-authenticated.exception";
import { TokenIssuer } from "../../domain/interfaces/token-issuer.interface";
import { SessionRepository } from "../../domain/repositories/session.repository";
import { CreateSessionUseCase } from "../../domain/use-cases/create-session.use-case";
import { CreateSessionInput } from "../../domain/use-cases/dtos/create-session.dto";
import { CreateSessionOutput } from "../../domain/use-cases/dtos/session-output.dto";
import { DomainEventResult } from "../../../../shared/domain/events/domain-event-result";

export class CreateSessionUseCaseImpl extends CreateSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    tokenIssuer: TokenIssuer,
  ) {
    super(tokenIssuer);
  }

  public async execute(input: CreateSessionInput): Promise<DomainEventResult<CreateSessionOutput>> {
    const { credential } = input;

    if (!credential.isAuthenticated) {
      throw new CredentialNotAuthenticatedException();
    }

    const session = Session.create({
      credentialId: credential.id.value,
      profileCode: credential.profileCode.value,
      expiresAt: input.expiresAt,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    await this.sessionRepository.save(session);

    const sessionPrimitives = session.toPrimitives();

    const tokens = await this.tokenIssuer.issue({
      sessionId: sessionPrimitives.id,
      credentialId: sessionPrimitives.credentialId,
      credentialCode: credential.code.value,
      profileCode: sessionPrimitives.profileCode,
      username: credential.username.value,
    });

    return {
      output: {
        session: sessionPrimitives,
        tokens,
      },
      events: session.pullEvents(),
    };
  }
}
