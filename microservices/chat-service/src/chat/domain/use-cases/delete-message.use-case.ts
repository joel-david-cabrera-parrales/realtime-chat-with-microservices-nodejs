import { DeleteMessageInput, MessageOutput } from "./dtos/message.dto";

export abstract class DeleteMessageUseCase {
  public abstract execute(input: DeleteMessageInput): Promise<MessageOutput>;
}
