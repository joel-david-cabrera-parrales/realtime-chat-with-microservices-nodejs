import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { ListProfilesUseCase } from "../../domain/use-cases/list-profiles.use-case";
import type { ListProfilesOutput } from "../../domain/use-cases/dtos/list-profiles-output.dto";

export class ListProfilesUseCaseImpl extends ListProfilesUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {
    super();
  }

  public async execute(): Promise<ListProfilesOutput> {
    const profiles = await this.profileRepository.findAll();
    return {
      profiles: profiles.map((profile) => {
        const data = profile.toPrimitives();
        return {
          id: data.id,
          fullName: data.fullName,
          avatarFileCode: data.avatarFileCode,
        };
      }),
    };
  }
}
