import { AsyncLocalStorage } from "node:async_hooks";
import { EntityManager } from "typeorm";

export class TransactionContext {
  private static readonly storage = new AsyncLocalStorage<EntityManager>();

  public static run<T>(manager: EntityManager, work: () => Promise<T>): Promise<T> {
    return this.storage.run(manager, work);
  }

  public static getManager(): EntityManager | undefined {
    return this.storage.getStore();
  }
}
