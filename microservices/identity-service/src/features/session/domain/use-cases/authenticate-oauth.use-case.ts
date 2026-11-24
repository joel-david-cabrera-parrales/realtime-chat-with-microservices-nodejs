import { Credential } from "../aggregates/credential.aggregate";
import { AuthenticateOAuthInput } from "./dtos/authenticate-oauth.dto";
import { DomainEventResult } from "../../../../shared/domain/events/domain-event-result";

export abstract class AuthenticateOAuthUseCase {
  public abstract execute(input: AuthenticateOAuthInput): Promise<DomainEventResult<Credential>>;
}
