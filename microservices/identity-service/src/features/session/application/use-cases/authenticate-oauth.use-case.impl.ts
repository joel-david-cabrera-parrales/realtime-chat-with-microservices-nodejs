import { Credential } from "../../domain/aggregates/credential.aggregate";
import { CredentialRepository } from "../../domain/repositories/credential.repository";
import { AuthenticateOAuthInput } from "../../domain/use-cases/dtos/authenticate-oauth.dto";
import { AuthenticateOAuthUseCase } from "../../domain/use-cases/authenticate-oauth.use-case";
import { ProfileCode } from "../../domain/value-objects/profile-code.value-object";
import { Username } from "../../domain/value-objects/username.value-object";
import { ProfileApplicationServiceContract } from "../../../profile/application/contracts/profile.application.service.contract";
import { DomainEventResult } from "../../../../shared/domain/events/domain-event-result";
import { UserCreatedEvent } from "../../domain/events/user-created.event";
import { AuthenticationTypeCode } from "../../domain/constants/authentication-type.constants";

export class AuthenticateOAuthUseCaseImpl extends AuthenticateOAuthUseCase {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly profileApplicationService: ProfileApplicationServiceContract,
  ) {
    super();
  }

  public async execute(input: AuthenticateOAuthInput): Promise<DomainEventResult<Credential>> {
    const username = Username.create(input.email);

    const existing = await this.credentialRepository.findByUsername(username);

    if (existing !== null) {
      existing.markAsAuthenticated();
      const events = await this.credentialRepository.save(existing);
      return { output: existing, events };
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
    const credentialEvents = await this.credentialRepository.save(credential);

    const now = new Date();
    const userCreatedEvent = new UserCreatedEvent({
      credentialCode: credential.code.value,
      credentialId: credential.id.value,
      username: credential.username.value,
      profileCode: credential.profileCode.value,
      authenticationType: credential.authenticationType,
      fullName: input.fullName,
      email: input.email,
      phone: null,
      birthDate: null,
      gender: null,
      occurredAt: now,
    });

    return {
      output: credential,
      events: [...credentialEvents, userCreatedEvent],
    };
  }
}
