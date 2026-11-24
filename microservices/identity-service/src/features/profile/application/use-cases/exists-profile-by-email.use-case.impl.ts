import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { ExistsProfileByEmailUseCase } from "../../domain/use-cases/exists-profile-by-email.use-case";

export class ExistsProfileByEmailUseCaseImpl extends ExistsProfileByEmailUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {
    super();
  }

  public async execute(email: string): Promise<boolean> {
    return this.profileRepository.existsByEmail(email);
  }
}
