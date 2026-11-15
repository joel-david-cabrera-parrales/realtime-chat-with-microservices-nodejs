import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { RenameConversationUseCase } from "../../domain/use-cases/rename-conversation.use-case";
import { ConversationOutput, RenameConversationInput } from "../../domain/use-cases/dtos/conversation.dto";
import { ChatAccessPolicy } from "../../domain/services/chat-access-policy.service";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";
import { ConversationLoader } from "../services/conversation-loader.service";
import { ConversationRepository } from "../../domain/repositories/conversation.repository";

export class RenameConversationUseCaseImpl extends RenameConversationUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly conversationLoader: ConversationLoader,
    private readonly accessPolicy: ChatAccessPolicy,
  ) {
    super();
  }

  public async execute(input: RenameConversationInput): Promise<ConversationOutput> {
    const conversation = await this.conversationLoader.load(input.conversationCode);
    const actor = CredentialCode.create(input.actorCredentialCode);

    this.accessPolicy.assertCanManageParticipants(conversation, actor);

    conversation.rename(input.title);

    await this.conversationRepository.save(conversation);

    return ChatOutputMapper.toConversationOutput(conversation.toPrimitives());
  }
}
