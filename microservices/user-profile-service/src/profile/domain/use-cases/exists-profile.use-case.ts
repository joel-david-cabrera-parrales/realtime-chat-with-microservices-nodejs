export abstract class ExistsProfileUseCase {
  public abstract execute(id: string): Promise<boolean>;
}
