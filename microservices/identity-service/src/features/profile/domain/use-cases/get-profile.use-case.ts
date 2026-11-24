import { Profile } from "../aggregates/profile.aggregate";

export abstract class GetProfileUseCase {
  public abstract execute(id: string): Promise<Profile | null>;
}