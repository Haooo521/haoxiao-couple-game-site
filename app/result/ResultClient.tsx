"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, RotateCcw, Trophy } from "lucide-react";
import { BrandHeader } from "../../components/BrandHeader";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SweetBackground } from "../../components/SweetBackground";
import { getSocket } from "../../lib/socket";
import { readSession } from "../../lib/session";
import type { PublicGameState, RoomSnapshot } from "../../packages/shared/types";

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const [room, setRoom] = useState<RoomSnapshot>();
  const [playerId, setPlayerId] = useState<string>();

  useEffect(() => {
    const session = readSession();
    setPlayerId(session.playerId);
    if (!code || !session.playerId) return;
    const socket = getSocket();
    socket.emit(
      "room:join",
      { code, nickname: session.nickname ?? "小甜豆", previousPlayerId: session.playerId },
      (response) => {
        if (response.ok) setRoom(response.data.room);
      }
    );
    socket.on("room:update", setRoom);
    return () => {
      socket.off("room:update", setRoom);
    };
  }, [code]);

  const me = useMemo(() => room?.players.find((player) => player.id === playerId), [room, playerId]);

  function restart() {
    if (!playerId || !room?.selectedGame) return;
    getSocket().emit("game:start", { code, playerId, gameId: room.selectedGame });
    router.push(`/game?code=${code}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <SweetBackground />
      <BrandHeader roomCode={code} />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-12 sm:px-6">
        <div className="rounded-[8px] border border-white/70 bg-white/84 p-6 text-center shadow-soft sm:p-8">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-candy to-lilac text-white">
            <Trophy className="h-9 w-9" />
          </div>
          <h1 className="mt-5 text-3xl font-black text-cocoa">甜蜜结果</h1>
          <p className="mt-2 font-semibold text-cocoa/65">豪豪和小糖豆的这一轮小宇宙记录</p>
          <ResultSummary state={room?.gameState} />
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryButton onClick={restart} disabled={!me?.isHost || !room?.selectedGame}>
              <RotateCcw className="h-4 w-4" />
              再玩一次
            </PrimaryButton>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cream px-5 text-sm font-black text-cocoa shadow-soft"
            >
              <Home className="h-4 w-4" />
              回首页
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function ResultSummary({ state }: { state?: PublicGameState }) {
  if (!state) return <p className="mt-6 font-bold text-cocoa/60">正在读取结果...</p>;
  if (state.gameId === "match-quiz") {
    return <p className="mt-6 text-2xl font-black text-candy">默契答对 {state.score} / {state.totalRounds} 题</p>;
  }
  if (state.gameId === "reaction-duel") {
    const top = Object.entries(state.scores).sort((a, b) => b[1] - a[1])[0];
    return <p className="mt-6 text-2xl font-black text-candy">最高抢答分：{top?.[1] ?? 0}</p>;
  }
  return <p className="mt-6 text-2xl font-black text-candy">心动同步分：{state.syncScore}</p>;
}
