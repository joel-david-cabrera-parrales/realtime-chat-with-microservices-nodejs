import { FileUpload } from "../../../../shared/domain/services/file.client.service";
import { Profile } from "../aggregates/profile.aggregate";

export interface UploadAvatarInput {
  id: string;
  file: FileUpload;
}

export abstract class UploadAvatarUseCase {
  public abstract execute(input: UploadAvatarInput): Promise<Profile>;
}
