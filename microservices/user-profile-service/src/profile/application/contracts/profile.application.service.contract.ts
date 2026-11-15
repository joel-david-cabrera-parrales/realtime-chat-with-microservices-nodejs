import { CreateProfileInput } from "../../domain/use-cases/dtos/create-profile.dto";
import { ProfileOutput } from "../../domain/use-cases/dtos/profile-output.dto";
import { UpdateProfileInput } from "../../domain/use-cases/dtos/update-profile.dto";
import { UploadAvatarInput } from "../../domain/use-cases/upload-avatar.use-case";

export abstract class ProfileApplicationServiceContract {
  public abstract create(input: CreateProfileInput): Promise<ProfileOutput>;
  public abstract getById(id: string): Promise<ProfileOutput | null>;
  public abstract exists(id: string): Promise<boolean>;
  public abstract update(input: UpdateProfileInput): Promise<ProfileOutput>;
  public abstract uploadAvatar(input: UploadAvatarInput): Promise<ProfileOutput>;
  public abstract delete(id: string): Promise<void>;
}
