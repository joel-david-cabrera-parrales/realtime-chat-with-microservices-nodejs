import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserCredentialEntity } from "./user-credential.entity";

@Index("IDX_messages_conversation_created", ["conversationCode", "createdAt", "code"])
@Entity({ name: "messages" })
export class MessageEntity {
  @PrimaryGeneratedColumn("increment", { name: "id", type: "int" })
  public id!: number;

  @Column({ name: "code", type: "uuid", unique: true })
  public code!: string;

  @Column({ name: "conversation_code", type: "uuid" })
  public conversationCode!: string;

  @Column({ name: "sender_credential_code", type: "uuid" })
  public senderCredentialCode!: string;

  @ManyToOne(() => UserCredentialEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "sender_credential_code", referencedColumnName: "credentialCode" })
  public senderCredential!: UserCredentialEntity;

  @Column({ name: "content", type: "text" })
  public content!: string;

  @Column({ name: "status", type: "varchar", length: 20 })
  public status!: string;

  @Column({ name: "delivered_at", type: "timestamptz", nullable: true })
  public deliveredAt!: Date | null;

  @Column({ name: "read_at", type: "timestamptz", nullable: true })
  public readAt!: Date | null;

  @Column({ name: "edited_at", type: "timestamptz", nullable: true })
  public editedAt!: Date | null;

  @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
  public deletedAt!: Date | null;

  @Column({ name: "deleted_by", type: "uuid", nullable: true })
  public deletedBy!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;
}