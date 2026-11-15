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
  ) {
    super();
  }

  public createConversation(input: CreateConversationInput): Promise<ConversationOutput> {
    return this.createConversationUseCase.execute(input);
  }

  public listConversations(input: ListConversationsInput): Promise<ConversationListOutput> {
    return this.listConversationsUseCase.execute(input);
  }

  public getConversation(input: GetConversationInput): Promise<ConversationOutput | null> {
    return this.getConversationUseCase.execute(input);
  }

  public addParticipant(input: AddParticipantInput): Promise<ConversationOutput> {
    return this.addParticipantUseCase.execute(input);
  }

  public removeParticipant(input: RemoveParticipantInput): Promise<ConversationOutput> {
    return this.removeParticipantUseCase.execute(input);
  }

  public leaveConversation(input: LeaveConversationInput): Promise<ConversationOutput> {
    return this.leaveConversationUseCase.execute(input);
  }

  public renameConversation(input: RenameConversationInput): Promise<ConversationOutput> {
    return this.renameConversationUseCase.execute(input);
  }

  public deleteConversation(input: DeleteConversationInput): Promise<ConversationOutput> {
    return this.deleteConversationUseCase.execute(input);
  }

  public sendMessage(input: SendMessageInput): Promise<MessageOutput> {
    return this.sendMessageUseCase.execute(input);
  }

  public listMessages(input: ListMessagesInput): Promise<MessageListOutput> {
    return this.listMessagesUseCase.execute(input);
  }

  public getMessage(input: GetMessageInput): Promise<MessageOutput | null> {
    return this.getMessageUseCase.execute(input);
  }

  public editMessage(input: EditMessageInput): Promise<MessageOutput> {
    return this.editMessageUseCase.execute(input);
  }

  public deleteMessage(input: DeleteMessageInput): Promise<MessageOutput> {
    return this.deleteMessageUseCase.execute(input);
  }

  public markMessageDelivered(input: MarkMessageDeliveredInput): Promise<MessageOutput> {
    return this.markMessageDeliveredUseCase.execute(input);
  }

  public markMessageRead(input: MarkMessageReadInput): Promise<MessageOutput> {
    return this.markMessageReadUseCase.execute(input);
  }
}
