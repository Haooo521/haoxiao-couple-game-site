"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeartPulse, LogOut, MousePointerClick } from "lucide-react";
import { BrandHeader } from "../../components/BrandHeader";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SweetBackground } from "../../components/SweetBackground";
import { getSocket } from "../../lib/socket";
import { readSession } from "../../lib/session";
import type {
  HeartSyncPublicState,
  GameAction,
  MatchQuizPublicState,
  PublicGameState,
  ReactionDuelPublicState,
  RoomSnapshot
} from "../../packages/shared/types";

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const [room, setRoom] = useState<RoomSnapshot>();
  const [playerId, setPlayerId] = useState<string>();
  const [error, setError] = useState("");

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
        else setError(response.error);
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
    if (room?.phase === "finished") router.push(`/result?code=${room.code}`);
  }, [room, router]);

  const state = room?.gameState;
  const playersById = useMemo(
    () => Object.fromEntries((room?.players ?? []).map((player) => [player.id, player.nickname])),
    [room]
  );

  function sendAction(action: GameAction) {
    if (!playerId) return;
    getSocket().emit("game:action", { code, playerId, action });
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <SweetBackground />
      <BrandHeader roomCode={code} />
      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6">
        <div className="rounded-[8px] border border-white/70 bg-white/82 p-5 shadow-soft sm:p-7">
          {!state ? (
            <p className="font-bold text-cocoa/70">正在进入游戏...</p>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-cocoa/58">第 {state.round} 轮 / 共 {state.totalRounds} 轮</p>
                  <h1 className="mt-1 text-2xl font-black text-cocoa">{gameTitle(state)}</h1>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/room?code=${code}`)}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-cream px-4 text-sm font-black text-cocoa"
                >
                  <LogOut className="h-4 w-4" />
                  返回房间
                </button>
              </div>
              {state.gameId === "match-quiz" ? (
                <MatchQuizView
                  state={state}
                  playersById={playersById}
                  onAnswer={(answer) => sendAction({ type: "match-answer", answer })}
                />
              ) : null}
              {state.gameId === "reaction-duel" ? (
                <ReactionDuelView
                  state={state}
                  playersById={playersById}
                  onClickNow={() => sendAction({ type: "reaction-click", clientTime: Date.now() })}
                />
              ) : null}
              {state.gameId === "heart-sync" ? (
                <HeartSyncView
                  state={state}
                  playersById={playersById}
                  onChoice={(choice) => sendAction({ type: "heart-choice", choice, clientTime: Date.now() })}
                />
              ) : null}
            </>
          )}
          {error ? <p className="mt-5 text-sm font-bold text-rose-600">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}

function gameTitle(state: PublicGameState) {
  if (state.gameId === "match-quiz") return "默契问答";
  if (state.gameId === "reaction-duel") return "反应抢答";
  return "合作心动连线";
}

function MatchQuizView({
  state,
  playersById,
  onAnswer
}: {
  state: MatchQuizPublicState;
  playersById: Record<string, string>;
  onAnswer: (answer: string) => void;
}) {
  return (
    <div>
      <p className="text-xl font-black leading-8 text-cocoa">{state.prompt}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {state.options.map((option) => (
          <PrimaryButton key={option} onClick={() => onAnswer(option)} disabled={state.status !== "answering"}>
            {option}
          </PrimaryButton>
        ))}
      </div>
      <p className="mt-5 text-sm font-bold text-cocoa/60">已提交：{state.submittedPlayerIds.length} / 2</p>
      {state.revealed ? (
        <div className="mt-5 rounded-[8px] bg-cream p-4">
          <p className="text-lg font-black text-cocoa">{state.revealed.matched ? "默契一致！" : "这次有点小分歧"}</p>
          <div className="mt-3 grid gap-2 text-sm font-bold text-cocoa/70">
            {Object.entries(state.revealed.answers).map(([id, answer]) => (
              <span key={id}>{playersById[id] ?? "玩家"}：{answer}</span>
            ))}
          </div>
        </div>
      ) : null}
      <p className="mt-5 text-lg font-black text-candy">默契分：{state.score}</p>
    </div>
  );
}

function ReactionDuelView({
  state,
  playersById,
  onClickNow
}: {
  state: ReactionDuelPublicState;
  playersById: Record<string, string>;
  onClickNow: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-48 w-48 place-items-center rounded-full bg-gradient-to-br from-candy to-lilac text-white shadow-soft">
        <HeartPulse className="h-16 w-16" />
      </div>
      <p className="mt-6 text-2xl font-black text-cocoa">{state.message}</p>
      <PrimaryButton className="mt-6 min-h-16 min-w-48 text-lg" onClick={onClickNow} disabled={state.status === "revealing" || state.status === "ended"}>
        <MousePointerClick className="h-5 w-5" />
        点这里
      </PrimaryButton>
      {state.winnerId ? <p className="mt-4 font-black text-candy">{playersById[state.winnerId]} 抢到了！</p> : null}
      {state.foulPlayerId ? <p className="mt-4 font-black text-rose-600">{playersById[state.foulPlayerId]} 提前点啦</p> : null}
      <div className="mt-6 grid gap-2 text-sm font-bold text-cocoa/70">
        {Object.entries(state.scores).map(([id, score]) => (
          <span key={id}>{playersById[id] ?? "玩家"}：{score}</span>
        ))}
      </div>
    </div>
  );
}

function HeartSyncView({
  state,
  playersById,
  onChoice
}: {
  state: HeartSyncPublicState;
  playersById: Record<string, string>;
  onChoice: (choice: string) => void;
}) {
  return (
    <div>
      <p className="text-lg font-bold text-cocoa/68">一起选中目标颜色，越同步分数越高。</p>
      <div className="mt-4 rounded-[8px] bg-cream p-4">
        <p className="text-sm font-black text-cocoa/58">目标</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="h-10 w-10 rounded-full" style={{ background: state.target.color }} />
          <span className="text-xl font-black text-cocoa">{state.target.label}</span>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {state.choices.map((choice) => (
          <button
            key={choice.label}
            type="button"
            disabled={state.status !== "choosing"}
            onClick={() => onChoice(choice.label)}
            className="rounded-[8px] border border-white/70 bg-white p-4 text-center font-black text-cocoa shadow-soft disabled:opacity-50"
          >
            <span className="mx-auto mb-3 block h-12 w-12 rounded-full" style={{ background: choice.color }} />
            {choice.label}
          </button>
        ))}
      </div>
      <p className="mt-5 text-sm font-bold text-cocoa/60">已选择：{state.submittedPlayerIds.length} / 2</p>
      {state.revealed ? (
        <div className="mt-5 rounded-[8px] bg-cream p-4">
          <p className="text-lg font-black text-cocoa">本轮 +{state.revealed.awarded} 分</p>
          <p className="mt-2 text-sm font-bold text-cocoa/65">同步差：{state.revealed.deltaMs ?? 0} ms</p>
          {Object.entries(state.revealed.selections).map(([id, choice]) => (
            <p key={id} className="text-sm font-bold text-cocoa/65">{playersById[id] ?? "玩家"}：{choice}</p>
          ))}
        </div>
      ) : null}
      <p className="mt-5 text-lg font-black text-candy">心动同步分：{state.syncScore}</p>
    </div>
  );
}
