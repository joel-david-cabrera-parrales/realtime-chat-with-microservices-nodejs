import { Credential } from "../aggregates/credential.aggregate";
import { AuthenticateCredentialInput } from "../use-cases/dtos/authenticate-credential.dto";

export interface CredentialAuthenticator {
  authenticate(input: AuthenticateCredentialInput): Promise<Credential>;
}
