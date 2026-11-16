import { Credential } from "../aggregates/credential.aggregate";
import { AuthenticateOAuthInput } from "./dtos/authenticate-oauth.dto";

export abstract class AuthenticateOAuthUseCase {
  public abstract execute(input: AuthenticateOAuthInput): Promise<Credential>;
}
