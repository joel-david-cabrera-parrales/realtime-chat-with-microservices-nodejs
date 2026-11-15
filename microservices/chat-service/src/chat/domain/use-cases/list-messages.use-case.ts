import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { MessageListOutput, ListMessagesInput } from "./dtos/message.dto";

export abstract class ListMessagesUseCase {
  public abstract execute(input: ListMessagesInput): Promise<DomainEventResult<MessageListOutput>>;
}
