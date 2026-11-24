import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { DeleteProfileUseCase } from "../../domain/use-cases/delete-profile.use-case";

export class DeleteProfileUseCaseImpl extends DeleteProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {
    super();
  }

  public async execute(id: string): Promise<void> {
    await this.profileRepository.delete(id);
  }
}
