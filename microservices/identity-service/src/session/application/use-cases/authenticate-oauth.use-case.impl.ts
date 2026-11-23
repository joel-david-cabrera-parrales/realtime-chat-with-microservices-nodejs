import { Credential } from "../../domain/aggregates/credential.aggregate";
import { CredentialRepository } from "../../domain/repositories/credential.repository";
import { AuthenticateOAuthInput } from "../../domain/use-cases/dtos/authenticate-oauth.dto";
import { AuthenticateOAuthUseCase } from "../../domain/use-cases/authenticate-oauth.use-case";
import { ProfileCode } from "../../domain/value-objects/profile-code.value-object";
import { Username } from "../../domain/value-objects/username.value-object";
import { ProfileApplicationServiceContract } from "../../../profile/application/contracts/profile.application.service.contract";

export class AuthenticateOAuthUseCaseImpl extends AuthenticateOAuthUseCase {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly profileApplicationService: ProfileApplicationServiceContract,
  ) {
    super();
  }

  public async execute(input: AuthenticateOAuthInput): Promise<Credential> {
    const username = Username.create(input.email);

    const existing = await this.credentialRepository.findByUsername(username);

    if (existing !== null) {
      existing.markAsAuthenticated();
      await this.credentialRepository.save(existing);

      return existing;
    }

    const profile = await this.profileApplicationService.create({
      fullName: input.fullName,
      email: input.email,
    });

    const credential = Credential.create({
      username: username.value,
      profileCode: ProfileCode.create(profile.id).value,
      authenticationType: input.authenticationType,
    });

    credential.markAsAuthenticated();
    await this.credentialRepository.save(credential);

    return credential;
  }
}
