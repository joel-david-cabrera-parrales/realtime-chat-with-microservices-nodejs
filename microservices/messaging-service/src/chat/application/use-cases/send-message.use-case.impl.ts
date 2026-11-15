import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { Message } from "../../domain/aggregates/message.aggregate";
import { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { MessageRepository } from "../../domain/repositories/message.repository";
import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { SendMessageUseCase } from "../../domain/use-cases/send-message.use-case";
import { MessageOutput, SendMessageInput } from "../../domain/use-cases/dtos/message.dto";
import { ChatAccessPolicy } from "../../domain/services/chat-access-policy.service";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";
import { ConversationLoader } from "../services/conversation-loader.service";

export class SendMessageUseCaseImpl extends SendMessageUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly conversationLoader: ConversationLoader,
    private readonly accessPolicy: ChatAccessPolicy,
  ) {
    super();
  }

  public async execute(input: SendMessageInput): Promise<DomainEventResult<MessageOutput>> {
    const conversation = await this.conversationLoader.load(input.conversationCode);
    const sender = CredentialCode.create(input.senderCredentialCode);

    this.accessPolicy.assertCanSend(conversation, sender);

    const message = Message.create({
      conversationCode: conversation.code.value,
      senderCredentialCode: sender.value,
      content: input.content,
    });

    await this.messageRepository.save(message);

    conversation.touchLastMessage(message.createdAt);
    await this.conversationRepository.save(conversation);

    return {
      output: ChatOutputMapper.toMessageOutput(message.toPrimitives()),
      events: message.pullEvents(),
    };
  }
}
