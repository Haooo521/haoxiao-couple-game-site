"use client";

const PLAYER_KEY = "haotang-player-id";
const ROOM_KEY = "haotang-room-code";
const NICKNAME_KEY = "haotang-nickname";

export function saveSession(playerId: string, roomCode: string, nickname: string) {
  localStorage.setItem(PLAYER_KEY, playerId);
  localStorage.setItem(ROOM_KEY, roomCode);
  localStorage.setItem(NICKNAME_KEY, nickname);
}

export function readSession() {
  return {
    playerId: localStorage.getItem(PLAYER_KEY) ?? undefined,
    roomCode: localStorage.getItem(ROOM_KEY) ?? undefined,
    nickname: localStorage.getItem(NICKNAME_KEY) ?? undefined
  };
}

export function clearSession() {
  localStorage.removeItem(PLAYER_KEY);
  localStorage.removeItem(ROOM_KEY);
}
