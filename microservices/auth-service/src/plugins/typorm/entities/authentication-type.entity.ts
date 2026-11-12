import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CredentialEntity } from "./credential.entity";

export enum AuthenticationTypeCode {
  default = "default",
  google = "google",
  microsoft = "microsoft",
}

@Entity({ name: "authentication_type" })
export class AuthenticationTypeEntity {
  @PrimaryGeneratedColumn("increment", { name: "id", type: "int" })
  public id!: number;

  @Column({ name: "code", type: "varchar", length: 30, unique: true })
  public code!: AuthenticationTypeCode;

  @Column({ name: "name", type: "varchar", length: 60 })
  public name!: string;

  @OneToMany(() => CredentialEntity, (credential) => credential.authenticationType)
  public credentials!: CredentialEntity[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;
}
