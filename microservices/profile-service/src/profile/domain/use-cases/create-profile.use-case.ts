import { CreateProfileInput } from "./dtos/create-profile.dto";
import { ProfileOutput } from "./dtos/profile-output.dto";

export abstract class CreateProfileUseCase {
  public abstract execute(input: CreateProfileInput): Promise<ProfileOutput>;
}
