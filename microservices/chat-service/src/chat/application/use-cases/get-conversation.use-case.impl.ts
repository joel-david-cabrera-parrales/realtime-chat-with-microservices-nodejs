import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { GetConversationUseCase } from "../../domain/use-cases/get-conversation.use-case";
import { ConversationOutput, GetConversationInput } from "../../domain/use-cases/dtos/conversation.dto";
import { ChatAccessPolicy } from "../../domain/services/chat-access-policy.service";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";
import { ConversationLoader } from "../services/conversation-loader.service";

export class GetConversationUseCaseImpl extends GetConversationUseCase {
  constructor(
    private readonly conversationLoader: ConversationLoader,
    private readonly accessPolicy: ChatAccessPolicy,
  ) {
    super();
  }

  public async execute(input: GetConversationInput): Promise<ConversationOutput | null> {
    const conversation = await this.conversationLoader.load(input.code);

    this.accessPolicy.assertIsParticipant(conversation, CredentialCode.create(input.actorCredentialCode));

    return ChatOutputMapper.toConversationOutput(conversation.toPrimitives());
  }
}
