import { AddParticipantInput, ConversationOutput } from "./dtos/conversation.dto";

export abstract class AddParticipantUseCase {
  public abstract execute(input: AddParticipantInput): Promise<ConversationOutput>;
}
