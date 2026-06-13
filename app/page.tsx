"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DoorOpen, Plus, Sparkles } from "lucide-react";
import { BrandHeader } from "../components/BrandHeader";
import { GameCard } from "../components/GameCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { SweetBackground } from "../components/SweetBackground";
import { getSocket } from "../lib/socket";
import { readSession, saveSession } from "../lib/session";
import { GAME_CATALOG } from "../packages/shared/types";

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"create" | "join" | undefined>();

  async function createRoom() {
    setError("");
    setLoading("create");
    const socket = getSocket();
    socket.emit("room:create", { nickname: nickname || "小甜豆" }, (response) => {
      setLoading(undefined);
      if (!response.ok) {
        setError(response.error);
        return;
      }
      saveSession(response.data.playerId, response.data.room.code, nickname || "小甜豆");
      router.push(`/room?code=${response.data.room.code}`);
    });
  }

  async function joinRoom() {
    setError("");
    if (!/^\d{6}$/.test(roomCode.trim())) {
      setError("请输入 6 位数字房间码。");
      return;
    }
    setLoading("join");
    const previous = readSession();
    getSocket().emit(
      "room:join",
      {
        code: roomCode.trim(),
        nickname: nickname || "小甜豆",
        previousPlayerId: previous.roomCode === roomCode.trim() ? previous.playerId : undefined
      },
      (response) => {
        setLoading(undefined);
        if (!response.ok) {
          setError(response.error);
          return;
        }
        saveSession(response.data.playerId, response.data.room.code, nickname || "小甜豆");
        router.push(`/room?code=${response.data.room.code}`);
      }
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <SweetBackground />
      <BrandHeader />
      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 px-4 pb-12 pt-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="py-4 sm:py-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-cocoa/70 shadow-soft">
            <Sparkles className="h-4 w-4 text-candy" />
            Couple Play / 恋爱小游戏
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-cocoa sm:text-6xl">
            豪豪和小糖豆的游戏网站
          </h1>
          <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-cocoa/70">
            这是只属于我们的小游戏宇宙
          </p>

          <div className="mt-8 grid gap-4 rounded-[8px] border border-white/70 bg-white/78 p-4 shadow-soft sm:grid-cols-2 sm:p-5">
            <label className="sm:col-span-2">
              <span className="text-sm font-black text-cocoa">昵称</span>
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="例如：豪豪 / 小糖豆"
                className="mt-2 h-12 w-full rounded-[8px] border border-candy/20 bg-cream px-4 font-bold outline-none ring-candy/20 focus:ring-4"
                maxLength={18}
              />
            </label>
            <PrimaryButton onClick={createRoom} disabled={!!loading}>
              <Plus className="h-4 w-4" />
              {loading === "create" ? "创建中..." : "创建房间"}
            </PrimaryButton>
            <div className="flex gap-2">
              <input
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6 位房间码"
                className="h-12 min-w-0 flex-1 rounded-[8px] border border-lilac/30 bg-cream px-4 text-center font-black tracking-[0.2em] outline-none ring-lilac/20 focus:ring-4"
              />
              <PrimaryButton onClick={joinRoom} disabled={!!loading} className="px-4">
                <DoorOpen className="h-4 w-4" />
                加入
              </PrimaryButton>
            </div>
            {error ? <p className="sm:col-span-2 text-sm font-bold text-rose-600">{error}</p> : null}
          </div>
        </div>

        <div className="grid gap-4">
          {GAME_CATALOG.map((game) => (
            <GameCard key={game.id} id={game.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
