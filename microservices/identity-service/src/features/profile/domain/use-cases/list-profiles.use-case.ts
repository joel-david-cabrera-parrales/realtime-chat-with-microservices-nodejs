import { Profile } from "../aggregates/profile.aggregate";
import { ListProfilesOutput } from "./dtos/list-profiles-output.dto";

export abstract class ListProfilesUseCase {
  public abstract execute(): Promise<ListProfilesOutput>;
}
