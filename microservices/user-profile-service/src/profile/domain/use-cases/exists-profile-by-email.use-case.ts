export abstract class ExistsProfileByEmailUseCase {
  public abstract execute(email: string): Promise<boolean>;
}
