import { Credential } from "../../domain/aggregates/credential.aggregate";
import { UsernameAlreadyExistsException } from "../../domain/exceptions/username-already-exists.exception";
import { CredentialRepository } from "../../domain/repositories/credential.repository";
import { CreateCredentialUseCase } from "../../domain/use-cases/create-credential.use-case";
import { CreateCredentialInput } from "../../domain/use-cases/dtos/create-credential.dto";
import { Password } from "../../domain/value-objects/password.value-object";
import { ProfileCode } from "../../domain/value-objects/profile-code.value-object";
import { Username } from "../../domain/value-objects/username.value-object";
import { HashService } from "../../../../shared/domain/services/hash.service";

export class CreateCredentialUseCaseImpl extends CreateCredentialUseCase {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly hashService: HashService,
  ) {
    super();
  }

  public async execute(input: CreateCredentialInput): Promise<Credential> {
    const username = Username.create(input.username);
    const password = Password.create(input.password);
    const profileCode = ProfileCode.create(input.profileCode);

    const alreadyExists = await this.credentialRepository.existsByUsername(username);

    if (alreadyExists) {
      throw new UsernameAlreadyExistsException(username.value);
    }

    const passwordHash = await this.hashService.hash(password.value);

    const credential = Credential.create({
      username: username.value,
      passwordHash,
      profileCode: profileCode.value,
    });

    await this.credentialRepository.save(credential);

    return credential;
  }
}
