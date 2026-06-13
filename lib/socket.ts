"use client";

import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "../packages/shared/types";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000", {
      autoConnect: true,
      transports: ["websocket"]
    });
  }
  return socket;
}
