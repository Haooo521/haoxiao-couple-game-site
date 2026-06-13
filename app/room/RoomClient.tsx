"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, LogOut, Play } from "lucide-react";
import { BrandHeader } from "../../components/BrandHeader";
import { GameCard } from "../../components/GameCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SweetBackground } from "../../components/SweetBackground";
import { getSocket } from "../../lib/socket";
import { clearSession, readSession, saveSession } from "../../lib/session";
import type { GameId, RoomSnapshot } from "../../packages/shared/types";
import { GAME_CATALOG } from "../../packages/shared/types";

export default function RoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const [room, setRoom] = useState<RoomSnapshot>();
  const [playerId, setPlayerId] = useState<string>();
  const [error, setError] = useState("");

  useEffect(() => {
    const session = readSession();
    setPlayerId(session.playerId);
    if (!code || !session.playerId || session.roomCode !== code) return;

    const socket = getSocket();
    socket.emit(
      "room:join",
      {
        code,
        nickname: session.nickname ?? "小甜豆",
        previousPlayerId: session.playerId
      },
      (response) => {
        if (!response.ok) {
          setError(response.error);
          return;
        }
        setPlayerId(response.data.playerId);
        setRoom(response.data.room);
        saveSession(response.data.playerId, response.data.room.code, session.nickname ?? "小甜豆");
      }
    );

    socket.on("room:update", setRoom);
    socket.on("room:error", ({ message }) => setError(message));
    return () => {
      socket.off("room:update", setRoom);
      socket.off("room:error");
    };
  }, [code]);

  useEffect(() => {
    if (room?.phase === "playing") router.push(`/game?code=${room.code}`);
    if (room?.phase === "finished") router.push(`/result?code=${room.code}`);
  }, [room, router]);

  const me = useMemo(() => room?.players.find((player) => player.id === playerId), [room, playerId]);
  const selected = room?.selectedGame ?? "match-quiz";

  function selectGame(gameId: GameId) {
    if (!playerId) return;
    getSocket().emit("game:select", { code, playerId, gameId });
  }

  function startGame() {
    if (!playerId) return;
    getSocket().emit("game:start", { code, playerId, gameId: selected });
  }

  function leave() {
    if (playerId) getSocket().emit("room:leave", { code, playerId });
    clearSession();
    router.push("/");
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <SweetBackground />
      <BrandHeader roomCode={code} />
      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="rounded-[8px] border border-white/70 bg-white/78 p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-cocoa/58">等待房间</p>
              <h1 className="mt-1 text-3xl font-black text-cocoa">{code || "------"}</h1>
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(code)}
              className="grid h-11 w-11 place-items-center rounded-full bg-cream text-cocoa"
              title="复制房间码"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {room?.players.map((player) => (
              <div key={player.id} className="flex items-center justify-between rounded-[8px] bg-cream px-4 py-3">
                <span className="font-black text-cocoa">{player.nickname}</span>
                <span className="text-xs font-bold text-cocoa/58">
                  {player.isHost ? "房主" : "成员"} · {player.connected ? "在线" : "重连中"}
                </span>
              </div>
            ))}
            {!room ? <p className="text-sm font-bold text-cocoa/60">正在连接甜蜜频道...</p> : null}
          </div>

          {error ? <p className="mt-4 text-sm font-bold text-rose-600">{error}</p> : null}

          <div className="mt-6 flex gap-3">
            <PrimaryButton onClick={startGame} disabled={!me?.isHost || (room?.players.length ?? 0) < 2}>
              <Play className="h-4 w-4" />
              开始游戏
            </PrimaryButton>
            <button
              type="button"
              onClick={leave}
              className="grid h-12 w-12 place-items-center rounded-full bg-white text-cocoa shadow-soft"
              title="离开房间"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </aside>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-black text-cocoa">选择今天的小游戏</h2>
            <p className="mt-2 text-sm font-semibold text-cocoa/65">
              房主选择后开始；第一版房间最多 2 人，之后可以扩展多人。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {GAME_CATALOG.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                selected={selected === game.id}
                onClick={me?.isHost ? () => selectGame(game.id) : undefined}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
