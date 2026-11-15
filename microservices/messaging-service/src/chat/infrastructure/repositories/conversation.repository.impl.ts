import { Conversation } from "../../domain/aggregates/conversation.aggregate";
import { ConversationDataSource } from "../../domain/datasources/conversation.datasource";
import { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { ConversationCode } from "../../domain/value-objects/conversation-code.value-object";
import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { DirectKey } from "../../domain/value-objects/direct-key.value-object";
import { PaginationCursor } from "../../domain/value-objects/pagination-cursor.value-object";

export class ConversationRepositoryImpl implements ConversationRepository {
  constructor(private readonly conversationDataSource: ConversationDataSource) {}

  public save(conversation: Conversation): Promise<void> {
    return this.conversationDataSource.save(conversation);
  }

  public findByCode(code: ConversationCode): Promise<Conversation | null> {
    return this.conversationDataSource.findByCode(code);
  }

  public findByDirectKey(directKey: DirectKey): Promise<Conversation | null> {
    return this.conversationDataSource.findByDirectKey(directKey);
  }

  public existsByDirectKey(directKey: DirectKey): Promise<boolean> {
    return this.conversationDataSource.existsByDirectKey(directKey);
  }

  public findByParticipant(
    credentialCode: CredentialCode,
    cursor?: PaginationCursor | undefined,
    limit?: number | undefined,
  ): Promise<Conversation[]> {
    return this.conversationDataSource.findByParticipant(credentialCode, cursor, limit);
  }

  public delete(code: ConversationCode): Promise<void> {
    return this.conversationDataSource.delete(code);
  }
}
