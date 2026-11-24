import { Profile } from "../../domain/aggregates/profile.aggregate";
import { CreateProfileInput } from "./dtos/create-profile.dto";
import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { EmailAlreadyExistsException } from "../../domain/exceptions/email-already-exists.exception";
import { CreateProfileUseCase } from "../../domain/use-cases/create-profile.use-case";

export class CreateProfileUseCaseImpl extends CreateProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) { super(); }

  public async execute(input: CreateProfileInput): Promise<Profile> {
    const emailExists = await this.profileRepository.existsByEmail(input.email);

    if (emailExists) {
      throw new EmailAlreadyExistsException(input.email);
    }

    const profile = Profile.create({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      birthDate: input.birthDate,
      gender: input.gender,
      bio: input.bio,
    });

    await this.profileRepository.save(profile);

    return profile;
  }
}
