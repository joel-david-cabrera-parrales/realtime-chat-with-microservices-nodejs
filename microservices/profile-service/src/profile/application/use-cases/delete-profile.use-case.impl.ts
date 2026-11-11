import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { DeleteProfileUseCase } from "../../domain/use-cases/delete-profile.use-case";
import { ProfileId } from "../../domain/value-objects/profile-id.value-object";

export class DeleteProfileUseCaseImpl extends DeleteProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {
    super();
  }

  public async execute(id: string): Promise<void> {
    await this.profileRepository.delete(ProfileId.create(id));
  }
}
