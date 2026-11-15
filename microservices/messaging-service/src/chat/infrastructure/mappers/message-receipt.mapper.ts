import { MessageReceipt } from "../../domain/aggregates/message-receipt.aggregate";
import { MessageReceiptEntity } from "../../../plugins/typorm/entities/message-receipt.entity";

export class MessageReceiptMapper {
  public static toPersistence(receipt: MessageReceipt): MessageReceiptEntity {
    const primitives = receipt.toPrimitives();
    const entity = new MessageReceiptEntity();

    entity.code = primitives.code;
    entity.messageCode = primitives.messageCode;
    entity.conversationCode = primitives.conversationCode;
    entity.credentialCode = primitives.credentialCode;
    entity.status = primitives.status;
    entity.deliveredAt = new Date(primitives.deliveredAt);
    entity.readAt = primitives.readAt === null ? null : new Date(primitives.readAt);

    return entity;
  }

  public static toDomain(entity: MessageReceiptEntity): MessageReceipt {
    return MessageReceipt.rehydrate({
      code: entity.code,
      messageCode: entity.messageCode,
      conversationCode: entity.conversationCode,
      credentialCode: entity.credentialCode,
      status: entity.status,
      deliveredAt: entity.deliveredAt,
      readAt: entity.readAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
