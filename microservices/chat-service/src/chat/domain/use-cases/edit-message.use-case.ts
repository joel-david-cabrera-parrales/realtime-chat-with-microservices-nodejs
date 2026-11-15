import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { EditMessageInput, MessageOutput } from "./dtos/message.dto";

export abstract class EditMessageUseCase {
  public abstract execute(input: EditMessageInput): Promise<DomainEventResult<MessageOutput>>;
}
