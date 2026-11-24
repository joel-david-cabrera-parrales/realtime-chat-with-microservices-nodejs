import { ProfileApplicationServiceContract } from "../../../profile/application/contracts/profile.application.service.contract";
import { DomainEventPublisher } from "../../../../shared/domain/events/domain-event-publisher";
import { UnitOfWork } from "../../../../shared/domain/services/unit-of-work";
import { AuthenticateCredentialUseCase } from "../../domain/use-cases/authenticate-credential.use-case";
import { CreateCredentialUseCase } from "../../domain/use-cases/create-credential.use-case";
import { CreateSessionUseCase } from "../../domain/use-cases/create-session.use-case";
import { SignupInput, SignupOutput } from "../../domain/use-cases/dtos/signup.dto";
import { SignupApplicationServiceContract } from "../contracts/signup.application.service.contract";

export class SignupApplicationService extends SignupApplicationServiceContract {
  constructor(
    private readonly profileApplicationService: ProfileApplicationServiceContract,
    private readonly createCredentialUseCase: CreateCredentialUseCase,
    private readonly authenticateCredentialUseCase: AuthenticateCredentialUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly domainEventPublisher: DomainEventPublisher,
    private readonly unitOfWork: UnitOfWork,
  ) {
    super();
  }

  public async signup(input: SignupInput): Promise<SignupOutput> {
    const { output, events } = await this.unitOfWork.execute(async () => {
      const profile = await this.profileApplicationService.create({
        fullName: input.profile.fullName,
        email: input.profile.email,
        phone: input.profile.phone,
        birthDate: input.profile.birthDate,
        gender: input.profile.gender,
      });

      await this.createCredentialUseCase.execute({
        username: input.username,
        password: input.password,
        profileCode: profile.id,
      });

      const credential = await this.authenticateCredentialUseCase.authenticate({
        username: input.username,
        password: input.password,
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
