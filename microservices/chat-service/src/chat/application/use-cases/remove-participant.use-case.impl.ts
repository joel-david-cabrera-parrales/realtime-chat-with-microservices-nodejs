import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { RemoveParticipantUseCase } from "../../domain/use-cases/remove-participant.use-case";
import { ConversationOutput, RemoveParticipantInput } from "../../domain/use-cases/dtos/conversation.dto";
import { ChatAccessPolicy } from "../../domain/services/chat-access-policy.service";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";
import { ConversationLoader } from "../services/conversation-loader.service";
import { ConversationRepository } from "../../domain/repositories/conversation.repository";

export class RemoveParticipantUseCaseImpl extends RemoveParticipantUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly conversationLoader: ConversationLoader,
    private readonly accessPolicy: ChatAccessPolicy,
  ) {
    super();
  }

  public async execute(input: RemoveParticipantInput): Promise<ConversationOutput> {
    const conversation = await this.conversationLoader.load(input.conversationCode);
    const actor = CredentialCode.create(input.actorCredentialCode);

    this.accessPolicy.assertCanManageParticipants(conversation, actor);

    conversation.removeParticipant(input.participantCredentialCode);

    await this.conversationRepository.save(conversation);

    return ChatOutputMapper.toConversationOutput(conversation.toPrimitives());
  }
}
