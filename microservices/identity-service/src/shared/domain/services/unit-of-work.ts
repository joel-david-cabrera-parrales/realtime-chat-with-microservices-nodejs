export abstract class UnitOfWork {
  public abstract execute<T>(work: () => Promise<T>): Promise<T>;
}
