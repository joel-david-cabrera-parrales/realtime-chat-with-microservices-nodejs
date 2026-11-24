import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "user_credentials" })
export class UserCredentialEntity {
  @PrimaryGeneratedColumn("increment", { name: "id", type: "int" })
  public id!: number;

  @Column({ name: "credential_code", type: "uuid", unique: true })
  public credentialCode!: string;

  @Column({ name: "username", type: "varchar", length: 254 })
  public username!: string;

  @Column({ name: "full_name", type: "varchar", length: 120, nullable: true })
  public fullName!: string | null;

  @Column({ name: "email", type: "varchar", length: 254, nullable: true })
  public email!: string | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  public isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;
}