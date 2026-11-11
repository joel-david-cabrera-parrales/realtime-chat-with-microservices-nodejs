import { DataSource, Repository } from "typeorm";
import { Profile } from "../../domain/aggregates/profile.aggregate";
import { ProfileDataSource } from "../../domain/datasources/profile.datasource";
import { Email } from "../../domain/value-objects/email.value-object";
import { ProfileId } from "../../domain/value-objects/profile-id.value-object";
import { ProfileEntity } from "../../../plugins/typorm/entities/profile.entity";
import { ProfileMapper } from "../mappers/profile.mapper";

export class TypeOrmProfileDataSource implements ProfileDataSource {
  constructor(private readonly dataSource: DataSource) {}

  private get repository(): Repository<ProfileEntity> {
    return this.dataSource.getRepository(ProfileEntity);
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

  public async findById(id: ProfileId): Promise<Profile | null> {
    const entity = await this.repository.findOne({
      where: { profileCode: id.value },
    });

    return entity === null ? null : ProfileMapper.toDomain(entity);
  }

  public async existsById(id: ProfileId): Promise<boolean> {
    return this.repository.exists({
      where: { profileCode: id.value },
    });
  }

  public async existsByEmail(email: Email): Promise<boolean> {
    return this.repository.exists({
      where: { email: email.value },
      withDeleted: true,
    });
  }

  public async delete(id: ProfileId): Promise<void> {
    await this.repository.softDelete({ profileCode: id.value });
  }
}
