import { Profile } from "../aggregates/profile.aggregate";

export abstract class ExistsProfileUseCase {
  public abstract execute(id: string): Promise<boolean>;
}