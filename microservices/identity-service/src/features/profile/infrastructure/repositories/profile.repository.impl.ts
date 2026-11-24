import { Profile } from "../../domain/aggregates/profile.aggregate";
import { ProfileDataSource } from "../../domain/datasources/profile.datasource";
import { ProfileRepository } from "../../domain/repositories/profile.repository";

export class ProfileRepositoryImpl implements ProfileRepository {
  constructor(private readonly profileDataSource: ProfileDataSource) {}

  public save(profile: Profile): Promise<void> {
    return this.profileDataSource.save(profile);
  }

  public findById(id: string): Promise<Profile | null> {
    return this.profileDataSource.findById(id);
  }

  public existsByEmail(email: string): Promise<boolean> {
    return this.profileDataSource.existsByEmail(email);
  }

  public existsById(id: string): Promise<boolean> {
    return this.profileDataSource.existsById(id);
  }

  public findByUsername(username: string): Promise<Profile | null> {
    // Not implemented - email is unique for profiles
    return Promise.resolve(null);
  }

  public delete(id: string): Promise<void> {
    return this.profileDataSource.delete(id);
  }

  public findAll(): Promise<Profile[]> {
    return this.profileDataSource.findAll();
  }
}
