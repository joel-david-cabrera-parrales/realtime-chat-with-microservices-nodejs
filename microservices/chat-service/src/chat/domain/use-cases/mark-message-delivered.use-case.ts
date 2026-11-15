import { MarkMessageDeliveredInput, MessageOutput } from "./dtos/message.dto";

export abstract class MarkMessageDeliveredUseCase {
  public abstract execute(input: MarkMessageDeliveredInput): Promise<MessageOutput>;
}
