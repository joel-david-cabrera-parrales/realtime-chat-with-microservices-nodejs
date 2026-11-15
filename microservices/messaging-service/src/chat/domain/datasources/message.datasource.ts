import { Message } from "../aggregates/message.aggregate";
import { ConversationCode } from "../value-objects/conversation-code.value-object";
import { MessageCode } from "../value-objects/message-code.value-object";
import { PaginationCursor } from "../value-objects/pagination-cursor.value-object";

export abstract class MessageDataSource {
  abstract save(message: Message): Promise<void>;
  abstract findByCode(code: MessageCode): Promise<Message | null>;
  abstract findByConversation(
    conversationCode: ConversationCode,
    cursor?: PaginationCursor | undefined,
    limit?: number | undefined,
  ): Promise<Message[]>;
  abstract findLatestByConversation(conversationCode: ConversationCode): Promise<Message | null>;
  abstract delete(code: MessageCode): Promise<void>;
}
