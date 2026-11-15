import { MessageOutput, GetMessageInput } from "./dtos/message.dto";

export abstract class GetMessageUseCase {
  public abstract execute(input: GetMessageInput): Promise<MessageOutput | null>;
}
