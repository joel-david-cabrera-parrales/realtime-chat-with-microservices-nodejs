import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { Conversation } from "../../domain/aggregates/conversation.aggregate";
import { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { ConversationTypeValue } from "../../domain/value-objects/conversation-type.value-object";
import { DirectKey } from "../../domain/value-objects/direct-key.value-object";
import { CreateConversationUseCase } from "../../domain/use-cases/create-conversation.use-case";
import { ConversationOutput, CreateConversationInput } from "../../domain/use-cases/dtos/conversation.dto";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";

export class CreateConversationUseCaseImpl extends CreateConversationUseCase {
  constructor(private readonly conversationRepository: ConversationRepository) {
    super();
  }

  public async execute(input: CreateConversationInput): Promise<DomainEventResult<ConversationOutput>> {
    const type = ConversationTypeValue.create(input.type);

    if (type.isDirect()) {
      const directKey = DirectKey.fromParticipants(input.participantCredentialCodes);
      const existing = await this.conversationRepository.findByDirectKey(directKey);

      if (existing !== null) {
        return {
          output: ChatOutputMapper.toConversationOutput(existing.toPrimitives()),
          events: [],
        };
      }
    }

    const conversation = Conversation.create({
      type: input.type,
      title: input.title,
      participantCredentialCodes: input.participantCredentialCodes,
      createdBy: input.createdBy,
    });

    await this.conversationRepository.save(conversation);

    return {
      output: ChatOutputMapper.toConversationOutput(conversation.toPrimitives()),
      events: conversation.pullEvents(),
    };
  }
}
