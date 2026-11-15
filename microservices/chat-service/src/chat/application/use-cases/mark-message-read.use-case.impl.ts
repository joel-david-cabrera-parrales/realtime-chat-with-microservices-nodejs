import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { MessageReceipt } from "../../domain/aggregates/message-receipt.aggregate";
import { MessageReceiptRepository } from "../../domain/repositories/message-receipt.repository";
import { MessageRepository } from "../../domain/repositories/message.repository";
import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { MarkMessageReadUseCase } from "../../domain/use-cases/mark-message-read.use-case";
import { MarkMessageReadInput, MessageOutput } from "../../domain/use-cases/dtos/message.dto";
import { ChatAccessPolicy } from "../../domain/services/chat-access-policy.service";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";
import { ConversationLoader } from "../services/conversation-loader.service";
import { MessageLoader } from "../services/message-loader.service";

export class MarkMessageReadUseCaseImpl extends MarkMessageReadUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly messageReceiptRepository: MessageReceiptRepository,
    private readonly messageLoader: MessageLoader,
    private readonly conversationLoader: ConversationLoader,
    private readonly accessPolicy: ChatAccessPolicy,
  ) {
    super();
  }

  public async execute(input: MarkMessageReadInput): Promise<DomainEventResult<MessageOutput>> {
    const message = await this.messageLoader.load(input.code);
    const conversation = await this.conversationLoader.load(message.conversationCode.value);
    const actor = CredentialCode.create(input.actorCredentialCode);

    this.accessPolicy.assertIsParticipant(conversation, actor);

    const existing = await this.messageReceiptRepository.findByMessageAndCredential(message.code, actor);

    if (existing === null) {
      const receipt = MessageReceipt.create({
        messageCode: message.code.value,
        conversationCode: message.conversationCode.value,
        credentialCode: actor.value,
      });

      receipt.markRead();

      await this.messageReceiptRepository.save(receipt);
    } else {
      existing.markRead();

      await this.messageReceiptRepository.save(existing);
    }

    message.markRead(actor);
    await this.messageRepository.save(message);

    return {
      output: ChatOutputMapper.toMessageOutput(message.toPrimitives()),
      events: message.pullEvents(),
    };
  }
}
