import { Profile } from "../../domain/aggregates/profile.aggregate";
import { ProfileDataSource } from "../../domain/datasources/profile.datasource";
import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { Email } from "../../domain/value-objects/email.value-object";
import { ProfileId } from "../../domain/value-objects/profile-id.value-object";

export class ProfileRepositoryImpl implements ProfileRepository {
  constructor(private readonly profileDataSource: ProfileDataSource) {}

  public save(profile: Profile): Promise<void> {
    return this.profileDataSource.save(profile);
  }

  public findById(id: ProfileId): Promise<Profile | null> {
    return this.profileDataSource.findById(id);
  }

  public existsById(id: ProfileId): Promise<boolean> {
    return this.profileDataSource.existsById(id);
  }

  public existsByEmail(email: Email): Promise<boolean> {
    return this.profileDataSource.existsByEmail(email);
  }

  public delete(id: ProfileId): Promise<void> {
    return this.profileDataSource.delete(id);
  }

  public findAll(): Promise<Profile[]> {
    return this.profileDataSource.findAll();
  }
}
