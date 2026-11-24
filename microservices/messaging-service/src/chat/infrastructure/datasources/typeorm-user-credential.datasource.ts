import { DataSource, Repository } from "typeorm";
import { UserCredentialEntity } from "../../../plugins/typorm/entities/user-credential.entity";

export class TypeOrmUserCredentialDataSource {
  constructor(private readonly dataSource: DataSource) {}

  private get repository(): Repository<UserCredentialEntity> {
    return this.dataSource.getRepository(UserCredentialEntity);
  }

  public async upsert(credentialCode: string, username: string, isActive: boolean, fullName?: string | null, email?: string | null): Promise<void> {
    const existing = await this.repository.findOne({
      where: { credentialCode },
    });

    const entity = new UserCredentialEntity();
    entity.credentialCode = credentialCode;
    entity.username = username;
    entity.isActive = isActive;
    entity.fullName = fullName ?? null;
    entity.email = email ?? null;

    if (existing !== null) {
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
    }

    await this.repository.save(entity);
  }

  public async deactivate(credentialCode: string): Promise<void> {
    await this.repository.update({ credentialCode }, { isActive: false });
  }

  public async findByCredentialCode(credentialCode: string): Promise<UserCredentialEntity | null> {
    return this.repository.findOne({ where: { credentialCode } });
  }
}
