import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { ConversationOutput, RemoveParticipantInput } from "./dtos/conversation.dto";

export abstract class RemoveParticipantUseCase {
  public abstract execute(input: RemoveParticipantInput): Promise<DomainEventResult<ConversationOutput>>;
}
