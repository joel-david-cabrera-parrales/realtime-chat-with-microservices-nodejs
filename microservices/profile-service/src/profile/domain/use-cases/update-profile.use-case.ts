import { ProfileOutput } from "./dtos/profile-output.dto";
import { UpdateProfileInput } from "./dtos/update-profile.dto";

export abstract class UpdateProfileUseCase {
  public abstract execute(input: UpdateProfileInput): Promise<ProfileOutput>;
}
