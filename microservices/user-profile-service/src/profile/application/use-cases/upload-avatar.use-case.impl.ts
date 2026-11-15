import { ProfileNotFoundException } from "../../domain/exceptions/profile-not-found.exception";
import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { UploadAvatarInput, UploadAvatarUseCase } from "../../domain/use-cases/upload-avatar.use-case";
import { ProfileOutput } from "../../domain/use-cases/dtos/profile-output.dto";
import { ProfileId } from "../../domain/value-objects/profile-id.value-object";
import { FileClientService } from "../../../shared/domain/file.client.service";

export class UploadAvatarUseCaseImpl extends UploadAvatarUseCase {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly fileClient: FileClientService,
  ) {
    super();
  }

  public async execute(input: UploadAvatarInput): Promise<ProfileOutput> {
    const profileId = ProfileId.create(input.id);
    const profile = await this.profileRepository.findById(profileId);

    if (profile === null) {
      throw new ProfileNotFoundException(input.id);
    }

    const uploaded = await this.fileClient.uploadProfilePhoto(profileId.value, input.file);

    profile.assignAvatarFileCode(uploaded.fileCode);

    await this.profileRepository.save(profile);

    return profile.toPrimitives();
  }
}
