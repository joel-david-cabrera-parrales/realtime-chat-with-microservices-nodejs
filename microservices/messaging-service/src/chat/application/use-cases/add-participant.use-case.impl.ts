import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { AddParticipantUseCase } from "../../domain/use-cases/add-participant.use-case";
import { AddParticipantInput, ConversationOutput } from "../../domain/use-cases/dtos/conversation.dto";
import { ChatAccessPolicy } from "../../domain/services/chat-access-policy.service";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";
import { ConversationLoader } from "../services/conversation-loader.service";
import { ConversationRepository } from "../../domain/repositories/conversation.repository";

export class AddParticipantUseCaseImpl extends AddParticipantUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly conversationLoader: ConversationLoader,
    private readonly accessPolicy: ChatAccessPolicy,
  ) {
    super();
  }

  public async execute(input: AddParticipantInput): Promise<DomainEventResult<ConversationOutput>> {
    const conversation = await this.conversationLoader.load(input.conversationCode);
    const actor = CredentialCode.create(input.actorCredentialCode);

    this.accessPolicy.assertCanManageParticipants(conversation, actor);

    conversation.addParticipant(input.participantCredentialCode);

    await this.conversationRepository.save(conversation);

    return {
      output: ChatOutputMapper.toConversationOutput(conversation.toPrimitives()),
      events: conversation.pullEvents(),
    };
  }
}
