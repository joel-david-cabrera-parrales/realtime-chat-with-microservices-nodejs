import { MessageReceipt } from "../aggregates/message-receipt.aggregate";
import { CredentialCode } from "../value-objects/credential-code.value-object";
import { MessageCode } from "../value-objects/message-code.value-object";

export abstract class MessageReceiptRepository {
  abstract save(receipt: MessageReceipt): Promise<void>;
  abstract findByMessageCode(messageCode: MessageCode): Promise<MessageReceipt[]>;
  abstract findByMessageAndCredential(messageCode: MessageCode, credentialCode: CredentialCode): Promise<MessageReceipt | null>;
  abstract findByMessageCodes(messageCodes: MessageCode[]): Promise<MessageReceipt[]>;
}
