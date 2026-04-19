declare module "*.css";
import type { Server as SocketIOServer } from "socket.io";

declare global {
  var io: SocketIOServer | null;
}

export {};