import { ConversationCode } from "../value-objects/conversation-code.value-object";
import { CredentialCode } from "../value-objects/credential-code.value-object";
import { MessageCode } from "../value-objects/message-code.value-object";
import { MessageReceiptCode } from "../value-objects/message-receipt-code.value-object";
import { ReceiptStatusValue } from "../value-objects/receipt-status.value-object";
import {
  CreateMessageReceiptProps,
  MessageReceiptPrimitives,
  MessageReceiptProps,
  RehydrateMessageReceiptProps,
} from "../interfaces/message-receipt.interface";

export class MessageReceipt {
  private constructor(private readonly props: MessageReceiptProps) {}

  public static create(props: CreateMessageReceiptProps): MessageReceipt {
    const now = new Date();

    return new MessageReceipt({
      code: MessageReceiptCode.generate(),
      messageCode: MessageCode.create(props.messageCode),
      conversationCode: ConversationCode.create(props.conversationCode),
      credentialCode: CredentialCode.create(props.credentialCode),
      status: ReceiptStatusValue.delivered(),
      deliveredAt: now,
      readAt: undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static rehydrate(props: RehydrateMessageReceiptProps): MessageReceipt {
    return new MessageReceipt({
      code: MessageReceiptCode.create(props.code),
      messageCode: MessageCode.create(props.messageCode),
      conversationCode: ConversationCode.create(props.conversationCode),
      credentialCode: CredentialCode.create(props.credentialCode),
      status: ReceiptStatusValue.create(props.status),
      deliveredAt: new Date(props.deliveredAt.getTime()),
      readAt: props.readAt === null ? undefined : new Date(props.readAt.getTime()),
      createdAt: new Date(props.createdAt.getTime()),
      updatedAt: new Date(props.updatedAt.getTime()),
    });
  }

  public get code(): MessageReceiptCode {
    return this.props.code;
  }

  public get messageCode(): MessageCode {
    return this.props.messageCode;
  }

  public get conversationCode(): ConversationCode {
    return this.props.conversationCode;
  }

  public get credentialCode(): CredentialCode {
    return this.props.credentialCode;
  }

  public get status(): ReceiptStatusValue {
    return this.props.status;
  }

  public get deliveredAt(): Date {
    return new Date(this.props.deliveredAt.getTime());
  }

  public get readAt(): Date | undefined {
    return this.props.readAt === undefined ? undefined : new Date(this.props.readAt.getTime());
  }

  public get createdAt(): Date {
    return new Date(this.props.createdAt.getTime());
  }

  public get updatedAt(): Date {
    return new Date(this.props.updatedAt.getTime());
  }

  public markRead(at: Date = new Date()): void {
    if (this.props.status.isRead()) {
      return;
    }

    this.props.status = ReceiptStatusValue.read();
    this.props.readAt = new Date(at.getTime());
    this.props.updatedAt = new Date();
  }

  public equals(other: MessageReceipt): boolean {
    return this.props.code.equals(other.code);
  }

  public toPrimitives(): MessageReceiptPrimitives {
    return {
      code: this.props.code.value,
      messageCode: this.props.messageCode.value,
      conversationCode: this.props.conversationCode.value,
      credentialCode: this.props.credentialCode.value,
      status: this.props.status.value,
      deliveredAt: this.props.deliveredAt.toISOString(),
      readAt: this.props.readAt?.toISOString() ?? null,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
