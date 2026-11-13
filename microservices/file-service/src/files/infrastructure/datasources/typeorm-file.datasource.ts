import { DataSource, Repository } from "typeorm";
import { FileDataSource } from "../../domain/datasources/file.datasource";
import { FileCategory } from "../../domain/enums/file-category.enum";
import { FileMetadata } from "../../domain/interfaces/file-metadata.interface";
import { FileEntity } from "../../../plugins/typorm/entities/file.entity";
import { FileMapper } from "../mappers/file.mapper";

export class TypeOrmFileDataSource implements FileDataSource {
  constructor(private readonly dataSource: DataSource) {}

  private get repository(): Repository<FileEntity> {
    return this.dataSource.getRepository(FileEntity);
  }

  public async save(file: FileMetadata): Promise<void> {
    const entity = FileMapper.toPersistence(file);
    const existing = await this.repository.findOne({
      where: { fileCode: file.fileCode },
    });

    if (existing !== null) {
      entity.id = existing.id;
    }

    await this.repository.save(entity);
  }

  public async findByCode(fileCode: string): Promise<FileMetadata | null> {
    const entity = await this.repository.findOne({
      where: { fileCode },
    });

    return entity === null ? null : FileMapper.toDomain(entity);
  }

  public async findByProfileCode(profileCode: string, category?: FileCategory): Promise<FileMetadata[]> {
    const entities = await this.repository.find({
      where: category === undefined ? { profileCode } : { profileCode, category },
      order: { createdAt: "DESC" },
    });

    return entities.map((entity) => FileMapper.toDomain(entity));
  }

  public async delete(fileCode: string): Promise<void> {
    await this.repository.softDelete({ fileCode });
  }
}
