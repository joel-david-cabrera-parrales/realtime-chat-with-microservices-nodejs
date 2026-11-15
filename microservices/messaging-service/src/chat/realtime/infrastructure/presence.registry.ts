export class PresenceRegistry {
  private readonly socketsByCredential = new Map<string, Set<string>>();
  private readonly sinceByCredential = new Map<string, Date>();

  public connect(credentialCode: string, socketId: string): boolean {
    const sockets = this.socketsByCredential.get(credentialCode) ?? new Set<string>();

    const wasOffline = sockets.size === 0;

    sockets.add(socketId);
    this.socketsByCredential.set(credentialCode, sockets);

    if (wasOffline) {
      this.sinceByCredential.set(credentialCode, new Date());
    }

    return wasOffline;
  }

  public disconnect(credentialCode: string, socketId: string): boolean {
    const sockets = this.socketsByCredential.get(credentialCode);

    if (sockets === undefined) {
      return false;
    }

    sockets.delete(socketId);

    if (sockets.size > 0) {
      return false;
    }

    this.socketsByCredential.delete(credentialCode);
    this.sinceByCredential.delete(credentialCode);

    return true;
  }

  public isOnline(credentialCode: string): boolean {
    const sockets = this.socketsByCredential.get(credentialCode);

    return sockets !== undefined && sockets.size > 0;
  }

  public onlineSince(credentialCode: string): Date | undefined {
    const since = this.sinceByCredential.get(credentialCode);

    return since === undefined ? undefined : new Date(since.getTime());
  }

  public listOnline(): string[] {
    return [...this.socketsByCredential.keys()];
  }
}
