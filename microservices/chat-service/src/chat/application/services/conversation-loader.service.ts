import { Conversation } from "../../domain/aggregates/conversation.aggregate";
import { ConversationNotFoundException } from "../../domain/exceptions/conversation-not-found.exception";
import { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { ConversationCode } from "../../domain/value-objects/conversation-code.value-object";

export class ConversationLoader {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  public async load(code: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findByCode(ConversationCode.create(code));

    if (conversation === null) {
      throw new ConversationNotFoundException(code);
    }

    return conversation;
  }
}
