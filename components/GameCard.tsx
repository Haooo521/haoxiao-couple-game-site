import type { GameId } from "../packages/shared/types";
import { GAME_CATALOG } from "../packages/shared/types";

type GameCardProps = {
  id: GameId;
  selected?: boolean;
  onClick?: () => void;
};

export function GameCard({ id, selected, onClick }: GameCardProps) {
  const game = GAME_CATALOG.find((item) => item.id === id);
  if (!game) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[8px] border bg-white/76 p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:bg-white ${
        selected ? "border-candy ring-4 ring-candy/15" : "border-white/70"
      }`}
    >
      <div className={`mb-4 h-2 rounded-full bg-gradient-to-r ${game.accent}`} />
      <h3 className="text-lg font-black text-cocoa">{game.name}</h3>
      <p className="mt-2 text-sm leading-6 text-cocoa/68">{game.tagline}</p>
    </button>
  );
}
