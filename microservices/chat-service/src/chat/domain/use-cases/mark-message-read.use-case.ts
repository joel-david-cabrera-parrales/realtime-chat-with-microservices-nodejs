import { MarkMessageReadInput, MessageOutput } from "./dtos/message.dto";

export abstract class MarkMessageReadUseCase {
  public abstract execute(input: MarkMessageReadInput): Promise<MessageOutput>;
}
