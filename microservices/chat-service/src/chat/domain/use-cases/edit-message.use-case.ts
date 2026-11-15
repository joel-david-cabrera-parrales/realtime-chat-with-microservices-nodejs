import { EditMessageInput, MessageOutput } from "./dtos/message.dto";

export abstract class EditMessageUseCase {
  public abstract execute(input: EditMessageInput): Promise<MessageOutput>;
}
