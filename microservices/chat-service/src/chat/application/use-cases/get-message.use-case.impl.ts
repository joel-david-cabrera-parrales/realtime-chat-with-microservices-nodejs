import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { GetMessageUseCase } from "../../domain/use-cases/get-message.use-case";
import { GetMessageInput, MessageOutput } from "../../domain/use-cases/dtos/message.dto";
import { ChatAccessPolicy } from "../../domain/services/chat-access-policy.service";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";
import { ConversationLoader } from "../services/conversation-loader.service";
import { MessageLoader } from "../services/message-loader.service";

export class GetMessageUseCaseImpl extends GetMessageUseCase {
  constructor(
    private readonly messageLoader: MessageLoader,
    private readonly conversationLoader: ConversationLoader,
    private readonly accessPolicy: ChatAccessPolicy,
  ) {
    super();
  }

  public async execute(input: GetMessageInput): Promise<MessageOutput | null> {
    const message = await this.messageLoader.load(input.code);
    const conversation = await this.conversationLoader.load(message.conversationCode.value);

    this.accessPolicy.assertIsParticipant(conversation, CredentialCode.create(input.actorCredentialCode));

    return ChatOutputMapper.toMessageOutput(message.toPrimitives());
  }
}
