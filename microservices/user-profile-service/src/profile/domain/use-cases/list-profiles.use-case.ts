import type { ListProfilesOutput } from "./dtos/list-profiles-output.dto";

export abstract class ListProfilesUseCase {
  public abstract execute(): Promise<ListProfilesOutput>;
}
