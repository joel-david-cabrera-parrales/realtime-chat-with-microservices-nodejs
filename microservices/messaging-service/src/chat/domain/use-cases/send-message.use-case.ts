import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { MessageOutput, SendMessageInput } from "./dtos/message.dto";

export abstract class SendMessageUseCase {
  public abstract execute(input: SendMessageInput): Promise<DomainEventResult<MessageOutput>>;
}
