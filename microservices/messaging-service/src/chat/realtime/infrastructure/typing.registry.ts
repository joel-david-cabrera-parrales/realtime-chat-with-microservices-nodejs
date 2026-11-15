export const DEFAULT_TYPING_TTL_MS = 5000;

export class TypingRegistry {
  private readonly timers = new Map<string, NodeJS.Timeout>();

  constructor(private readonly ttlMs: number = DEFAULT_TYPING_TTL_MS) {}

  public start(conversationCode: string, credentialCode: string, onStop: () => void): void {
    const key = TypingRegistry.buildKey(conversationCode, credentialCode);

    this.clear(key);

    const timer = setTimeout(() => {
      this.timers.delete(key);
      onStop();
    }, this.ttlMs);

    timer.unref();
    this.timers.set(key, timer);
  }

  public stop(conversationCode: string, credentialCode: string): void {
    this.clear(TypingRegistry.buildKey(conversationCode, credentialCode));
  }

  public stopAll(credentialCode: string): void {
    for (const [key, timer] of [...this.timers.entries()]) {
      if (!key.endsWith(`:${credentialCode}`)) {
        continue;
      }

      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  private clear(key: string): void {
    const timer = this.timers.get(key);

    if (timer === undefined) {
      return;
    }

    clearTimeout(timer);
    this.timers.delete(key);
  }

  private static buildKey(conversationCode: string, credentialCode: string): string {
    return `${conversationCode}:${credentialCode}`;
  }
}
