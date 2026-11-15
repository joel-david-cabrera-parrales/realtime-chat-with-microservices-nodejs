import { MessageReceipt } from "../../domain/aggregates/message-receipt.aggregate";
import { MessageReceiptRepository } from "../../domain/repositories/message-receipt.repository";
import { MessageRepository } from "../../domain/repositories/message.repository";
import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { MarkMessageDeliveredUseCase } from "../../domain/use-cases/mark-message-delivered.use-case";
import { MarkMessageDeliveredInput, MessageOutput } from "../../domain/use-cases/dtos/message.dto";
import { ChatAccessPolicy } from "../../domain/services/chat-access-policy.service";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";
import { ConversationLoader } from "../services/conversation-loader.service";
import { MessageLoader } from "../services/message-loader.service";

export class MarkMessageDeliveredUseCaseImpl extends MarkMessageDeliveredUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly messageReceiptRepository: MessageReceiptRepository,
    private readonly messageLoader: MessageLoader,
    private readonly conversationLoader: ConversationLoader,
    private readonly accessPolicy: ChatAccessPolicy,
  ) {
    super();
  }

  public async execute(input: MarkMessageDeliveredInput): Promise<MessageOutput> {
    const message = await this.messageLoader.load(input.code);
    const conversation = await this.conversationLoader.load(message.conversationCode.value);
    const actor = CredentialCode.create(input.actorCredentialCode);

    this.accessPolicy.assertIsParticipant(conversation, actor);

    const receipt = await this.messageReceiptRepository.findByMessageAndCredential(message.code, actor);

    if (receipt === null) {
      await this.messageReceiptRepository.save(
        MessageReceipt.create({
          messageCode: message.code.value,
          conversationCode: message.conversationCode.value,
          credentialCode: actor.value,
        }),
      );
    }

    message.markDelivered();
    await this.messageRepository.save(message);

    return ChatOutputMapper.toMessageOutput(message.toPrimitives());
  }
}
