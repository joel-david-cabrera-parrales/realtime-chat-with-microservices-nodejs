import { ConversationOutput, GetConversationInput } from "./dtos/conversation.dto";

export abstract class GetConversationUseCase {
  public abstract execute(input: GetConversationInput): Promise<ConversationOutput | null>;
}
