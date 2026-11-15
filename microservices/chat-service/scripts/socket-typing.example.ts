import { io } from "socket.io-client";

const BASE_URL = process.env.CHAT_BASE_URL ?? "http://localhost";
const TOKEN = process.env.CHAT_TOKEN ?? "";
const CONVERSATION_CODE = process.env.CHAT_CONVERSATION_CODE ?? "";

if (TOKEN.length === 0) {
  console.error("Falta CHAT_TOKEN (JWT de auth-service)");
  process.exit(1);
}

if (CONVERSATION_CODE.length === 0) {
  console.error("Falta CHAT_CONVERSATION_CODE");
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
  socket.emit("chat:typing", { conversationCode: CONVERSATION_CODE });
});

socket.on("connect_error", (error: Error) => {
  console.error("Error de conexion:", error.message);
});

socket.on("chat.typing", (payload: unknown) => {
  console.log("[chat.typing]", JSON.stringify(payload));
});

socket.on("chat.typing.stopped", (payload: unknown) => {
  console.log("[chat.typing.stopped]", JSON.stringify(payload));
});

process.on("SIGINT", () => {
  socket.close();
  process.exit(0);
});
