import { Profile } from "../aggregates/profile.aggregate";
import { UpdateProfileProps } from "../interfaces/profile.interface";

export abstract class UpdateProfileUseCase {
  public abstract execute(id: string, changes: UpdateProfileProps): Promise<Profile>;
}
