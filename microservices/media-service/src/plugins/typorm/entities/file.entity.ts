import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FileCategory } from "../../../files/domain/enums/file-category.enum";
import { UserCredentialEntity } from "./user-credential.entity";

@Entity({ name: "files" })
@Index("IDX_FILES_PROFILE_CODE", ["profileCode"])
@Index("IDX_FILES_CREDENTIAL_CODE", ["credentialCode"])
@Index("UQ_FILES_PROFILE_PHOTO", ["profileCode"], { unique: true, where: '"category" = \'PROFILE_PHOTO\' AND "deleted_at" IS NULL' })
export class FileEntity {
  @PrimaryGeneratedColumn("increment", { name: "id", type: "int" })
  public id!: number;

  @Column({ name: "file_code", type: "uuid", unique: true })
  public fileCode!: string;

  @Column({ name: "profile_code", type: "uuid" })
  public profileCode!: string;

  @Column({ name: "credential_code", type: "uuid", nullable: true })
  public credentialCode!: string | null;

  @ManyToOne(() => UserCredentialEntity, { onDelete: "SET NULL" })
  @JoinColumn({ name: "credential_code", referencedColumnName: "credentialCode" })
  public credential!: UserCredentialEntity | null;

  @Column({ name: "category", type: "varchar", length: 32 })
  public category!: FileCategory;

  @Column({ name: "original_name", type: "varchar", length: 255 })
  public originalName!: string;

  @Column({ name: "stored_key", type: "varchar", length: 512 })
  public storedKey!: string;

  @Column({ name: "mime_type", type: "varchar", length: 128 })
  public mimeType!: string;

  @Column({ name: "size_bytes", type: "int" })
  public sizeBytes!: number;

  @Column({ name: "bucket", type: "varchar", length: 128 })
  public bucket!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true })
  public deletedAt!: Date | null;
}
