import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { PaginationCursor } from "../../domain/value-objects/pagination-cursor.value-object";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../domain/constants/pagination.constants";
import { ListConversationsUseCase } from "../../domain/use-cases/list-conversations.use-case";
import { ConversationListOutput, ListConversationsInput } from "../../domain/use-cases/dtos/conversation.dto";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";

export class ListConversationsUseCaseImpl extends ListConversationsUseCase {
  constructor(private readonly conversationRepository: ConversationRepository) {
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

    const last = conversations[conversations.length - 1];
    const nextCursor =
      conversations.length === limit && last !== undefined
        ? PaginationCursor.create(last.createdAt, last.code.value).encode()
        : null;

    return {
      output: {
        conversations: conversations.map((conversation) => ChatOutputMapper.toConversationOutput(conversation.toPrimitives())),
        nextCursor,
      },
      events: [],
    };
  }
}
