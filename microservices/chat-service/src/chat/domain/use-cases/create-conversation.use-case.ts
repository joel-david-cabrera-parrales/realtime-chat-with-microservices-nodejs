import { ConversationOutput, CreateConversationInput } from "./dtos/conversation.dto";

export abstract class CreateConversationUseCase {
  public abstract execute(input: CreateConversationInput): Promise<ConversationOutput>;
}
