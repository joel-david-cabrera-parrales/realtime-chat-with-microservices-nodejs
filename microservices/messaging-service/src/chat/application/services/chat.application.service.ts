import { DomainEventPublisher } from "../../../shared/domain/events/domain-event-publisher";
import {
  AddParticipantInput,
  ConversationListOutput,
  ConversationOutput,
  CreateConversationInput,
  DeleteConversationInput,
  GetConversationInput,
  LeaveConversationInput,
  ListConversationsInput,
  RemoveParticipantInput,
  RenameConversationInput,
} from "../../domain/use-cases/dtos/conversation.dto";
import {
  DeleteMessageInput,
  EditMessageInput,
  GetMessageInput,
  ListMessagesInput,
  MarkMessageDeliveredInput,
  MarkMessageReadInput,
  MessageListOutput,
  MessageOutput,
  SendMessageInput,
} from "../../domain/use-cases/dtos/message.dto";
import { AddParticipantUseCase } from "../../domain/use-cases/add-participant.use-case";
import { CreateConversationUseCase } from "../../domain/use-cases/create-conversation.use-case";
import { DeleteConversationUseCase } from "../../domain/use-cases/delete-conversation.use-case";
import { DeleteMessageUseCase } from "../../domain/use-cases/delete-message.use-case";
import { EditMessageUseCase } from "../../domain/use-cases/edit-message.use-case";
import { GetConversationUseCase } from "../../domain/use-cases/get-conversation.use-case";
import { GetMessageUseCase } from "../../domain/use-cases/get-message.use-case";
import { LeaveConversationUseCase } from "../../domain/use-cases/leave-conversation.use-case";
import { ListConversationsUseCase } from "../../domain/use-cases/list-conversations.use-case";
import { ListMessagesUseCase } from "../../domain/use-cases/list-messages.use-case";
import { MarkMessageDeliveredUseCase } from "../../domain/use-cases/mark-message-delivered.use-case";
import { MarkMessageReadUseCase } from "../../domain/use-cases/mark-message-read.use-case";
import { RemoveParticipantUseCase } from "../../domain/use-cases/remove-participant.use-case";
import { RenameConversationUseCase } from "../../domain/use-cases/rename-conversation.use-case";
import { SendMessageUseCase } from "../../domain/use-cases/send-message.use-case";
import { ChatApplicationServiceContract } from "../contracts/chat.application.service.contract";

export class ChatApplicationService extends ChatApplicationServiceContract {
  constructor(
    private readonly createConversationUseCase: CreateConversationUseCase,
    private readonly listConversationsUseCase: ListConversationsUseCase,
    private readonly getConversationUseCase: GetConversationUseCase,
    private readonly addParticipantUseCase: AddParticipantUseCase,
    private readonly removeParticipantUseCase: RemoveParticipantUseCase,
    private readonly leaveConversationUseCase: LeaveConversationUseCase,
    private readonly renameConversationUseCase: RenameConversationUseCase,
    private readonly deleteConversationUseCase: DeleteConversationUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly listMessagesUseCase: ListMessagesUseCase,
    private readonly getMessageUseCase: GetMessageUseCase,
    private readonly editMessageUseCase: EditMessageUseCase,
    private readonly deleteMessageUseCase: DeleteMessageUseCase,
    private readonly markMessageDeliveredUseCase: MarkMessageDeliveredUseCase,
    private readonly markMessageReadUseCase: MarkMessageReadUseCase,
    private readonly domainEventPublisher: DomainEventPublisher,
  ) {
    super();
  }

  public async createConversation(input: CreateConversationInput): Promise<ConversationOutput> {
    const { output, events } = await this.createConversationUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async listConversations(input: ListConversationsInput): Promise<ConversationListOutput> {
    const { output, events } = await this.listConversationsUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async getConversation(input: GetConversationInput): Promise<ConversationOutput | null> {
    const { output, events } = await this.getConversationUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async addParticipant(input: AddParticipantInput): Promise<ConversationOutput> {
    const { output, events } = await this.addParticipantUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async removeParticipant(input: RemoveParticipantInput): Promise<ConversationOutput> {
    const { output, events } = await this.removeParticipantUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async leaveConversation(input: LeaveConversationInput): Promise<ConversationOutput> {
    const { output, events } = await this.leaveConversationUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async renameConversation(input: RenameConversationInput): Promise<ConversationOutput> {
    const { output, events } = await this.renameConversationUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async deleteConversation(input: DeleteConversationInput): Promise<ConversationOutput> {
    const { output, events } = await this.deleteConversationUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async sendMessage(input: SendMessageInput): Promise<MessageOutput> {
    const { output, events } = await this.sendMessageUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async listMessages(input: ListMessagesInput): Promise<MessageListOutput> {
    const { output, events } = await this.listMessagesUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async getMessage(input: GetMessageInput): Promise<MessageOutput | null> {
    const { output, events } = await this.getMessageUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async editMessage(input: EditMessageInput): Promise<MessageOutput> {
    const { output, events } = await this.editMessageUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async deleteMessage(input: DeleteMessageInput): Promise<MessageOutput> {
    const { output, events } = await this.deleteMessageUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async markMessageDelivered(input: MarkMessageDeliveredInput): Promise<MessageOutput> {
    const { output, events } = await this.markMessageDeliveredUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }

  public async markMessageRead(input: MarkMessageReadInput): Promise<MessageOutput> {
    const { output, events } = await this.markMessageReadUseCase.execute(input);
    await this.domainEventPublisher.publish(events);

    return output;
  }
}
