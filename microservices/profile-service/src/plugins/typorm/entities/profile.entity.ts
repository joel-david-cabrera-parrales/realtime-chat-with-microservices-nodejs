import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "profiles" })
export class ProfileEntity {
  @PrimaryGeneratedColumn("increment", { name: "id", type: "int" })
  public id!: number;

  @Column({ name: "profile_code", type: "uuid", unique: true })
  public profileCode!: string;

  @Column({ name: "full_name", type: "varchar", length: 120 })
  public fullName!: string;

  @Column({ name: "email", type: "varchar", length: 254, unique: true })
  public email!: string;

  @Column({ name: "phone", type: "varchar", length: 20, nullable: true })
  public phone!: string | null;

  @Column({ name: "birth_date", type: "date", nullable: true })
  public birthDate!: string | null;

  @Column({ name: "gender", type: "varchar", length: 30, nullable: true })
  public gender!: string | null;

  @Column({ name: "bio", type: "varchar", length: 500, nullable: true })
  public bio!: string | null;

  @Column({ name: "avatar_url", type: "varchar", length: 2048, nullable: true })
  public avatarUrl!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true })
  public deletedAt!: Date | null;
}
