import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { DeleteConversationUseCase } from "../../domain/use-cases/delete-conversation.use-case";
import { ConversationOutput, DeleteConversationInput } from "../../domain/use-cases/dtos/conversation.dto";
import { ChatAccessPolicy } from "../../domain/services/chat-access-policy.service";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";
import { ConversationLoader } from "../services/conversation-loader.service";
import { ConversationRepository } from "../../domain/repositories/conversation.repository";

export class DeleteConversationUseCaseImpl extends DeleteConversationUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly conversationLoader: ConversationLoader,
    private readonly accessPolicy: ChatAccessPolicy,
  ) {
    super();
  }

  public async execute(input: DeleteConversationInput): Promise<DomainEventResult<ConversationOutput>> {
    const conversation = await this.conversationLoader.load(input.conversationCode);
    const actor = CredentialCode.create(input.actorCredentialCode);

    if (conversation.type.isGroup()) {
      this.accessPolicy.assertCanManageParticipants(conversation, actor);
    } else {
      this.accessPolicy.assertIsParticipant(conversation, actor);
    }

    conversation.softDelete();

    await this.conversationRepository.save(conversation);

    return {
      output: ChatOutputMapper.toConversationOutput(conversation.toPrimitives()),
      events: conversation.pullEvents(),
    };
  }
}
