import { AuthenticateCredentialUseCase } from "../../domain/use-cases/authenticate-credential.use-case";
import { CreateSessionUseCase } from "../../domain/use-cases/create-session.use-case";
import { GetSessionUseCase } from "../../domain/use-cases/get-session.use-case";
import { ListSessionsUseCase } from "../../domain/use-cases/list-sessions.use-case";
import { RefreshTokenPairUseCase } from "../../domain/use-cases/refresh-token-pair.use-case";
import { RevokeSessionUseCase } from "../../domain/use-cases/revoke-session.use-case";
import { UpdateSessionActivityUseCase } from "../../domain/use-cases/update-session-activity.use-case";
import { RefreshTokenPairInput, RefreshTokenPairOutput } from "../../domain/use-cases/dtos/refresh-token-pair.dto";
import { SessionOutput } from "../../domain/use-cases/dtos/session-output.dto";
import { SigninInput, SigninOutput } from "../../domain/use-cases/dtos/signin.dto";
import { DomainEventPublisher } from "../../../shared/domain/events/domain-event-publisher";
import { SessionApplicationServiceContract } from "../contracts/session.application.service.contract";

export class SessionApplicationService extends SessionApplicationServiceContract {
  constructor(
    private readonly authenticateCredentialUseCase: AuthenticateCredentialUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly getSessionUseCase: GetSessionUseCase,
    private readonly listSessionsUseCase: ListSessionsUseCase,
    private readonly refreshTokenPairUseCase: RefreshTokenPairUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
    private readonly updateSessionActivityUseCase: UpdateSessionActivityUseCase,
    private readonly domainEventPublisher: DomainEventPublisher,
  ) {
    super();
  }

  public async signin(input: SigninInput): Promise<SigninOutput> {
    const credential = await this.authenticateCredentialUseCase.authenticate({
      username: input.username,
      password: input.password,
    });

    const { output, events } = await this.createSessionUseCase.execute({
      credential,
      expiresAt: input.expiresAt,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    await this.domainEventPublisher.publish(events);

    return {
      authenticated: true,
      credentialId: credential.id.value,
      credentialCode: credential.code.value,
      profileCode: credential.profileCode.value,
      session: output.session,
      tokens: output.tokens,
    };
  }

  public async getById(id: string): Promise<SessionOutput | null> {
    const { output, events } = await this.getSessionUseCase.execute(id);

    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async list(credentialId: number): Promise<SessionOutput[]> {
    const { output, events } = await this.listSessionsUseCase.execute(credentialId);

    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async refresh(input: RefreshTokenPairInput): Promise<RefreshTokenPairOutput> {
    const { output, events } = await this.refreshTokenPairUseCase.execute(input);

    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async revoke(id: string): Promise<SessionOutput> {
    const { output, events } = await this.revokeSessionUseCase.execute(id);

    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async updateActivity(id: string): Promise<SessionOutput> {
    const { output, events } = await this.updateSessionActivityUseCase.execute(id);

    await this.domainEventPublisher.publish(events);

    return output;
  }
}
