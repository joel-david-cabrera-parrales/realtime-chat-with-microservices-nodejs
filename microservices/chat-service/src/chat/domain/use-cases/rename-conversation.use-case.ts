import { ConversationOutput, RenameConversationInput } from "./dtos/conversation.dto";

export abstract class RenameConversationUseCase {
  public abstract execute(input: RenameConversationInput): Promise<ConversationOutput>;
}
