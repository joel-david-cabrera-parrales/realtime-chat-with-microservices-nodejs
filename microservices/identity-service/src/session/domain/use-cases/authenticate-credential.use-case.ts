import { Credential } from "../aggregates/credential.aggregate";
import { CredentialAuthenticator } from "../interfaces/credential-authenticator.interface";
import { AuthenticateCredentialInput } from "./dtos/authenticate-credential.dto";

export abstract class AuthenticateCredentialUseCase implements CredentialAuthenticator {
  public abstract authenticate(input: AuthenticateCredentialInput): Promise<Credential>;
}
