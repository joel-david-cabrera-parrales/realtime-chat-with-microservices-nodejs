import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { AddParticipantInput, ConversationOutput } from "./dtos/conversation.dto";

export abstract class AddParticipantUseCase {
  public abstract execute(input: AddParticipantInput): Promise<DomainEventResult<ConversationOutput>>;
}
