export abstract class RealtimePublisher {
  public abstract publishToConversation(conversationCode: string, eventName: string, payload: unknown): void;

  public abstract publishToUser(credentialCode: string, eventName: string, payload: unknown): void;

  public abstract joinUserToConversation(credentialCode: string, conversationCode: string): void;

  public abstract removeUserFromConversation(credentialCode: string, conversationCode: string): void;
}
