export abstract class DeleteProfileUseCase {
  public abstract execute(id: string): Promise<void>;
}
