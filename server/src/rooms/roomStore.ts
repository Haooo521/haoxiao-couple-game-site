import { randomUUID } from "node:crypto";
import type { Server } from "socket.io";
import type {
  ClientToServerEvents,
  GameId,
  Player,
  RoomSnapshot,
  ServerToClientEvents
} from "../../../packages/shared/types";
import { gameRegistry } from "../games";
import type { GameContext, GameInstance } from "../types/game";

type Room = {
  code: string;
  players: Player[];
  sockets: Map<string, string>;
  selectedGame?: GameId;
  phase: RoomSnapshot["phase"];
  game?: GameInstance;
  createdAt: number;
};

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

const rooms = new Map<string, Room>();

function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function makePlayer(nickname: string, isHost: boolean): Player {
  return {
    id: randomUUID(),
    nickname: nickname.trim().slice(0, 18) || "甜甜玩家",
    connected: true,
    isHost
  };
}

function snapshot(room: Room): RoomSnapshot {
  return {
    code: room.code,
    phase: room.phase,
    players: room.players,
    hostId: room.players.find((player) => player.isHost)?.id,
    selectedGame: room.selectedGame,
    gameState: room.game?.getPublicState(makeContext(room, undefined)),
    createdAt: room.createdAt
  };
}

function makeContext(room: Room, io?: TypedServer): GameContext {
  return {
    roomCode: room.code,
    players: room.players,
    now: () => Date.now(),
    schedule: (callback, ms) => setTimeout(callback, ms),
    broadcast: () => {
      if (io) broadcastRoom(io, room);
    }
  };
}

export function broadcastRoom(io: TypedServer, room: Room) {
  if (room.game?.getPublicState(makeContext(room, undefined)).status === "ended") {
    room.phase = "finished";
  }
  io.to(room.code).emit("room:update", snapshot(room));
}

export function createRoom(io: TypedServer, socketId: string, nickname: string) {
  let code = makeCode();
  while (rooms.has(code)) code = makeCode();

  const player = makePlayer(nickname, true);
  const room: Room = {
    code,
    players: [player],
    sockets: new Map([[socketId, player.id]]),
    phase: "waiting",
    createdAt: Date.now()
  };
  rooms.set(code, room);
  return { room, player };
}

export function joinRoom(
  socketId: string,
  code: string,
  nickname: string,
  previousPlayerId?: string
) {
  const room = rooms.get(code);
  if (!room) throw new Error("房间不存在，请检查 6 位房间码。");

  const reconnectingPlayer = previousPlayerId
    ? room.players.find((player) => player.id === previousPlayerId)
    : undefined;

  if (reconnectingPlayer) {
    reconnectingPlayer.connected = true;
    reconnectingPlayer.nickname = nickname.trim().slice(0, 18) || reconnectingPlayer.nickname;
    room.sockets.set(socketId, reconnectingPlayer.id);
    return { room, player: reconnectingPlayer };
  }

  if (room.players.length >= 2) {
    throw new Error("这个房间已经坐满啦，第一版最多 2 人。");
  }

  const player = makePlayer(nickname, false);
  room.players.push(player);
  room.sockets.set(socketId, player.id);
  return { room, player };
}

export function getRoom(code: string) {
  return rooms.get(code);
}

export function getPlayerIdBySocket(room: Room, socketId: string) {
  return room.sockets.get(socketId);
}

export function disconnectSocket(io: TypedServer, socketId: string) {
  for (const room of rooms.values()) {
    const playerId = room.sockets.get(socketId);
    if (!playerId) continue;
    const player = room.players.find((candidate) => candidate.id === playerId);
    if (player) player.connected = false;
    room.sockets.delete(socketId);
    broadcastRoom(io, room);
    cleanupEmptyRoom(room.code);
    break;
  }
}

export function leaveRoom(io: TypedServer, code: string, playerId: string) {
  const room = rooms.get(code);
  if (!room) return;
  room.players = room.players.filter((player) => player.id !== playerId);
  for (const [socketId, mappedPlayerId] of room.sockets.entries()) {
    if (mappedPlayerId === playerId) room.sockets.delete(socketId);
  }

  if (room.players.length === 0) {
    rooms.delete(code);
    return;
  }

  if (!room.players.some((player) => player.isHost)) {
    room.players[0].isHost = true;
  }
  room.phase = "waiting";
  room.game = undefined;
  broadcastRoom(io, room);
}

export function selectGame(io: TypedServer, code: string, playerId: string, gameId: GameId) {
  const room = mustGetRoom(code);
  mustBeHost(room, playerId);
  room.selectedGame = gameId;
  broadcastRoom(io, room);
}

export function startGame(io: TypedServer, code: string, playerId: string, gameId: GameId) {
  const room = mustGetRoom(code);
  mustBeHost(room, playerId);
  if (room.players.length < 2) throw new Error("等小伙伴进房间后再开始吧。");
  const module = gameRegistry[gameId];
  room.selectedGame = gameId;
  room.phase = "playing";
  room.game = module.initGame(makeContext(room, io));
  broadcastRoom(io, room);
}

export function handleGameAction(
  io: TypedServer,
  code: string,
  playerId: string,
  action: Parameters<GameInstance["handlePlayerAction"]>[1]
) {
  const room = mustGetRoom(code);
  if (!room.game || room.phase !== "playing") return;
  room.game.handlePlayerAction(playerId, action, makeContext(room, io));
  if (room.game.getPublicState(makeContext(room, io)).status === "ended") {
    room.phase = "finished";
  }
  broadcastRoom(io, room);
}

export function getSnapshot(room: Room) {
  return snapshot(room);
}

function mustGetRoom(code: string) {
  const room = rooms.get(code);
  if (!room) throw new Error("房间不存在或已经关闭。");
  return room;
}

function mustBeHost(room: Room, playerId: string) {
  const player = room.players.find((candidate) => candidate.id === playerId);
  if (!player?.isHost) throw new Error("只有房主可以操作这个按钮。");
}

function cleanupEmptyRoom(code: string) {
  const room = rooms.get(code);
  if (!room) return;
  if (room.players.every((player) => !player.connected)) {
    setTimeout(() => {
      const current = rooms.get(code);
      if (current && current.players.every((player) => !player.connected)) {
        rooms.delete(code);
      }
    }, 1000 * 60 * 15);
  }
}
