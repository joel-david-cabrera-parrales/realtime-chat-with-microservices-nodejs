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
import { CredentialRepository } from "../../domain/repositories/credential.repository";
import { SessionApplicationServiceContract } from "../contracts/session.application.service.contract";
import { UnitOfWork } from "../../../shared/domain/services/unit-of-work";
import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";

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
    private readonly credentialRepository: CredentialRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {
    super();
  }

  public async signin(input: SigninInput): Promise<SigninOutput> {
    const { result, events } = await this.unitOfWork.execute(async () => {
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

      return {
        events,
        result: {
          authenticated: true as const,
          credentialId: credential.id.value,
          credentialCode: credential.code.value,
          profileCode: credential.profileCode.value,
          session: output.session,
          tokens: output.tokens,
        },
      };
    });
    await this.domainEventPublisher.publish(events);
    return result;
  }

  public async getById(id: string): Promise<SessionOutput | null> {
    return this.executeAndPublish(() => this.getSessionUseCase.execute(id));
  }

  public async list(credentialId: number): Promise<SessionOutput[]> {
    return this.executeAndPublish(() => this.listSessionsUseCase.execute(credentialId));
  }

  public listContacts(credentialCode: string, search?: string, limit?: number) {
    return this.credentialRepository.findContacts(credentialCode, search, limit);
  }

  public async refresh(input: RefreshTokenPairInput): Promise<RefreshTokenPairOutput> {
    return this.executeAndPublish(() => this.refreshTokenPairUseCase.execute(input));
  }

  public async revoke(id: string): Promise<SessionOutput> {
    return this.executeAndPublish(() => this.revokeSessionUseCase.execute(id));
  }

  public async updateActivity(id: string): Promise<SessionOutput> {
    return this.executeAndPublish(() => this.updateSessionActivityUseCase.execute(id));
  }

  private async executeAndPublish<T>(work: () => Promise<DomainEventResult<T>>): Promise<T> {
    const { output, events } = await this.unitOfWork.execute(work);
    await this.domainEventPublisher.publish(events);
    return output;
  }
}
