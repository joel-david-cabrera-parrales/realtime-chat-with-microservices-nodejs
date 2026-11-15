import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { ExistsProfileByEmailUseCase } from "../../domain/use-cases/exists-profile-by-email.use-case";
import { Email } from "../../domain/value-objects/email.value-object";

export class ExistsProfileByEmailUseCaseImpl extends ExistsProfileByEmailUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {
    super();
  }

  public execute(email: string): Promise<boolean> {
    return this.profileRepository.existsByEmail(Email.create(email));
  }
}
