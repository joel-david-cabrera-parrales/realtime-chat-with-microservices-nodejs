import { io } from "socket.io-client";

const BASE_URL = process.env.CHAT_BASE_URL ?? "http://localhost";
const TOKEN = process.env.CHAT_TOKEN ?? "";
const CONVERSATION_CODE = process.env.CHAT_CONVERSATION_CODE ?? "";

if (TOKEN.length === 0) {
  console.error("Falta CHAT_TOKEN (JWT de identity-service)");
  process.exit(1);
}

const socket = io(BASE_URL, {
  path: "/api/chat/socket.io",
  transports: ["websocket"],
  auth: {
    token: TOKEN,
  },
});

socket.on("connect", () => {
  console.log("Conectado", socket.id);
});

socket.on("connect_error", (error: Error) => {
  console.error("Error de conexion:", error.message);
});

const events = [
  "chat.message.created",
  "chat.message.updated",
  "chat.message.deleted",
  "chat.message.delivered",
  "chat.message.read",
  "chat.conversation.created",
  "chat.conversation.renamed",
  "chat.conversation.deleted",
  "chat.conversation.participant.added",
  "chat.conversation.participant.removed",
  "chat.conversation.participant.left",
  "chat.presence.online",
  "chat.presence.offline",
  "chat.typing",
  "chat.typing.stopped",
];

for (const event of events) {
  socket.on(event, (payload: unknown) => {
    console.log(`[${event}]`, JSON.stringify(payload));
  });
}

if (CONVERSATION_CODE.length > 0) {
  const interval = setInterval(() => {
    socket.emit("chat:typing", { conversationCode: CONVERSATION_CODE });
  }, 2000);

  socket.on("disconnect", () => {
    clearInterval(interval);
  });
}

process.on("SIGINT", () => {
  socket.close();
  process.exit(0);
});
