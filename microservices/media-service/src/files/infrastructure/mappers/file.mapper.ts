import { FileEntity } from "../../../plugins/typorm/entities/file.entity";
import { FileMetadata } from "../../domain/interfaces/file-metadata.interface";

export class FileMapper {
  public static toPersistence(file: FileMetadata): FileEntity {
    const entity = new FileEntity();

    entity.fileCode = file.fileCode;
    entity.profileCode = file.profileCode;
    entity.category = file.category;
    entity.originalName = file.originalName;
    entity.storedKey = file.storedKey;
    entity.mimeType = file.mimeType;
    entity.sizeBytes = file.sizeBytes;
    entity.bucket = file.bucket;

    return entity;
  }

  public static toDomain(entity: FileEntity): FileMetadata {
    return {
      id: entity.id,
      fileCode: entity.fileCode,
      profileCode: entity.profileCode,
      category: entity.category,
      originalName: entity.originalName,
      storedKey: entity.storedKey,
      mimeType: entity.mimeType,
      sizeBytes: entity.sizeBytes,
      bucket: entity.bucket,
      createdAt: entity.createdAt,
    };
  }
}
