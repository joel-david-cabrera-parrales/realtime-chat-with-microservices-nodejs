import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { ConversationOutput, RenameConversationInput } from "./dtos/conversation.dto";

export abstract class RenameConversationUseCase {
  public abstract execute(input: RenameConversationInput): Promise<DomainEventResult<ConversationOutput>>;
}
