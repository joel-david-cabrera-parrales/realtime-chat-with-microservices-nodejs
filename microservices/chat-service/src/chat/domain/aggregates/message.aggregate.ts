import { MessageAlreadyDeletedException } from "../exceptions/message-already-deleted.exception";
import { MessageContentUnchangedException } from "../exceptions/message-content-unchanged.exception";
import { MessageNotEditableException } from "../exceptions/message-not-editable.exception";
import { ConversationCode } from "../value-objects/conversation-code.value-object";
import { CredentialCode } from "../value-objects/credential-code.value-object";
import { MessageCode } from "../value-objects/message-code.value-object";
import { MessageContent } from "../value-objects/message-content.value-object";
import { MessageStatusValue } from "../value-objects/message-status.value-object";
import { CreateMessageProps, MessagePrimitives, MessageProps, RehydrateMessageProps } from "../interfaces/message.interface";

export class Message {
  private constructor(private readonly props: MessageProps) {}

  public static create(props: CreateMessageProps): Message {
    const now = new Date();

    return new Message({
      code: MessageCode.generate(),
      conversationCode: ConversationCode.create(props.conversationCode),
      senderCredentialCode: CredentialCode.create(props.senderCredentialCode),
      content: MessageContent.create(props.content),
      status: MessageStatusValue.sent(),
      deliveredAt: undefined,
      readAt: undefined,
      editedAt: undefined,
      deletedAt: undefined,
      deletedBy: undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static rehydrate(props: RehydrateMessageProps): Message {
    return new Message({
      code: MessageCode.create(props.code),
      conversationCode: ConversationCode.create(props.conversationCode),
      senderCredentialCode: CredentialCode.create(props.senderCredentialCode),
      content: MessageContent.create(props.content),
      status: MessageStatusValue.create(props.status),
      deliveredAt: props.deliveredAt === null ? undefined : new Date(props.deliveredAt.getTime()),
      readAt: props.readAt === null ? undefined : new Date(props.readAt.getTime()),
      editedAt: props.editedAt === null ? undefined : new Date(props.editedAt.getTime()),
      deletedAt: props.deletedAt === null ? undefined : new Date(props.deletedAt.getTime()),
      deletedBy: props.deletedBy === null ? undefined : CredentialCode.create(props.deletedBy),
      createdAt: new Date(props.createdAt.getTime()),
      updatedAt: new Date(props.updatedAt.getTime()),
    });
  }

  public get code(): MessageCode {
    return this.props.code;
  }

  public get conversationCode(): ConversationCode {
    return this.props.conversationCode;
  }

  public get senderCredentialCode(): CredentialCode {
    return this.props.senderCredentialCode;
  }

  public get content(): MessageContent {
    return this.props.content;
  }

  public get status(): MessageStatusValue {
    return this.props.status;
  }

  public get deliveredAt(): Date | undefined {
    return this.props.deliveredAt === undefined ? undefined : new Date(this.props.deliveredAt.getTime());
  }

  public get readAt(): Date | undefined {
    return this.props.readAt === undefined ? undefined : new Date(this.props.readAt.getTime());
  }

  public get editedAt(): Date | undefined {
    return this.props.editedAt === undefined ? undefined : new Date(this.props.editedAt.getTime());
  }

  public get deletedAt(): Date | undefined {
    return this.props.deletedAt === undefined ? undefined : new Date(this.props.deletedAt.getTime());
  }

  public get deletedBy(): CredentialCode | undefined {
    return this.props.deletedBy;
  }

  public get createdAt(): Date {
    return new Date(this.props.createdAt.getTime());
  }

  public get updatedAt(): Date {
    return new Date(this.props.updatedAt.getTime());
  }

  public isDeleted(): boolean {
    return this.props.deletedAt !== undefined;
  }

  public isEdited(): boolean {
    return this.props.editedAt !== undefined;
  }

  public markDelivered(at: Date = new Date()): void {
    if (this.props.status.isDelivered() || this.props.status.isRead()) {
      return;
    }

    this.props.status = MessageStatusValue.delivered();
    this.props.deliveredAt = new Date(at.getTime());
    this.props.updatedAt = new Date();
  }

  public markRead(at: Date = new Date()): void {
    if (this.props.status.isRead()) {
      return;
    }

    if (this.props.status.isSent()) {
      this.props.status = MessageStatusValue.delivered();
      this.props.deliveredAt = new Date(at.getTime());
    }

    this.props.status = MessageStatusValue.read();
    this.props.readAt = new Date(at.getTime());
    this.props.updatedAt = new Date();
  }

  public edit(content: string, at: Date = new Date()): void {
    if (this.isDeleted()) {
      throw new MessageNotEditableException();
    }

    const nextContent = MessageContent.create(content);

    if (nextContent.equals(this.props.content)) {
      throw new MessageContentUnchangedException();
    }

    this.props.content = nextContent;
    this.props.editedAt = new Date(at.getTime());
    this.props.updatedAt = new Date();
  }

  public softDelete(by: string, at: Date = new Date()): void {
    if (this.isDeleted()) {
      throw new MessageAlreadyDeletedException();
    }

    this.props.deletedAt = new Date(at.getTime());
    this.props.deletedBy = CredentialCode.create(by);
    this.props.updatedAt = new Date();
  }

  public equals(other: Message): boolean {
    return this.props.code.equals(other.code);
  }

  public toPrimitives(): MessagePrimitives {
    return {
      code: this.props.code.value,
      conversationCode: this.props.conversationCode.value,
      senderCredentialCode: this.props.senderCredentialCode.value,
      content: this.props.content.value,
      status: this.props.status.value,
      deliveredAt: this.props.deliveredAt?.toISOString() ?? null,
      readAt: this.props.readAt?.toISOString() ?? null,
      editedAt: this.props.editedAt?.toISOString() ?? null,
      deletedAt: this.props.deletedAt?.toISOString() ?? null,
      deletedBy: this.props.deletedBy?.value ?? null,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
