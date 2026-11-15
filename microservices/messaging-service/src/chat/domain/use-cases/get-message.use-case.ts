import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { MessageOutput, GetMessageInput } from "./dtos/message.dto";

export abstract class GetMessageUseCase {
  public abstract execute(input: GetMessageInput): Promise<DomainEventResult<MessageOutput | null>>;
}
