import { Message } from "../../domain/aggregates/message.aggregate";
import { MessageNotFoundException } from "../../domain/exceptions/message-not-found.exception";
import { MessageRepository } from "../../domain/repositories/message.repository";
import { MessageCode } from "../../domain/value-objects/message-code.value-object";

export class MessageLoader {
  constructor(private readonly messageRepository: MessageRepository) {}

  public async load(code: string): Promise<Message> {
    const message = await this.messageRepository.findByCode(MessageCode.create(code));

    if (message === null) {
      throw new MessageNotFoundException(code);
    }

    return message;
  }
}
