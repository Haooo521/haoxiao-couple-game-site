import type { GameId } from "../../../packages/shared/types";
import type { GameModule } from "../types/game";
import { heartSyncGame } from "./heartSync";
import { matchQuizGame } from "./matchQuiz";
import { reactionDuelGame } from "./reactionDuel";

export const gameRegistry: Record<GameId, GameModule> = {
  "match-quiz": matchQuizGame,
  "reaction-duel": reactionDuelGame,
  "heart-sync": heartSyncGame
};
