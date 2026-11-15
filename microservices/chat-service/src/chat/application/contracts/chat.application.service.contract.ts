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

export abstract class ChatApplicationServiceContract {
  public abstract createConversation(input: CreateConversationInput): Promise<ConversationOutput>;

  public abstract listConversations(input: ListConversationsInput): Promise<ConversationListOutput>;

  public abstract getConversation(input: GetConversationInput): Promise<ConversationOutput | null>;

  public abstract addParticipant(input: AddParticipantInput): Promise<ConversationOutput>;

  public abstract removeParticipant(input: RemoveParticipantInput): Promise<ConversationOutput>;

  public abstract leaveConversation(input: LeaveConversationInput): Promise<ConversationOutput>;

  public abstract renameConversation(input: RenameConversationInput): Promise<ConversationOutput>;

  public abstract deleteConversation(input: DeleteConversationInput): Promise<ConversationOutput>;

  public abstract sendMessage(input: SendMessageInput): Promise<MessageOutput>;

  public abstract listMessages(input: ListMessagesInput): Promise<MessageListOutput>;

  public abstract getMessage(input: GetMessageInput): Promise<MessageOutput | null>;

  public abstract editMessage(input: EditMessageInput): Promise<MessageOutput>;

  public abstract deleteMessage(input: DeleteMessageInput): Promise<MessageOutput>;

  public abstract markMessageDelivered(input: MarkMessageDeliveredInput): Promise<MessageOutput>;

  public abstract markMessageRead(input: MarkMessageReadInput): Promise<MessageOutput>;
}
