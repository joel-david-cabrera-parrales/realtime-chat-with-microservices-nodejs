import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { MessageRepository } from "../../domain/repositories/message.repository";
import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { PaginationCursor } from "../../domain/value-objects/pagination-cursor.value-object";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../domain/constants/pagination.constants";
import { ListConversationsUseCase } from "../../domain/use-cases/list-conversations.use-case";
import { ConversationListOutput, ListConversationsInput } from "../../domain/use-cases/dtos/conversation.dto";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";

export class ListConversationsUseCaseImpl extends ListConversationsUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
  ) {
    super();
  }

  public async execute(input: ListConversationsInput): Promise<DomainEventResult<ConversationListOutput>> {
    const limit = Math.min(Math.max(input.limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
    const cursor = input.cursor === undefined ? undefined : PaginationCursor.decode(input.cursor);

    const conversations = await this.conversationRepository.findByParticipant(
      CredentialCode.create(input.actorCredentialCode),
      cursor,
      limit,
    );
    const summaries = await this.messageRepository.findConversationSummaries(
      conversations.map((conversation) => conversation.code.value),
      input.actorCredentialCode,
    );
    const summaryByConversation = new Map(summaries.map((summary) => [summary.conversationCode, summary]));

    const last = conversations[conversations.length - 1];
    const nextCursor =
      conversations.length === limit && last !== undefined
        ? PaginationCursor.create(last.createdAt, last.code.value).encode()
        : null;

    return {
      output: {
        conversations: conversations.map((conversation) => {
          const output = ChatOutputMapper.toConversationOutput(conversation.toPrimitives());
          const summary = summaryByConversation.get(conversation.code.value);
          return {
            ...output,
            lastMessage: summary?.lastMessage ?? null,
            unreadCount: summary?.unreadCount ?? 0,
          };
        }),
        nextCursor,
      },
      events: [],
    };
  }
}
