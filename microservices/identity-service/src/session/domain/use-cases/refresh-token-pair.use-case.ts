import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { RefreshTokenPairInput, RefreshTokenPairOutput } from "./dtos/refresh-token-pair.dto";

export abstract class RefreshTokenPairUseCase {
  public abstract execute(input: RefreshTokenPairInput): Promise<DomainEventResult<RefreshTokenPairOutput>>;
}
