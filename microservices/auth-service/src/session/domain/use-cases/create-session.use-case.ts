import { TokenIssuer } from "../interfaces/token-issuer.interface";
import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { CreateSessionInput } from "./dtos/create-session.dto";
import { CreateSessionOutput } from "./dtos/session-output.dto";

export abstract class CreateSessionUseCase {
  protected constructor(protected readonly tokenIssuer: TokenIssuer) {}

  public abstract execute(input: CreateSessionInput): Promise<DomainEventResult<CreateSessionOutput>>;
}
