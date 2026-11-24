import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { ExistsProfileUseCase } from "../../domain/use-cases/exists-profile.use-case";

export class ExistsProfileUseCaseImpl extends ExistsProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {
    super();
  }

  public async execute(id: string): Promise<boolean> {
    return this.profileRepository.existsById(id);
  }
}
