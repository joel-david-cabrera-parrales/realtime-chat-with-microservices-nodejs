import { DataSource, Repository } from "typeorm";
import { Session } from "../../domain/aggregates/session.aggregate";
import { SessionDataSource } from "../../domain/datasources/session.datasource";
import { SessionId } from "../../domain/value-objects/session-id.value-object";
import { SessionStatus } from "../../domain/value-objects/session-status.value-object";
import { SessionEntity } from "../../../../plugins/typorm/entities/session.entity";
import { SessionMapper } from "../mappers/session.mapper";
import { TransactionContext } from "../../../../shared/infrastructure/persistence/transaction-context";

export class TypeOrmSessionDataSource implements SessionDataSource {
  constructor(private readonly dataSource: DataSource) {}

  private get repository(): Repository<SessionEntity> {
    const manager = TransactionContext.getManager() ?? this.dataSource.manager;
    return manager.getRepository(SessionEntity);
  }

  public async save(session: Session): Promise<void> {
    const entity = SessionMapper.toPersistence(session);
    const existing = await this.repository.findOne({
      where: { sessionCode: session.id.value },
    });

    if (existing !== null) {
      entity.id = existing.id;
    }

    await this.repository.save(entity);
  }

  public async findById(id: SessionId): Promise<Session | null> {
    const entity = await this.repository.findOne({
      where: { sessionCode: id.value },
      relations: { credential: true },
    });

    return entity === null ? null : SessionMapper.toDomain(entity);
  }

  public async findByCredentialId(credentialId: number): Promise<Session[]> {
    const entities = await this.repository
      .createQueryBuilder("session")
      .innerJoinAndSelect("session.credential", "credential")
      .where("credential.id = :credentialId", { credentialId })
      .orderBy("session.createdAt", "DESC")
      .getMany();

    return entities.map((entity) => SessionMapper.toDomain(entity));
  }

  public async findActiveByCredentialId(credentialId: number): Promise<Session[]> {
    const entities = await this.repository
      .createQueryBuilder("session")
      .innerJoinAndSelect("session.credential", "credential")
      .where("credential.id = :credentialId", { credentialId })
      .andWhere("session.status = :status", { status: SessionStatus.active })
      .orderBy("session.createdAt", "DESC")
      .getMany();

    return entities.map((entity) => SessionMapper.toDomain(entity));
  }

  public async existsById(id: SessionId): Promise<boolean> {
    return this.repository.exists({
      where: { sessionCode: id.value },
    });
  }

  public async delete(id: SessionId): Promise<void> {
    await this.repository.softDelete({ sessionCode: id.value });
  }
}
