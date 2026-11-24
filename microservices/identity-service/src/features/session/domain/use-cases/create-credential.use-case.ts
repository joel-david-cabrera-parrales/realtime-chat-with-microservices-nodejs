import { Credential } from "../aggregates/credential.aggregate";
import { CreateCredentialInput } from "./dtos/create-credential.dto";
import { DomainEventResult } from "../../../../shared/domain/events/domain-event-result";

export abstract class CreateCredentialUseCase {
  public abstract execute(input: CreateCredentialInput): Promise<DomainEventResult<Credential>>;
}
