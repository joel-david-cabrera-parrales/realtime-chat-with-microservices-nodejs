import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Index("UQ_conversations_direct_key", ["directKey"], { unique: true, where: '"deleted_at" IS NULL' })
@Entity({ name: "conversations" })
export class ConversationEntity {
  @PrimaryGeneratedColumn("increment", { name: "id", type: "int" })
  public id!: number;

  @Column({ name: "code", type: "uuid", unique: true })
  public code!: string;

  @Column({ name: "type", type: "varchar", length: 20 })
  public type!: string;

  @Column({ name: "title", type: "varchar", length: 80, nullable: true })
  public title!: string | null;

  @Column({ name: "direct_key", type: "varchar", length: 64, nullable: true })
  public directKey!: string | null;

  @Column({ name: "created_by", type: "uuid" })
  public createdBy!: string;

  @Column({ name: "last_message_at", type: "timestamptz", nullable: true })
  public lastMessageAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;

  @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
  public deletedAt!: Date | null;
}
