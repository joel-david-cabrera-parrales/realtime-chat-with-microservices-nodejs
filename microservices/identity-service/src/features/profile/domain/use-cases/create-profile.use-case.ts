import { Profile } from "../aggregates/profile.aggregate";
import { CreateProfileInput } from "../../application/use-cases/dtos/create-profile.dto";
import { ProfileRepository } from "../repositories/profile.repository";

export abstract class CreateProfileUseCase {
  public abstract execute(input: CreateProfileInput): Promise<Profile>;
}
