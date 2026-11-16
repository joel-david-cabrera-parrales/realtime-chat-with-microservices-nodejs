import { DataSource, Repository } from "typeorm";
import { Credential } from "../../domain/aggregates/credential.aggregate";
import { AuthenticationTypeCode } from "../../domain/constants/authentication-type.constants";
import { CredentialDataSource } from "../../domain/datasources/credential.datasource";
import { CredentialId } from "../../domain/value-objects/credential-id.value-object";
import { Username } from "../../domain/value-objects/username.value-object";
import { AuthenticationTypeEntity } from "../../../plugins/typorm/entities/authentication-type.entity";
import { CredentialEntity } from "../../../plugins/typorm/entities/credential.entity";
import { CredentialMapper } from "../mappers/credential.mapper";

export class TypeOrmCredentialDataSource implements CredentialDataSource {
  constructor(private readonly dataSource: DataSource) {}

  private get repository(): Repository<CredentialEntity> {
    return this.dataSource.getRepository(CredentialEntity);
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

  private async resolveAuthenticationTypeId(code: AuthenticationTypeCode): Promise<number> {
    const repository = this.dataSource.getRepository(AuthenticationTypeEntity);
    const authenticationType = await repository.findOne({
      where: { code },
    });

    if (authenticationType === null) {
      throw new Error(`El tipo de autenticación "${code}" no está configurado`);
    }

    return authenticationType.id;
  }
}
