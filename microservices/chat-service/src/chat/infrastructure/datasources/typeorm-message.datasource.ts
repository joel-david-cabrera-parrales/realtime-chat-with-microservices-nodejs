import { DataSource, Repository } from "typeorm";
import { Message } from "../../domain/aggregates/message.aggregate";
import { MessageDataSource } from "../../domain/datasources/message.datasource";
import { ConversationCode } from "../../domain/value-objects/conversation-code.value-object";
import { MessageCode } from "../../domain/value-objects/message-code.value-object";
import { PaginationCursor } from "../../domain/value-objects/pagination-cursor.value-object";
import { MessageEntity } from "../../../plugins/typorm/entities/message.entity";
import { MessageMapper } from "../mappers/message.mapper";

export class TypeOrmMessageDataSource implements MessageDataSource {
  constructor(private readonly dataSource: DataSource) {}

  private get repository(): Repository<MessageEntity> {
    return this.dataSource.getRepository(MessageEntity);
  }

  public async save(message: Message): Promise<void> {
    const entity = MessageMapper.toPersistence(message);
    const existing = await this.repository.findOne({
      where: { code: message.code.value },
    });

    if (existing !== null) {
      entity.id = existing.id;
    }

    await this.repository.save(entity);
  }

  public async findByCode(code: MessageCode): Promise<Message | null> {
    const entity = await this.repository.findOne({
      where: { code: code.value },
    });

    return entity === null ? null : MessageMapper.toDomain(entity);
  }

  public async findByConversation(
    conversationCode: ConversationCode,
    cursor?: PaginationCursor | undefined,
    limit?: number | undefined,
  ): Promise<Message[]> {
    const query = this.repository
      .createQueryBuilder("message")
      .where("message.conversation_code = :conversationCode", { conversationCode: conversationCode.value })
      .andWhere("message.deleted_at IS NULL")
      .orderBy("message.created_at", "ASC")
      .addOrderBy("message.code", "ASC");

    if (cursor !== undefined) {
      query.andWhere(
        "(message.created_at > :cursorCreatedAt) OR (message.created_at = :cursorCreatedAt AND message.code > :cursorCode)",
        {
          cursorCreatedAt: cursor.createdAt,
          cursorCode: cursor.code,
        },
      );
    }

    if (limit !== undefined) {
      query.take(limit);
    }

    const entities = await query.getMany();

    return entities.map((entity) => MessageMapper.toDomain(entity));
  }

  public async findLatestByConversation(conversationCode: ConversationCode): Promise<Message | null> {
    const entity = await this.repository.findOne({
      where: { conversationCode: conversationCode.value, deletedAt: null },
      order: { createdAt: "DESC" },
    });

    return entity === null ? null : MessageMapper.toDomain(entity);
  }

  public async delete(code: MessageCode): Promise<void> {
    await this.repository.update({ code: code.value }, { deletedAt: new Date() });
  }
}
