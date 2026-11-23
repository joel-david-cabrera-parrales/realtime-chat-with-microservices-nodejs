import { DomainEventPublisher } from "../../../shared/domain/events/domain-event-publisher";
import { UnitOfWork } from "../../../shared/domain/services/unit-of-work";
import { AuthenticateOAuthUseCase } from "../../domain/use-cases/authenticate-oauth.use-case";
import { CreateSessionUseCase } from "../../domain/use-cases/create-session.use-case";
import { OAuthLoginInput, OAuthLoginOutput } from "../../domain/use-cases/dtos/oauth.dto";
import { OAuthApplicationServiceContract } from "../contracts/oauth.application.service.contract";

export class OAuthApplicationService extends OAuthApplicationServiceContract {
  constructor(
    private readonly authenticateOAuthUseCase: AuthenticateOAuthUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly domainEventPublisher: DomainEventPublisher,
    private readonly unitOfWork: UnitOfWork,
  ) {
    super();
  }

  public async login(input: OAuthLoginInput): Promise<OAuthLoginOutput> {
    const { output, events } = await this.unitOfWork.execute(async () => {
      const credential = await this.authenticateOAuthUseCase.execute({
        email: input.email,
        fullName: input.fullName,
        authenticationType: input.authenticationType,
      });

      const { output: sessionOutput, events } = await this.createSessionUseCase.execute({
        credential,
        expiresAt: input.expiresAt,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });

      return {
        events,
        output: {
          authenticated: true as const,
          credentialId: credential.id.value,
          credentialCode: credential.code.value,
          profileCode: credential.profileCode.value,
          session: sessionOutput.session,
          tokens: sessionOutput.tokens,
        },
      };
    });

    await this.domainEventPublisher.publish(events);
    return output;
  }
}
