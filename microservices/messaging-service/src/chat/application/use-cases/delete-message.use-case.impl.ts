import { DomainEventResult } from "../../../shared/domain/events/domain-event-result";
import { MessageRepository } from "../../domain/repositories/message.repository";
import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { DeleteMessageUseCase } from "../../domain/use-cases/delete-message.use-case";
import { DeleteMessageInput, MessageOutput } from "../../domain/use-cases/dtos/message.dto";
import { ChatAccessPolicy } from "../../domain/services/chat-access-policy.service";
import { ChatOutputMapper } from "../mappers/chat-output.mapper";
import { ConversationLoader } from "../services/conversation-loader.service";
import { MessageLoader } from "../services/message-loader.service";

export class DeleteMessageUseCaseImpl extends DeleteMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly messageLoader: MessageLoader,
    private readonly conversationLoader: ConversationLoader,
    private readonly accessPolicy: ChatAccessPolicy,
  ) {
    super();
  }

  public async execute(input: DeleteMessageInput): Promise<DomainEventResult<MessageOutput>> {
    const message = await this.messageLoader.load(input.code);
    const conversation = await this.conversationLoader.load(message.conversationCode.value);
    const actor = CredentialCode.create(input.actorCredentialCode);

    this.accessPolicy.assertCanDelete(message, conversation, actor);

    message.softDelete(actor);

    await this.messageRepository.save(message);

    return {
      output: ChatOutputMapper.toMessageOutput(message.toPrimitives()),
      events: message.pullEvents(),
    };
  }
}
