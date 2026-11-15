import { FileUpload } from "../../../shared/domain/file.client.service";
import { ProfileOutput } from "./dtos/profile-output.dto";

export interface UploadAvatarInput {
  id: string;
  file: FileUpload;
}

export abstract class UploadAvatarUseCase {
  public abstract execute(input: UploadAvatarInput): Promise<ProfileOutput>;
}
