import { Profile } from "../../domain/aggregates/profile.aggregate";
import { GetProfileUseCase } from "../../domain/use-cases/get-profile.use-case";
import { ProfileRepository } from "../../domain/repositories/profile.repository";

export class GetProfileUseCaseImpl extends GetProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) { super(); }

  public async execute(id: string): Promise<Profile | null> {
    return this.profileRepository.findById(id);
  }
}
