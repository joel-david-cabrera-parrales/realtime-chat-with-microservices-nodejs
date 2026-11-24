import { FileClientService } from "../../../../shared/domain/services/file.client.service";
import { ProfileNotFoundException } from "../../domain/exceptions/profile-not-found.exception";
import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { UploadAvatarInput, UploadAvatarUseCase } from "../../domain/use-cases/upload-avatar.use-case";

export class UploadAvatarUseCaseImpl extends UploadAvatarUseCase {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly fileClient: FileClientService,
  ) {
    super();
  }

  public async execute(input: UploadAvatarInput) {
    const profile = await this.profileRepository.findById(input.id);
    if (profile === null) {
      throw new ProfileNotFoundException(input.id);
    }

    const uploaded = await this.fileClient.uploadProfilePhoto(input.id, input.file);
    profile.assignAvatarFileCode(uploaded.fileCode);

    try {
      await this.profileRepository.save(profile);
    } catch (error) {
      await this.fileClient.deleteProfilePhoto(input.id).catch(() => undefined);
      throw error;
    }

    return profile;
  }
}
