import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "../../packages/shared/types";
import {
  broadcastRoom,
  createRoom,
  disconnectSocket,
  getSnapshot,
  handleGameAction,
  joinRoom,
  leaveRoom,
  selectGame,
  startGame
} from "./rooms/roomStore";

const port = Number(process.env.PORT ?? 4000);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";

const app = express();
app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ ok: true, service: "haoxiao-couple-play-realtime" });
});

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: clientOrigin,
    methods: ["GET", "POST"]
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 1000 * 60 * 3
  }
});

io.on("connection", (socket) => {
  socket.on("room:create", ({ nickname }, ack) => {
    try {
      const { room, player } = createRoom(io, socket.id, nickname);
      socket.join(room.code);
      ack({ ok: true, data: { room: getSnapshot(room), playerId: player.id } });
      broadcastRoom(io, room);
    } catch (error) {
      ack({ ok: false, error: error instanceof Error ? error.message : "创建房间失败。" });
    }
  });

  socket.on("room:join", ({ code, nickname, previousPlayerId }, ack) => {
    try {
      const { room, player } = joinRoom(socket.id, code.trim(), nickname, previousPlayerId);
      socket.join(room.code);
      ack({ ok: true, data: { room: getSnapshot(room), playerId: player.id } });
      broadcastRoom(io, room);
    } catch (error) {
      ack({ ok: false, error: error instanceof Error ? error.message : "加入房间失败。" });
    }
  });

  socket.on("room:leave", ({ code, playerId }) => {
    socket.leave(code);
    leaveRoom(io, code, playerId);
  });

  socket.on("game:select", ({ code, playerId, gameId }) => {
    try {
      selectGame(io, code, playerId, gameId);
    } catch (error) {
      socket.emit("room:error", { message: error instanceof Error ? error.message : "选择游戏失败。" });
    }
  });

  socket.on("game:start", ({ code, playerId, gameId }) => {
    try {
      startGame(io, code, playerId, gameId);
    } catch (error) {
      socket.emit("room:error", { message: error instanceof Error ? error.message : "开始游戏失败。" });
    }
  });

  socket.on("game:action", ({ code, playerId, action }) => {
    try {
      handleGameAction(io, code, playerId, action);
    } catch (error) {
      socket.emit("room:error", { message: error instanceof Error ? error.message : "游戏操作失败。" });
    }
  });

  socket.on("disconnect", () => {
    disconnectSocket(io, socket.id);
  });
});

server.listen(port, () => {
  console.log(`Realtime service listening on http://localhost:${port}`);
});
