import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { ConversationOutput, GetConversationInput } from "./dtos/conversation.dto";

export abstract class GetConversationUseCase {
  public abstract execute(input: GetConversationInput): Promise<DomainEventResult<ConversationOutput | null>>;
}
