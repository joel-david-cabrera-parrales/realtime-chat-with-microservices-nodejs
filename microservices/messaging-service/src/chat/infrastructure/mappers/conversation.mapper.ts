import { Conversation } from "../../domain/aggregates/conversation.aggregate";
import { Participant } from "../../domain/entities/participant.entity";
import { ParticipantPrimitives } from "../../domain/interfaces/conversation.interface";
import { ConversationEntity } from "../../../plugins/typorm/entities/conversation.entity";
import { ConversationParticipantEntity } from "../../../plugins/typorm/entities/conversation-participant.entity";

export class ConversationMapper {
  public static toPersistence(conversation: Conversation): ConversationEntity {
    const primitives = conversation.toPrimitives();
    const entity = new ConversationEntity();

    entity.code = primitives.code;
    entity.type = primitives.type;
    entity.title = primitives.title;
    entity.directKey = primitives.directKey;
    entity.createdBy = primitives.createdBy;
    entity.lastMessageAt = primitives.lastMessageAt === null ? null : new Date(primitives.lastMessageAt);
    entity.deletedAt = primitives.deletedAt === null ? null : new Date(primitives.deletedAt);

    return entity;
  }

  public static toDomain(entity: ConversationEntity, participantEntities: ConversationParticipantEntity[]): Conversation {
    return Conversation.rehydrate({
      code: entity.code,
      type: entity.type,
      title: entity.title,
      directKey: entity.directKey,
      participants: participantEntities.map((participant) => ({
        credentialCode: participant.credentialCode,
        role: participant.role,
        status: participant.status,
        joinedAt: participant.joinedAt,
        leftAt: participant.leftAt,
      })),
      createdBy: entity.createdBy,
      lastMessageAt: entity.lastMessageAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}

export class ParticipantMapper {
  public static toPersistence(participant: Participant, conversationCode: string): ConversationParticipantEntity {
    const primitives = participant.toPrimitives();
    const entity = new ConversationParticipantEntity();

    entity.conversationCode = conversationCode;
    entity.credentialCode = primitives.credentialCode;
    entity.role = primitives.role;
    entity.status = primitives.status;
    entity.joinedAt = new Date(primitives.joinedAt);
    entity.leftAt = primitives.leftAt === null ? null : new Date(primitives.leftAt);

    return entity;
  }

  public static toPrimitives(entity: ConversationParticipantEntity): ParticipantPrimitives {
    return {
      credentialCode: entity.credentialCode,
      role: entity.role,
      status: entity.status,
      joinedAt: entity.joinedAt.toISOString(),
      leftAt: entity.leftAt === null ? null : entity.leftAt.toISOString(),
    };
  }
}
