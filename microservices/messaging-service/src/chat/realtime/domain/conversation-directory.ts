export abstract class ConversationDirectory {
  public abstract listConversationCodes(credentialCode: string): Promise<string[]>;
}
