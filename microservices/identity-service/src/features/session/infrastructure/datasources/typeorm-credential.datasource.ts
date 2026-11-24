import { DataSource, Repository } from "typeorm";
import { Credential } from "../../domain/aggregates/credential.aggregate";
import { AuthenticationTypeCode } from "../../domain/constants/authentication-type.constants";
import { CredentialDataSource } from "../../domain/datasources/credential.datasource";
import type { CredentialContact } from "../../domain/datasources/credential.datasource";
import { CredentialId } from "../../domain/value-objects/credential-id.value-object";
import { Username } from "../../domain/value-objects/username.value-object";
import { AuthenticationTypeEntity } from "../../../../plugins/typorm/entities/authentication-type.entity";
import { CredentialEntity } from "../../../../plugins/typorm/entities/credential.entity";
import { CredentialMapper } from "../mappers/credential.mapper";
import { TransactionContext } from "../../../../shared/infrastructure/persistence/transaction-context";

export class TypeOrmCredentialDataSource implements CredentialDataSource {
  constructor(private readonly dataSource: DataSource) {}

  private get repository(): Repository<CredentialEntity> {
    const manager = TransactionContext.getManager() ?? this.dataSource.manager;
    return manager.getRepository(CredentialEntity);
  }

  public async save(credential: Credential): Promise<void> {
    const entity = CredentialMapper.toPersistence(credential);
    const existing = await this.repository.findOne({
      where: { credentialCode: credential.code.value },
    });

    if (existing !== null) {
      entity.id = existing.id;
      entity.authenticationTypeId = existing.authenticationTypeId;
    } else {
      entity.authenticationTypeId = await this.resolveAuthenticationTypeId(credential.authenticationType);
    }

    await this.repository.save(entity);
  }

  public async findById(id: CredentialId): Promise<Credential | null> {
    const entity = await this.repository.findOne({
      where: { id: id.value },
      relations: { authenticationType: true },
    });

    return entity === null ? null : CredentialMapper.toDomain(entity);
  }

  public async findByUsername(username: Username): Promise<Credential | null> {
    const entity = await this.repository.findOne({
      where: { username: username.value },
      relations: { authenticationType: true },
    });

    return entity === null ? null : CredentialMapper.toDomain(entity);
  }

  public async existsByUsername(username: Username): Promise<boolean> {
    return this.repository.exists({
      where: { username: username.value },
      withDeleted: true,
    });
  }

  public async delete(id: CredentialId): Promise<void> {
    await this.repository.softDelete({ id: id.value });
  }

  public async findContacts(excludeCredentialCode: string, search = "", limit = 50): Promise<CredentialContact[]> {
    const query = this.repository
      .createQueryBuilder("credential")
      .select("credential.credentialCode", "credentialCode")
      .addSelect("credential.profileCode", "profileCode")
      .where("credential.deletedAt IS NULL")
      .andWhere("credential.credentialCode != :excludeCredentialCode", { excludeCredentialCode })
      .orderBy("credential.username", "ASC")
      .take(Math.min(Math.max(limit, 1), 100));

    if (search.trim()) {
      query.andWhere("credential.username ILIKE :search", { search: `%${search.trim()}%` });
    }

    return query.getRawMany<CredentialContact>();
  }

  private async resolveAuthenticationTypeId(code: AuthenticationTypeCode): Promise<number> {
    const manager = TransactionContext.getManager() ?? this.dataSource.manager;
    const repository = manager.getRepository(AuthenticationTypeEntity);
    const authenticationType = await repository.findOne({
      where: { code },
    });

    if (authenticationType === null) {
      throw new Error(`El tipo de autenticación "${code}" no está configurado`);
    }

    return authenticationType.id;
  }
}
