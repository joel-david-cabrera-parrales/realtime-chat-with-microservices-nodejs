import { Profile } from "../../domain/aggregates/profile.aggregate";
import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { CreateProfileUseCase } from "../../domain/use-cases/create-profile.use-case";
import { CreateProfileInput } from "../../domain/use-cases/dtos/create-profile.dto";
import { ProfileOutput } from "../../domain/use-cases/dtos/profile-output.dto";

export class CreateProfileUseCaseImpl extends CreateProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {
    super();
  }

  public async execute(input: CreateProfileInput): Promise<ProfileOutput> {
    const profile = Profile.create({
      fullName: input.fullName,
      email: input.email,
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
