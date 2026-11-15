import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { ExistsProfileUseCase } from "../../domain/use-cases/exists-profile.use-case";
import { ProfileId } from "../../domain/value-objects/profile-id.value-object";

export class ExistsProfileUseCaseImpl extends ExistsProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {
    super();
  }

  public execute(id: string): Promise<boolean> {
    return this.profileRepository.existsById(ProfileId.create(id));
  }
}
