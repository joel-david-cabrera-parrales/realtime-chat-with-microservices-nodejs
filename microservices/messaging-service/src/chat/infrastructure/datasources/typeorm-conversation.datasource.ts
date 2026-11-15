import { DataSource, IsNull, Repository } from "typeorm";
import { Conversation } from "../../domain/aggregates/conversation.aggregate";
import { ConversationDataSource } from "../../domain/datasources/conversation.datasource";
import { ConversationCode } from "../../domain/value-objects/conversation-code.value-object";
import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { DirectKey } from "../../domain/value-objects/direct-key.value-object";
import { PaginationCursor } from "../../domain/value-objects/pagination-cursor.value-object";
import { ConversationEntity } from "../../../plugins/typorm/entities/conversation.entity";
import { ConversationParticipantEntity } from "../../../plugins/typorm/entities/conversation-participant.entity";
import { ConversationMapper } from "../mappers/conversation.mapper";

export class TypeOrmConversationDataSource implements ConversationDataSource {
  constructor(private readonly dataSource: DataSource) {}

  private get repository(): Repository<ConversationEntity> {
    return this.dataSource.getRepository(ConversationEntity);
  }

  private get participantRepository(): Repository<ConversationParticipantEntity> {
    return this.dataSource.getRepository(ConversationParticipantEntity);
  }

  public async save(conversation: Conversation): Promise<void> {
    const entity = ConversationMapper.toPersistence(conversation);
    const existing = await this.repository.findOne({
      where: { code: conversation.code.value },
    });

    if (existing !== null) {
      entity.id = existing.id;
    }

    await this.repository.save(entity);

    for (const participant of conversation.participants) {
      await this.saveParticipant(participant.credentialCode.value, conversation.code.value, participant.toPrimitives());
    }
  }

  public async findByCode(code: ConversationCode): Promise<Conversation | null> {
    const entity = await this.repository.findOne({
      where: { code: code.value, deletedAt: IsNull() },
    });

    if (entity === null) {
      return null;
    }

    const participants = await this.participantRepository.find({
      where: { conversationCode: entity.code },
    });

    return ConversationMapper.toDomain(entity, participants);
  }

  public async findByDirectKey(directKey: DirectKey): Promise<Conversation | null> {
    const entity = await this.repository.findOne({
      where: { directKey: directKey.value, deletedAt: IsNull() },
    });

    if (entity === null) {
      return null;
    }

    const participants = await this.participantRepository.find({
      where: { conversationCode: entity.code },
    });

    return ConversationMapper.toDomain(entity, participants);
  }

  public async existsByDirectKey(directKey: DirectKey): Promise<boolean> {
    return this.repository.exists({
      where: { directKey: directKey.value, deletedAt: IsNull() },
    });
  }

  public async findByParticipant(
    credentialCode: CredentialCode,
    cursor?: PaginationCursor | undefined,
    limit?: number | undefined,
  ): Promise<Conversation[]> {
    const query = this.repository
      .createQueryBuilder("conversation")
      .innerJoin(ConversationParticipantEntity, "participant", "participant.conversation_code = conversation.code")
      .where("participant.credential_code = :credentialCode", { credentialCode: credentialCode.value })
      .andWhere("participant.status = :participantStatus", { participantStatus: "active" })
      .andWhere("conversation.deleted_at IS NULL")
      .orderBy("conversation.created_at", "DESC")
      .addOrderBy("conversation.code", "DESC");

    if (cursor !== undefined) {
      query.andWhere(
        "(conversation.created_at < :cursorCreatedAt) OR (conversation.created_at = :cursorCreatedAt AND conversation.code < :cursorCode)",
        {
          cursorCreatedAt: cursor.createdAt,
          cursorCode: cursor.code,
        },
      );
    }

    if (limit !== undefined) {
      query.take(limit);
    }

    const conversations = await query.getMany();

    return Promise.all(conversations.map((entity) => this.hydrate(entity)));
  }

  public async delete(code: ConversationCode): Promise<void> {
    await this.repository.update({ code: code.value }, { deletedAt: new Date() });
  }

  private async hydrate(entity: ConversationEntity): Promise<Conversation> {
    const participants = await this.participantRepository.find({
      where: { conversationCode: entity.code },
    });

    return ConversationMapper.toDomain(entity, participants);
  }

  private async saveParticipant(
    credentialCode: string,
    conversationCode: string,
    primitives: { role: string; status: string; joinedAt: string; leftAt: string | null },
  ): Promise<void> {
    const existing = await this.participantRepository.findOne({
      where: { conversationCode, credentialCode },
    });

    const entity = new ConversationParticipantEntity();

    entity.conversationCode = conversationCode;
    entity.credentialCode = credentialCode;
    entity.role = primitives.role;
    entity.status = primitives.status;
    entity.joinedAt = new Date(primitives.joinedAt);
    entity.leftAt = primitives.leftAt === null ? null : new Date(primitives.leftAt);

    if (existing !== null) {
      entity.id = existing.id;
    }

    await this.participantRepository.save(entity);
  }
}
