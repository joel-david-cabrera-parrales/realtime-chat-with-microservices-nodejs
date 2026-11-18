import { DataSource, IsNull, Repository } from "typeorm";
import { Message } from "../../domain/aggregates/message.aggregate";
import { MessageDataSource } from "../../domain/datasources/message.datasource";
import type { ConversationMessageSummary } from "../../domain/datasources/message.datasource";
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
      where: { conversationCode: conversationCode.value, deletedAt: IsNull() },
      order: { createdAt: "DESC" },
    });

    return entity === null ? null : MessageMapper.toDomain(entity);
  }

  public async findConversationSummaries(
    conversationCodes: string[],
    credentialCode: string,
  ): Promise<ConversationMessageSummary[]> {
    if (conversationCodes.length === 0) return [];

    const rows = await this.dataSource.query(
      `
        WITH requested AS (
          SELECT unnest($1::uuid[]) AS conversation_code
        ), latest AS (
          SELECT DISTINCT ON (message.conversation_code)
            message.conversation_code,
            message.code,
            message.sender_credential_code,
            message.content,
            message.created_at
          FROM messages message
          INNER JOIN requested ON requested.conversation_code = message.conversation_code
          WHERE message.deleted_at IS NULL
          ORDER BY message.conversation_code, message.created_at DESC, message.code DESC
        ), unread AS (
          SELECT message.conversation_code, COUNT(*)::int AS unread_count
          FROM messages message
          INNER JOIN requested ON requested.conversation_code = message.conversation_code
          INNER JOIN conversation_participants participant
            ON participant.conversation_code = message.conversation_code
            AND participant.credential_code = $2
            AND participant.status = 'active'
            AND message.created_at >= participant.joined_at
          WHERE message.deleted_at IS NULL
            AND message.sender_credential_code <> $2
            AND NOT EXISTS (
              SELECT 1
              FROM message_receipts receipt
              WHERE receipt.message_code = message.code
                AND receipt.credential_code = $2
                AND receipt.read_at IS NOT NULL
            )
          GROUP BY message.conversation_code
        )
        SELECT
          requested.conversation_code AS "conversationCode",
          latest.code AS "lastMessageCode",
          latest.sender_credential_code AS "lastMessageSenderCredentialCode",
          latest.content AS "lastMessageContent",
          latest.created_at AS "lastMessageCreatedAt",
          COALESCE(unread.unread_count, 0)::int AS "unreadCount"
        FROM requested
        LEFT JOIN latest ON latest.conversation_code = requested.conversation_code
        LEFT JOIN unread ON unread.conversation_code = requested.conversation_code
      `,
      [conversationCodes, credentialCode],
    ) as Array<{
      conversationCode: string;
      lastMessageCode: string | null;
      lastMessageSenderCredentialCode: string | null;
      lastMessageContent: string | null;
      lastMessageCreatedAt: Date | string | null;
      unreadCount: number | string;
    }>;

    return rows.map((row) => ({
      conversationCode: row.conversationCode,
      lastMessage: row.lastMessageCode === null ? null : {
        code: row.lastMessageCode,
        senderCredentialCode: row.lastMessageSenderCredentialCode ?? "",
        content: row.lastMessageContent ?? "",
        createdAt: row.lastMessageCreatedAt instanceof Date
          ? row.lastMessageCreatedAt.toISOString()
          : String(row.lastMessageCreatedAt),
      },
      unreadCount: Number(row.unreadCount),
    }));
  }

  public async delete(code: MessageCode): Promise<void> {
    await this.repository.update({ code: code.value }, { deletedAt: new Date() });
  }
}
