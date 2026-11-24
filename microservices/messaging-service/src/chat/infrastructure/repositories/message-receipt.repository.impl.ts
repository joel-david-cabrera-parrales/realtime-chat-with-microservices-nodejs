import { MessageReceipt } from "../../domain/aggregates/message-receipt.aggregate";
import { MessageReceiptDataSource } from "../../domain/datasources/message-receipt.datasource";
import { MessageReceiptRepository } from "../../domain/repositories/message-receipt.repository";
import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { MessageCode } from "../../domain/value-objects/message-code.value-object";

export class MessageReceiptRepositoryImpl implements MessageReceiptRepository {
  constructor(private readonly messageReceiptDataSource: MessageReceiptDataSource) {}

  public save(receipt: MessageReceipt): Promise<void> {
    return this.messageReceiptDataSource.save(receipt);
  }

  public findByMessageCode(messageCode: MessageCode): Promise<MessageReceipt[]> {
    return this.messageReceiptDataSource.findByMessageCode(messageCode);
  }

  public findByMessageAndCredential(messageCode: MessageCode, credentialCode: CredentialCode): Promise<MessageReceipt | null> {
    return this.messageReceiptDataSource.findByMessageAndCredential(messageCode, credentialCode);
  }

  public findByMessageCodes(messageCodes: MessageCode[]): Promise<MessageReceipt[]> {
    return this.messageReceiptDataSource.findByMessageCodes(messageCodes);
  }
}
