import { ConversationPrimitives } from "../../domain/interfaces/conversation.interface";
import { MessagePrimitives } from "../../domain/interfaces/message.interface";
import { MessageReceiptPrimitives } from "../../domain/interfaces/message-receipt.interface";
import { ConversationOutput } from "../../domain/use-cases/dtos/conversation.dto";
import { MessageOutput } from "../../domain/use-cases/dtos/message.dto";
import { MessageReceiptOutput } from "../../domain/use-cases/dtos/message-receipt.dto";

export class ChatOutputMapper {
  public static toConversationOutput(primitives: ConversationPrimitives): ConversationOutput {
    return {
      code: primitives.code,
      type: primitives.type,
      title: primitives.title,
      participants: primitives.participants.map((participant) => ({
        credentialCode: participant.credentialCode,
        role: participant.role,
        status: participant.status,
        joinedAt: participant.joinedAt,
        leftAt: participant.leftAt,
      })),
      createdBy: primitives.createdBy,
      lastMessageAt: primitives.lastMessageAt,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
      deletedAt: primitives.deletedAt,
    };
  }

  public static toMessageOutput(primitives: MessagePrimitives): MessageOutput {
    return {
      code: primitives.code,
      conversationCode: primitives.conversationCode,
      senderCredentialCode: primitives.senderCredentialCode,
      content: primitives.content,
      status: primitives.status,
      deliveredAt: primitives.deliveredAt,
      readAt: primitives.readAt,
      editedAt: primitives.editedAt,
      deletedAt: primitives.deletedAt,
      deletedBy: primitives.deletedBy,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    };
  }

  public static toReceiptOutput(primitives: MessageReceiptPrimitives): MessageReceiptOutput {
    return {
      code: primitives.code,
      messageCode: primitives.messageCode,
      conversationCode: primitives.conversationCode,
      credentialCode: primitives.credentialCode,
      status: primitives.status,
      deliveredAt: primitives.deliveredAt,
      readAt: primitives.readAt,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    };
  }
}
