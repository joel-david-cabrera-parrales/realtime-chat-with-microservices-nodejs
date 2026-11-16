import { DomainEventPublisher } from "../../../shared/domain/events/domain-event-publisher";
import { AuthenticateOAuthUseCase } from "../../domain/use-cases/authenticate-oauth.use-case";
import { CreateSessionUseCase } from "../../domain/use-cases/create-session.use-case";
import { OAuthLoginInput, OAuthLoginOutput } from "../../domain/use-cases/dtos/oauth.dto";
import { OAuthApplicationServiceContract } from "../contracts/oauth.application.service.contract";

export class OAuthApplicationService extends OAuthApplicationServiceContract {
  constructor(
    private readonly authenticateOAuthUseCase: AuthenticateOAuthUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly domainEventPublisher: DomainEventPublisher,
  ) {
    super();
  }

  public async login(input: OAuthLoginInput): Promise<OAuthLoginOutput> {
    const credential = await this.authenticateOAuthUseCase.execute({
      email: input.email,
      fullName: input.fullName,
      authenticationType: input.authenticationType,
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
}
