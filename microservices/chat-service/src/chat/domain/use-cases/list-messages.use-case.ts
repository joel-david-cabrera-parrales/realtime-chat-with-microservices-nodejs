import { MessageListOutput, ListMessagesInput } from "./dtos/message.dto";

export abstract class ListMessagesUseCase {
  public abstract execute(input: ListMessagesInput): Promise<MessageListOutput>;
}
