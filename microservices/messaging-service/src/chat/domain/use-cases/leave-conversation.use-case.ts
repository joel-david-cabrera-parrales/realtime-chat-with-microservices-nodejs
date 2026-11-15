import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { ConversationOutput, LeaveConversationInput } from "./dtos/conversation.dto";

export abstract class LeaveConversationUseCase {
  public abstract execute(input: LeaveConversationInput): Promise<DomainEventResult<ConversationOutput>>;
}
