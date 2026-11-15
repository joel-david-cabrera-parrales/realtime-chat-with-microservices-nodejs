import { ProfileOutput } from "./dtos/profile-output.dto";

export abstract class GetProfileUseCase {
  public abstract execute(id: string): Promise<ProfileOutput | null>;
}
