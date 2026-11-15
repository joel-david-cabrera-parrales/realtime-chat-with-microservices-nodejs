import { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { CredentialCode } from "../../domain/value-objects/credential-code.value-object";
import { ConversationDirectory } from "../domain/conversation-directory";

export class ConversationDirectoryImpl extends ConversationDirectory {
  constructor(private readonly conversationRepository: ConversationRepository) {
    super();
  }

  public async listConversationCodes(credentialCode: string): Promise<string[]> {
    const conversations = await this.conversationRepository.findByParticipant(CredentialCode.create(credentialCode));

    return conversations.map((conversation) => conversation.code.value);
  }
}
