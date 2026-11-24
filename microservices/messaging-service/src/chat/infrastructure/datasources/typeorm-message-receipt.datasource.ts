import { DataSource, Repository } from "typeorm";
import { MessageReceipt } from "../../domain/aggregates/message-receipt.aggregate";
import { MessageReceiptDataSource } from "../../domain/datasources/message-receipt.datasource";
import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { MessageCode } from "../../domain/value-objects/message-code.value-object";
import { MessageReceiptEntity } from "../../../plugins/typorm/entities/message-receipt.entity";
import { MessageReceiptMapper } from "../mappers/message-receipt.mapper";

export class TypeOrmMessageReceiptDataSource implements MessageReceiptDataSource {
  constructor(private readonly dataSource: DataSource) {}

  private get repository(): Repository<MessageReceiptEntity> {
    return this.dataSource.getRepository(MessageReceiptEntity);
  }

  public async save(receipt: MessageReceipt): Promise<void> {
    const entity = MessageReceiptMapper.toPersistence(receipt);
    const existing = await this.repository.findOne({
      where: { messageCode: receipt.messageCode.value, credentialCode: receipt.credentialCode.value },
    });

    if (existing !== null) {
      entity.id = existing.id;
      entity.code = existing.code;
    }

    await this.repository.save(entity);
  }

  public async findByMessageCode(messageCode: MessageCode): Promise<MessageReceipt[]> {
    const entities = await this.repository.find({
      where: { messageCode: messageCode.value },
    });

    return entities.map((entity) => MessageReceiptMapper.toDomain(entity));
  }

  public async findByMessageAndCredential(messageCode: MessageCode, credentialCode: CredentialCode): Promise<MessageReceipt | null> {
    const entity = await this.repository.findOne({
      where: { messageCode: messageCode.value, credentialCode: credentialCode.value },
    });

    return entity === null ? null : MessageReceiptMapper.toDomain(entity);
  }

  public async findByMessageCodes(messageCodes: MessageCode[]): Promise<MessageReceipt[]> {
    if (messageCodes.length === 0) {
      return [];
    }

    const entities = await this.repository.find({
      where: messageCodes.map((code) => ({ messageCode: code.value })),
    });

    return entities.map((entity) => MessageReceiptMapper.toDomain(entity));
  }
}
