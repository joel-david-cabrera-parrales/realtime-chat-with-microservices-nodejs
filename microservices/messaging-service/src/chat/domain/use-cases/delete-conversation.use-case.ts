import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { ConversationOutput, DeleteConversationInput } from "./dtos/conversation.dto";

export abstract class DeleteConversationUseCase {
  public abstract execute(input: DeleteConversationInput): Promise<DomainEventResult<ConversationOutput>>;
}
