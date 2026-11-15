import { Server, type Socket } from "socket.io";
import { SOCKET_EVENT_NAMES } from "../../domain/constants/chat-event.constants";
import { ConversationDirectory } from "../domain/conversation-directory";
import { RealtimePublisher } from "../domain/realtime-publisher";
import { PresenceRegistry } from "./presence.registry";
import { TypingRegistry } from "./typing.registry";

export interface TypingPayload {
  conversationCode?: unknown;
}

export class SocketGateway extends RealtimePublisher {
  constructor(
    private readonly io: Server,
    private readonly conversationDirectory: ConversationDirectory,
    private readonly presenceRegistry: PresenceRegistry,
    private readonly typingRegistry: TypingRegistry,
  ) {
    super();
  }

  public attach(): void {
    this.io.on("connection", (socket: Socket) => {
      void this.onConnection(socket);
    });
  }

  public publishToConversation(conversationCode: string, eventName: string, payload: unknown): void {
    this.io.to(this.conversationRoom(conversationCode)).emit(eventName, payload);
  }

  public publishToUser(credentialCode: string, eventName: string, payload: unknown): void {
    this.io.to(this.userRoom(credentialCode)).emit(eventName, payload);
  }

  public joinUserToConversation(credentialCode: string, conversationCode: string): void {
    this.io.in(this.userRoom(credentialCode)).socketsJoin(this.conversationRoom(conversationCode));
  }

  public removeUserFromConversation(credentialCode: string, conversationCode: string): void {
    this.io.in(this.userRoom(credentialCode)).socketsLeave(this.conversationRoom(conversationCode));
  }

  public isOnline(credentialCode: string): boolean {
    return this.presenceRegistry.isOnline(credentialCode);
  }

  private async onConnection(socket: Socket): Promise<void> {
    const credentialCode = String(socket.data.credentialCode ?? "");

    if (credentialCode.length === 0) {
      socket.disconnect(true);
      return;
    }

    await socket.join(this.userRoom(credentialCode));

    const conversationCodes = await this.loadConversationCodes(credentialCode);

    for (const conversationCode of conversationCodes) {
      await socket.join(this.conversationRoom(conversationCode));
    }

    const becameOnline = this.presenceRegistry.connect(credentialCode, socket.id);

    if (becameOnline) {
      const since = this.presenceRegistry.onlineSince(credentialCode)?.toISOString() ?? new Date().toISOString();

      for (const conversationCode of conversationCodes) {
        this.io.to(this.conversationRoom(conversationCode)).emit(SOCKET_EVENT_NAMES.presenceOnline, {
          credentialCode,
          conversationCode,
          since,
        });
      }

      this.io.to(this.userRoom(credentialCode)).emit(SOCKET_EVENT_NAMES.presenceOnline, {
        credentialCode,
        conversationCode: null,
        since,
      });
    }

    socket.on("chat:typing", (payload: TypingPayload) => {
      this.onTyping(socket, credentialCode, payload);
    });

    socket.on("disconnect", () => {
      void this.onDisconnect(credentialCode, socket.id);
    });
  }

  private onTyping(socket: Socket, credentialCode: string, payload: TypingPayload): void {
    const conversationCode = typeof payload?.conversationCode === "string" ? payload.conversationCode.trim() : "";

    if (conversationCode.length === 0) {
      return;
    }

    const room = this.conversationRoom(conversationCode);

    if (!socket.rooms.has(room)) {
      return;
    }

    socket.to(room).emit(SOCKET_EVENT_NAMES.typing, {
      conversationCode,
      credentialCode,
      isTyping: true,
    });

    this.typingRegistry.start(conversationCode, credentialCode, () => {
      socket.to(room).emit(SOCKET_EVENT_NAMES.typingStop, {
        conversationCode,
        credentialCode,
        isTyping: false,
      });
    });
  }

  private async onDisconnect(credentialCode: string, socketId: string): Promise<void> {
    this.typingRegistry.stopAll(credentialCode);

    const wentOffline = this.presenceRegistry.disconnect(credentialCode, socketId);

    if (!wentOffline) {
      return;
    }

    const conversationCodes = await this.loadConversationCodes(credentialCode);

    for (const conversationCode of conversationCodes) {
      this.io.to(this.conversationRoom(conversationCode)).emit(SOCKET_EVENT_NAMES.presenceOffline, {
        credentialCode,
        conversationCode,
        at: new Date().toISOString(),
      });
    }
  }

  private async loadConversationCodes(credentialCode: string): Promise<string[]> {
    try {
      return await this.conversationDirectory.listConversationCodes(credentialCode);
    } catch (error) {
      console.error(`[socket] no se pudieron cargar las conversaciones de "${credentialCode}"`, error);
      return [];
    }
  }

  private userRoom(credentialCode: string): string {
    return `user:${credentialCode}`;
  }

  private conversationRoom(conversationCode: string): string {
    return `conversation:${conversationCode}`;
  }
}
