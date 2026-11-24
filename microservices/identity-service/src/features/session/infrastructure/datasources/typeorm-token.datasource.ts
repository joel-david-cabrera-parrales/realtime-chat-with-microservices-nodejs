import { DataSource, Repository } from "typeorm";
import { Token } from "../../domain/aggregates/token.aggregate";
import { TokenDataSource } from "../../domain/datasources/token.datasource";
import { SessionId } from "../../domain/value-objects/session-id.value-object";
import { TokenCode } from "../../domain/value-objects/token-code.value-object";
import { TokenStatus } from "../../domain/value-objects/token-status.value-object";
import { RefreshTokenEntity } from "../../../../plugins/typorm/entities/refresh-token.entity";
import { TokenMapper } from "../mappers/token.mapper";
import { TransactionContext } from "../../../../shared/infrastructure/persistence/transaction-context";

export class TypeOrmTokenDataSource implements TokenDataSource {
  constructor(private readonly dataSource: DataSource) {}

  private get repository(): Repository<RefreshTokenEntity> {
    const manager = TransactionContext.getManager() ?? this.dataSource.manager;
    return manager.getRepository(RefreshTokenEntity);
  }

  public async save(token: Token): Promise<void> {
    const entity = TokenMapper.toPersistence(token);
    const existing = await this.repository.findOne({
      where: { tokenCode: token.code.value },
    });

    if (existing !== null) {
      entity.id = existing.id;
    }

    await this.repository.save(entity);
  }

  public async findByCode(code: TokenCode): Promise<Token | null> {
    const entity = await this.repository.findOne({
      where: { tokenCode: code.value },
    });

    return entity === null ? null : TokenMapper.toDomain(entity);
  }

  public async findBySessionId(sessionId: SessionId): Promise<Token[]> {
    const entities = await this.repository.find({
      where: { sessionId: sessionId.value },
      order: { createdAt: "DESC" },
    });

    return entities.map((entity) => TokenMapper.toDomain(entity));
  }

  public async findActiveByCredentialId(credentialId: number): Promise<Token[]> {
    const entities = await this.repository.find({
      where: { credentialId, status: TokenStatus.active },
      order: { createdAt: "DESC" },
    });

    return entities.map((entity) => TokenMapper.toDomain(entity));
  }

  public async existsByCode(code: TokenCode): Promise<boolean> {
    return this.repository.exists({
      where: { tokenCode: code.value },
    });
  }

  public async delete(code: TokenCode): Promise<void> {
    await this.repository.softDelete({ tokenCode: code.value });
  }
}
