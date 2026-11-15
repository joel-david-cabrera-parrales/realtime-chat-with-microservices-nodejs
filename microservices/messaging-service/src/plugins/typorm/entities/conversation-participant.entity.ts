import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from "typeorm";

@Unique("UQ_conversation_participants_conversation_credential", ["conversationCode", "credentialCode"])
@Entity({ name: "conversation_participants" })
export class ConversationParticipantEntity {
  @PrimaryGeneratedColumn("increment", { name: "id", type: "int" })
  public id!: number;

  @Index("IDX_conversation_participants_conversation_code")
  @Column({ name: "conversation_code", type: "uuid" })
  public conversationCode!: string;

  @Index("IDX_conversation_participants_credential_code")
  @Column({ name: "credential_code", type: "uuid" })
  public credentialCode!: string;

  @Column({ name: "role", type: "varchar", length: 20 })
  public role!: string;

  @Column({ name: "status", type: "varchar", length: 20 })
  public status!: string;

  @Column({ name: "joined_at", type: "timestamptz" })
  public joinedAt!: Date;

  @Column({ name: "left_at", type: "timestamptz", nullable: true })
  public leftAt!: Date | null;
}
