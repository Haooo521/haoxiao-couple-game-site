import Link from "next/link";
import { Gamepad2, Heart } from "lucide-react";

type BrandHeaderProps = {
  roomCode?: string;
};

export function BrandHeader({ roomCode }: BrandHeaderProps) {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
      <Link href="/" className="flex min-w-0 items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/80 text-candy shadow-soft">
          <Heart className="h-5 w-5 fill-current" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-base font-black text-cocoa sm:text-lg">
            豪豪和小糖豆的游戏网站
          </span>
          <span className="hidden text-xs font-semibold text-cocoa/60 sm:block">
            这是只属于我们的小游戏宇宙
          </span>
        </span>
      </Link>
      <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-bold text-cocoa/70 shadow-soft">
        <Gamepad2 className="h-4 w-4 text-lilac" />
        {roomCode ? `房间 ${roomCode}` : "实时甜蜜连线"}
      </div>
    </header>
  );
}
