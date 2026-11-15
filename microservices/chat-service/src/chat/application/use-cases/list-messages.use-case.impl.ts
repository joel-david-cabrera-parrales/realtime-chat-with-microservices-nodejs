import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../domain/constants/pagination.constants";
import { MessageRepository } from "../../domain/repositories/message.repository";
import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { PaginationCursor } from "../../domain/value-objects/pagination-cursor.value-object";
import { ListMessagesUseCase } from "../../domain/use-cases/list-messages.use-case";
import { ListMessagesInput, MessageListOutput } from "../../domain/use-cases/dtos/message.dto";
import { ChatAccessPolicy } from "../../domain/services/chat-access-policy.service";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";
import { ConversationLoader } from "../services/conversation-loader.service";

export class ListMessagesUseCaseImpl extends ListMessagesUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationLoader: ConversationLoader,
    private readonly accessPolicy: ChatAccessPolicy,
  ) {
    super();
  }

  public async execute(input: ListMessagesInput): Promise<MessageListOutput> {
    const limit = Math.min(Math.max(input.limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
    const cursor = input.cursor === undefined ? undefined : PaginationCursor.decode(input.cursor);

    const conversation = await this.conversationLoader.load(input.conversationCode);

    this.accessPolicy.assertIsParticipant(conversation, CredentialCode.create(input.actorCredentialCode));

    const messages = await this.messageRepository.findByConversation(conversation.code, cursor, limit);

    const last = messages[messages.length - 1];
    const nextCursor =
      messages.length === limit && last !== undefined ? PaginationCursor.create(last.createdAt, last.code.value).encode() : null;

    return {
      messages: messages.map((message) => ChatOutputMapper.toMessageOutput(message.toPrimitives())),
      nextCursor,
    };
  }
}
