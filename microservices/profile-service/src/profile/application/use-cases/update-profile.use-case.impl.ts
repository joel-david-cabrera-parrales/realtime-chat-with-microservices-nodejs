import { ProfileNotFoundException } from "../../domain/exceptions/profile-not-found.exception";
import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { UpdateProfileUseCase } from "../../domain/use-cases/update-profile.use-case";
import { ProfileOutput } from "../../domain/use-cases/dtos/profile-output.dto";
import { UpdateProfileInput } from "../../domain/use-cases/dtos/update-profile.dto";
import { ProfileId } from "../../domain/value-objects/profile-id.value-object";

export class UpdateProfileUseCaseImpl extends UpdateProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {
    super();
  }

  public async execute(input: UpdateProfileInput): Promise<ProfileOutput> {
    const profileId = ProfileId.create(input.id);
    const profile = await this.profileRepository.findById(profileId);

    if (profile === null) {
      throw new ProfileNotFoundException(input.id);
    }

    profile.update({
      fullName: input.fullName,
      phone: input.phone,
      birthDate: input.birthDate,
      gender: input.gender,
      bio: input.bio,
      avatarUrl: input.avatarUrl,
    });

    await this.profileRepository.save(profile);

    return profile.toPrimitives();
  }
}
