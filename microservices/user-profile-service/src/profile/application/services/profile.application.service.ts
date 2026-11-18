import { EmailAlreadyExistsException } from "../../domain/exceptions/email-already-exists.exception";
import { ProfileNotFoundException } from "../../domain/exceptions/profile-not-found.exception";
import { CreateProfileUseCase } from "../../domain/use-cases/create-profile.use-case";
import { DeleteProfileUseCase } from "../../domain/use-cases/delete-profile.use-case";
import { ExistsProfileByEmailUseCase } from "../../domain/use-cases/exists-profile-by-email.use-case";
import { ExistsProfileUseCase } from "../../domain/use-cases/exists-profile.use-case";
import { GetProfileUseCase } from "../../domain/use-cases/get-profile.use-case";
import { UpdateProfileUseCase } from "../../domain/use-cases/update-profile.use-case";
import { UploadAvatarInput, UploadAvatarUseCase } from "../../domain/use-cases/upload-avatar.use-case";
import type { ListProfilesOutput } from "../../domain/use-cases/dtos/list-profiles-output.dto";
import { CreateProfileInput } from "../../domain/use-cases/dtos/create-profile.dto";
import { ListProfilesUseCase } from "../../domain/use-cases/list-profiles.use-case";
import { ProfileOutput } from "../../domain/use-cases/dtos/profile-output.dto";
import { UpdateProfileInput } from "../../domain/use-cases/dtos/update-profile.dto";
import { ProfileApplicationServiceContract } from "../contracts/profile.application.service.contract";

export class ProfileApplicationService extends ProfileApplicationServiceContract {
  constructor(
    private readonly createProfileUseCase: CreateProfileUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly existsProfileUseCase: ExistsProfileUseCase,
    private readonly existsProfileByEmailUseCase: ExistsProfileByEmailUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly uploadAvatarUseCase: UploadAvatarUseCase,
    private readonly deleteProfileUseCase: DeleteProfileUseCase,
    private readonly listProfilesUseCase: ListProfilesUseCase,
  ) {
    super();
  }

  public async create(input: CreateProfileInput): Promise<ProfileOutput> {
    const emailExists = await this.existsProfileByEmailUseCase.execute(input.email);

    if (emailExists) throw new EmailAlreadyExistsException(input.email);

    return this.createProfileUseCase.execute(input);
  }

  public getById(id: string): Promise<ProfileOutput | null> {
    return this.getProfileUseCase.execute(id);
  }

  public exists(id: string): Promise<boolean> {
    return this.existsProfileUseCase.execute(id);
  }

  public async list(): Promise<ListProfilesOutput> {
    return this.listProfilesUseCase.execute();
  }

  public async update(input: UpdateProfileInput): Promise<ProfileOutput> {
    await this.existsProfile(input.id);

    return this.updateProfileUseCase.execute(input);
  }

  public uploadAvatar(input: UploadAvatarInput): Promise<ProfileOutput> {
    return this.uploadAvatarUseCase.execute(input);
  }

  public async delete(id: string): Promise<void> {
    await this.existsProfile(id);
    await this.deleteProfileUseCase.execute(id);
  }

  private async existsProfile(id: string): Promise<void> {
    const exists = await this.existsProfileUseCase.execute(id);

    if (!exists) {
      throw new ProfileNotFoundException(id);
    }
  }
}
