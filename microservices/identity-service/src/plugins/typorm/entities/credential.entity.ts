import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { AuthenticationTypeEntity } from "./authentication-type.entity";
import { ProfileEntity } from "./profile.entity";
import { RefreshTokenEntity } from "./refresh-token.entity";
import { SessionEntity } from "./session.entity";

@Entity({ name: "credential" })
export class CredentialEntity {
  @PrimaryGeneratedColumn("increment", { name: "id", type: "int" })
  public id!: number;

  @Column({
    name: "credential_code",
    type: "uuid",
    unique: true,
    default: () => "gen_random_uuid()",
  })
  public credentialCode!: string;

  @Column({ name: "username", type: "varchar", length: 254, unique: true })
  public username!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255, nullable: true })
  public passwordHash!: string | null;

  @Column({ name: "authentication_type_id", type: "int" })
  public authenticationTypeId!: number;

  @ManyToOne(() => AuthenticationTypeEntity, (authenticationType) => authenticationType.credentials, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "authentication_type_id" })
  public authenticationType!: AuthenticationTypeEntity;

  @OneToOne(() => ProfileEntity, (profile) => profile.credential, { onDelete: "CASCADE" })
  @JoinColumn({ name: "profile_code", referencedColumnName: "profileCode" })
  public profile!: ProfileEntity;

  @Column({ name: "profile_code", type: "uuid", unique: true })
  public profileCode!: string;

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.credential)
  public refreshTokens!: RefreshTokenEntity[];

  @OneToMany(() => SessionEntity, (session) => session.credential)
  public sessions!: SessionEntity[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true })
  public deletedAt!: Date | null;
}
