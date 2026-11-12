import { AuthenticateCredentialUseCase } from "../../domain/use-cases/authenticate-credential.use-case";
import { CreateCredentialUseCase } from "../../domain/use-cases/create-credential.use-case";
import { CreateSessionUseCase } from "../../domain/use-cases/create-session.use-case";
import { SignupInput, SignupOutput } from "../../domain/use-cases/dtos/signup.dto";
import { ProfileClientService } from "../../../shared/domain/profile.client.service";
import { SignupApplicationServiceContract } from "../contracts/signup.application.service.contract";

export class SignupApplicationService extends SignupApplicationServiceContract {
  constructor(
    private readonly profileClient: ProfileClientService,
    private readonly createCredentialUseCase: CreateCredentialUseCase,
    private readonly authenticateCredentialUseCase: AuthenticateCredentialUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {
    super();
  }

  public async signup(input: SignupInput): Promise<SignupOutput> {
    const profile = await this.profileClient.createProfile({
      fullName: input.profile.fullName,
      email: input.profile.email,
      phone: input.profile.phone,
      birthDate: input.profile.birthDate,
      gender: input.profile.gender,
    });

    try {
      await this.createCredentialUseCase.execute({
        username: input.username,
        password: input.password,
        profileCode: profile.id,
      });

      const credential = await this.authenticateCredentialUseCase.authenticate({
        username: input.username,
        password: input.password,
      });

      const { session, tokens } = await this.createSessionUseCase.execute({
        credential,
        expiresAt: input.expiresAt,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });

      return {
        authenticated: true,
        credentialId: credential.id.value,
        credentialCode: credential.code.value,
        profileCode: credential.profileCode.value,
        session,
        tokens,
      };
    } catch (error) {
      await this.compensate(profile.id);
      throw error;
    }
  }

  private async compensate(profileCode: string): Promise<void> {
    try {
      await this.profileClient.deleteProfile(profileCode);
    } catch {
      return;
    }
  }
}
