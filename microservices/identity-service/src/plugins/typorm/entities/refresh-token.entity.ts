import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TokenStatus } from "../../../features/session/domain/value-objects/token-status.value-object";
import { CredentialEntity } from "./credential.entity";

@Entity({ name: "refresh_token" })
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn("increment", { name: "id", type: "int" })
  public id!: number;

  @Column({
    name: "token_code",
    type: "uuid",
    unique: true,
    default: () => "gen_random_uuid()",
  })
  public tokenCode!: string;

  @Column({ name: "session_id", type: "uuid" })
  public sessionId!: string;

  @Column({ name: "token_hash", type: "varchar", length: 255 })
  public tokenHash!: string;

  @Column({ name: "credential_id", type: "int" })
  public credentialId!: number;

  @ManyToOne(() => CredentialEntity, (credential) => credential.refreshTokens, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "credential_id" })
  public credential!: CredentialEntity;

  @Column({ name: "profile_code", type: "uuid" })
  public profileCode!: string;

  @Column({ name: "status", type: "varchar", length: 30 })
  public status!: TokenStatus;

  @Column({ name: "expires_at", type: "timestamptz" })
  public expiresAt!: Date;

  @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
  public revokedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true })
  public deletedAt!: Date | null;
}
