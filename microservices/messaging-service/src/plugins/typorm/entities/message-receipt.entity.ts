import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Unique("UQ_message_receipts_message_credential", ["messageCode", "credentialCode"])
@Entity({ name: "message_receipts" })
export class MessageReceiptEntity {
  @PrimaryGeneratedColumn("increment", { name: "id", type: "int" })
  public id!: number;

  @Column({ name: "code", type: "uuid", unique: true })
  public code!: string;

  @Index("IDX_message_receipts_message_code")
  @Column({ name: "message_code", type: "uuid" })
  public messageCode!: string;

  @Column({ name: "conversation_code", type: "uuid" })
  public conversationCode!: string;

  @Column({ name: "credential_code", type: "uuid" })
  public credentialCode!: string;

  @Column({ name: "status", type: "varchar", length: 20 })
  public status!: string;

  @Column({ name: "delivered_at", type: "timestamptz" })
  public deliveredAt!: Date;

  @Column({ name: "read_at", type: "timestamptz", nullable: true })
  public readAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;
}
