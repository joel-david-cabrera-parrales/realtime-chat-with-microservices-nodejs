import { Message } from "../../domain/aggregates/message.aggregate";
import { MessageEntity } from "../../../plugins/typorm/entities/message.entity";

export class MessageMapper {
  public static toPersistence(message: Message): MessageEntity {
    const primitives = message.toPrimitives();
    const entity = new MessageEntity();

    entity.code = primitives.code;
    entity.conversationCode = primitives.conversationCode;
    entity.senderCredentialCode = primitives.senderCredentialCode;
    entity.content = primitives.content;
    entity.status = primitives.status;
    entity.deliveredAt = primitives.deliveredAt === null ? null : new Date(primitives.deliveredAt);
    entity.readAt = primitives.readAt === null ? null : new Date(primitives.readAt);
    entity.editedAt = primitives.editedAt === null ? null : new Date(primitives.editedAt);
    entity.deletedAt = primitives.deletedAt === null ? null : new Date(primitives.deletedAt);
    entity.deletedBy = primitives.deletedBy;

    return entity;
  }

  public static toDomain(entity: MessageEntity): Message {
    return Message.rehydrate({
      code: entity.code,
      conversationCode: entity.conversationCode,
      senderCredentialCode: entity.senderCredentialCode,
      content: entity.content,
      status: entity.status,
      deliveredAt: entity.deliveredAt,
      readAt: entity.readAt,
      editedAt: entity.editedAt,
      deletedAt: entity.deletedAt,
      deletedBy: entity.deletedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
