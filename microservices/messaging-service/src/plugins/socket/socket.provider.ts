import { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { jwtAdapter } from "../jwt/jwt.provider";

export const SOCKET_PATH = "/api/chat/socket.io";

export interface SocketTokenPayload {
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  username: string;
}

export class SocketProvider {
  private server: Server | null = null;

  public create(httpServer: HttpServer): Server {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim());

    this.server = new Server(httpServer, {
      path: SOCKET_PATH,
      cors: {
        origin: allowedOrigins ?? "*",
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.server.use((socket: Socket, next: (error?: Error) => void) => {
      const token = SocketProvider.resolveToken(socket);

      if (token === undefined) {
        next(new Error("UNAUTHORIZED"));
        return;
      }

      try {
        const payload = jwtAdapter.verifyToken(token) as unknown as SocketTokenPayload;

        socket.data.credentialCode = payload.credentialCode;
        socket.data.username = payload.username;

        next();
      } catch {
        next(new Error("UNAUTHORIZED"));
      }
    });

    return this.server;
  }

  public get instance(): Server | null {
    return this.server;
  }

  private static resolveToken(socket: Socket): string | undefined {
    const auth = socket.handshake.auth as { token?: unknown };

    if (typeof auth?.token === "string" && auth.token.trim().length > 0) {
      return auth.token.trim();
    }

    const header = socket.handshake.headers.authorization;

    if (typeof header === "string" && header.startsWith("Bearer ")) {
      const token = header.slice("Bearer ".length).trim();

      if (token.length > 0) {
        return token;
      }
    }

    const query = socket.handshake.query.token;

    if (typeof query === "string" && query.trim().length > 0) {
      return query.trim();
    }

    return undefined;
  }
}

export const socketProvider = new SocketProvider();
