import { Credential } from "../aggregates/credential.aggregate";
import { CreateCredentialInput } from "./dtos/create-credential.dto";

export abstract class CreateCredentialUseCase {
  public abstract execute(input: CreateCredentialInput): Promise<Credential>;
}
