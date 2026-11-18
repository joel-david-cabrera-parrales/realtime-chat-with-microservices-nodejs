import { Message } from "../../domain/aggregates/message.aggregate";
import { MessageDataSource } from "../../domain/datasources/message.datasource";
import type { ConversationMessageSummary } from "../../domain/datasources/message.datasource";
import { MessageRepository } from "../../domain/repositories/message.repository";
import { ConversationCode } from "../../domain/value-objects/conversation-code.value-object";
import { MessageCode } from "../../domain/value-objects/message-code.value-object";
import { PaginationCursor } from "../../domain/value-objects/pagination-cursor.value-object";

export class MessageRepositoryImpl implements MessageRepository {
  constructor(private readonly messageDataSource: MessageDataSource) {}

  public save(message: Message): Promise<void> {
    return this.messageDataSource.save(message);
  }

  public findByCode(code: MessageCode): Promise<Message | null> {
    return this.messageDataSource.findByCode(code);
  }

  public findByConversation(
    conversationCode: ConversationCode,
    cursor?: PaginationCursor | undefined,
    limit?: number | undefined,
  ): Promise<Message[]> {
    return this.messageDataSource.findByConversation(conversationCode, cursor, limit);
  }

  public findLatestByConversation(conversationCode: ConversationCode): Promise<Message | null> {
    return this.messageDataSource.findLatestByConversation(conversationCode);
  }

  public findConversationSummaries(conversationCodes: string[], credentialCode: string): Promise<ConversationMessageSummary[]> {
    return this.messageDataSource.findConversationSummaries(conversationCodes, credentialCode);
  }

  public delete(code: MessageCode): Promise<void> {
    return this.messageDataSource.delete(code);
  }
}
