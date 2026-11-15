import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { LeaveConversationUseCase } from "../../domain/use-cases/leave-conversation.use-case";
import { ConversationOutput, LeaveConversationInput } from "../../domain/use-cases/dtos/conversation.dto";
import { ChatAccessPolicy } from "../../domain/services/chat-access-policy.service";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";
import { ConversationLoader } from "../services/conversation-loader.service";
import { ConversationRepository } from "../../domain/repositories/conversation.repository";

export class LeaveConversationUseCaseImpl extends LeaveConversationUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly conversationLoader: ConversationLoader,
    private readonly accessPolicy: ChatAccessPolicy,
  ) {
    super();
  }

  public async execute(input: LeaveConversationInput): Promise<ConversationOutput> {
    const conversation = await this.conversationLoader.load(input.conversationCode);
    const actor = CredentialCode.create(input.actorCredentialCode);

    this.accessPolicy.assertIsParticipant(conversation, actor);

    conversation.leave(input.actorCredentialCode);

    await this.conversationRepository.save(conversation);

    return ChatOutputMapper.toConversationOutput(conversation.toPrimitives());
  }
}
