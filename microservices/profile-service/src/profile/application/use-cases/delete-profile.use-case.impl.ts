import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { DeleteProfileUseCase } from "../../domain/use-cases/delete-profile.use-case";
import { ProfileId } from "../../domain/value-objects/profile-id.value-object";
import { FileClientService } from "../../../shared/domain/file.client.service";

export class DeleteProfileUseCaseImpl extends DeleteProfileUseCase {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly fileClient: FileClientService,
  ) {
    super();
  }

  public async execute(id: string): Promise<void> {
    const profileId = ProfileId.create(id);

    await this.profileRepository.delete(profileId);
    await this.fileClient.deleteProfilePhoto(profileId.value).catch(() => undefined);
  }
}
