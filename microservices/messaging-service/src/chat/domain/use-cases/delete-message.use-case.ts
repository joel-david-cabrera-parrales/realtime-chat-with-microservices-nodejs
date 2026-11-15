import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { DeleteMessageInput, MessageOutput } from "./dtos/message.dto";

export abstract class DeleteMessageUseCase {
  public abstract execute(input: DeleteMessageInput): Promise<DomainEventResult<MessageOutput>>;
}
