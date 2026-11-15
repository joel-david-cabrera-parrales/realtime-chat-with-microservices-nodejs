import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { GetProfileUseCase } from "../../domain/use-cases/get-profile.use-case";
import { ProfileOutput } from "../../domain/use-cases/dtos/profile-output.dto";
import { ProfileId } from "../../domain/value-objects/profile-id.value-object";

export class GetProfileUseCaseImpl extends GetProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {
    super();
  }

  public async execute(id: string): Promise<ProfileOutput | null> {
    const profile = await this.profileRepository.findById(ProfileId.create(id));

    return profile === null ? null : profile.toPrimitives();
  }
}
