import { Profile } from "../../domain/aggregates/profile.aggregate";
import { UpdateProfileUseCase } from "../../domain/use-cases/update-profile.use-case";
import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { UpdateProfileProps } from "../../domain/interfaces/profile.interface";
import { ProfileNotFoundException } from "../../domain/exceptions/profile-not-found.exception";

export class UpdateProfileUseCaseImpl extends UpdateProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {
    super();
  }

  public async execute(id: string, changes: UpdateProfileProps): Promise<Profile> {
    const profile = await this.profileRepository.findById(id);

    if (!profile) {
      throw new ProfileNotFoundException(id);
    }

    profile.update({
      fullName: changes.fullName,
      phone: changes.phone,
      birthDate: changes.birthDate,
      gender: changes.gender,
      bio: changes.bio,
      avatarFileCode: changes.avatarFileCode,
    });

    await this.profileRepository.save(profile);

    return profile;
  }
}
