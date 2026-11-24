import { CreateProfileInput } from "../use-cases/dtos/create-profile.dto";
import { ProfileOutput } from "../use-cases/dtos/profile-output.dto";
import { UpdateProfileProps } from "../../domain/interfaces/profile.interface";
import { ListProfilesOutput } from "../../domain/use-cases/dtos/list-profiles-output.dto";
import { UploadAvatarInput } from "../../domain/use-cases/upload-avatar.use-case";

export abstract class ProfileApplicationServiceContract {
  public abstract create(input: CreateProfileInput): Promise<ProfileOutput>;
  public abstract getById(id: string): Promise<ProfileOutput | null>;
  public abstract exists(id: string): Promise<boolean>;
  public abstract existsByEmail(email: string): Promise<boolean>;
  public abstract list(): Promise<ListProfilesOutput>;
  public abstract update(id: string, changes: UpdateProfileProps): Promise<ProfileOutput>;
  public abstract uploadAvatar(input: UploadAvatarInput): Promise<ProfileOutput>;
  public abstract delete(id: string): Promise<void>;
}
