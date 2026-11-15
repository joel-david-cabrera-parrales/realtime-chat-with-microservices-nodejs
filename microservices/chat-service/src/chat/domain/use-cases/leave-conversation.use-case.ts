import { ConversationOutput, LeaveConversationInput } from "./dtos/conversation.dto";

export abstract class LeaveConversationUseCase {
  public abstract execute(input: LeaveConversationInput): Promise<ConversationOutput>;
}
