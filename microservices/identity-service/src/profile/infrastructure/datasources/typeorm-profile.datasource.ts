import { DataSource, Repository } from "typeorm";
import { Profile } from "../../domain/aggregates/profile.aggregate";
import { ProfileDataSource } from "../../domain/datasources/profile.datasource";
import { ProfileEntity } from "../../../plugins/typorm/entities/profile.entity";
import { ProfileMapper } from "../mappers/profile.mapper";
import { TransactionContext } from "../../../shared/infrastructure/persistence/transaction-context";

export class TypeOrmProfileDataSource implements ProfileDataSource {
  constructor(private readonly dataSource: DataSource) {}

  private get repository(): Repository<ProfileEntity> {
    const manager = TransactionContext.getManager() ?? this.dataSource.manager;
    return manager.getRepository(ProfileEntity);
  }

  public async save(profile: Profile): Promise<void> {
    const entity = ProfileMapper.toPersistence(profile);
    const existing = await this.repository.findOne({
      where: { profileCode: profile.id.value },
    });

    if (existing !== null) {
      entity.id = existing.id;
    }

    await this.repository.save(entity);
  }

  public async findById(id: string): Promise<Profile | null> {
    const entity = await this.repository.findOne({
      where: { profileCode: id },
    });

    return entity === null ? null : ProfileMapper.toDomain(entity);
  }

  public async existsById(id: string): Promise<boolean> {
    return this.repository.exists({
      where: { profileCode: id },
    });
  }

  public async existsByEmail(email: string): Promise<boolean> {
    return this.repository.exists({
      where: { email },
      withDeleted: true,
    });
  }

  public async delete(id: string): Promise<void> {
    await this.repository.softDelete({ profileCode: id });
  }

  public async findAll(): Promise<Profile[]> {
    const entities = await this.repository.find({
      order: { createdAt: "DESC" },
    });
    return entities.map((entity) => ProfileMapper.toDomain(entity));
  }
}
