import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { SessionStatus } from "../../../session/domain/value-objects/session-status.value-object";
import { CredentialEntity } from "./credential.entity";

@Entity({ name: "session" })
export class SessionEntity {
  @PrimaryGeneratedColumn("increment", { name: "id", type: "int" })
  public id!: number;

  @Column({
    name: "session_code",
    type: "uuid",
    unique: true,
    default: () => "gen_random_uuid()",
  })
  public sessionCode!: string;

  @Column({ name: "credential_id", type: "int" })
  public credentialId!: number;

  @ManyToOne(() => CredentialEntity, (credential) => credential.sessions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "credential_id" })
  public credential!: CredentialEntity;

  @Column({ name: "profile_code", type: "uuid" })
  public profileCode!: string;

  @Column({ name: "status", type: "varchar", length: 30 })
  public status!: SessionStatus;

  @Column({ name: "ip_address", type: "varchar", length: 45, nullable: true })
  public ipAddress!: string | null;

  @Column({ name: "user_agent", type: "varchar", length: 512, nullable: true })
  public userAgent!: string | null;

  @Column({ name: "last_activity_at", type: "timestamptz" })
  public lastActivityAt!: Date;

  @Column({ name: "expires_at", type: "timestamptz" })
  public expiresAt!: Date;

  @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
  public revokedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;
}
