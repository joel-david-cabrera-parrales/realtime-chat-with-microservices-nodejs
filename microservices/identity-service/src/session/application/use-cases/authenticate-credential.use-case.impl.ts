import { Credential } from "../../domain/aggregates/credential.aggregate";
import { CredentialNotFoundException } from "../../domain/exceptions/credential-not-found.exception";
import { InvalidCredentialsException } from "../../domain/exceptions/invalid-credentials.exception";
import { CredentialRepository } from "../../domain/repositories/credential.repository";
import { AuthenticateCredentialUseCase } from "../../domain/use-cases/authenticate-credential.use-case";
import { AuthenticateCredentialInput } from "../../domain/use-cases/dtos/authenticate-credential.dto";
import { Password } from "../../domain/value-objects/password.value-object";
import { Username } from "../../domain/value-objects/username.value-object";
import { HashService } from "../../../shared/domain/services/hash.service";

export class AuthenticateCredentialUseCaseImpl extends AuthenticateCredentialUseCase {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly hashService: HashService,
  ) {
    super();
  }

  public async authenticate(input: AuthenticateCredentialInput): Promise<Credential> {
    const username = Username.create(input.username);
    const password = Password.create(input.password);

    const credential = await this.credentialRepository.findByUsername(username);

    if (credential === null) {
      throw new CredentialNotFoundException(username.value);
    }

    const passwordIsValid = await credential.verifyPassword(password, this.hashService);

    if (!passwordIsValid) {
      throw new InvalidCredentialsException();
    }

    credential.markAsAuthenticated();

    return credential;
  }
}
