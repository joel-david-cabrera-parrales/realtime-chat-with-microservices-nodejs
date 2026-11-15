import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { ConversationListOutput, ListConversationsInput } from "./dtos/conversation.dto";

export abstract class ListConversationsUseCase {
  public abstract execute(input: ListConversationsInput): Promise<DomainEventResult<ConversationListOutput>>;
}
