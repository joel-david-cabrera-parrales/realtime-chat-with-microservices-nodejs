import { DataSource } from "typeorm";
import { UnitOfWork } from "../../domain/services/unit-of-work";
import { TransactionContext } from "./transaction-context";

export class TypeOrmUnitOfWork extends UnitOfWork {
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  public async execute<T>(work: () => Promise<T>): Promise<T> {
    // Reuse an existing transaction so nested application services participate
    // in the same atomic operation instead of opening an independent one.
    if (TransactionContext.getManager() !== undefined) {
      return work();
    }

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const result = await TransactionContext.run(queryRunner.manager, work);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        try {
          await queryRunner.rollbackTransaction();
        } catch {
          // Preserve the original operation/commit error.
        }
      }
      throw error;
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }
}
