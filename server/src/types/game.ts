import type { GameAction, GameId, Player, PublicGameState } from "../../../packages/shared/types";

export type GameContext = {
  roomCode: string;
  players: Player[];
  now: () => number;
  schedule: (callback: () => void, ms: number) => NodeJS.Timeout;
  broadcast: () => void;
};

export type GameInstance<TState = unknown> = {
  id: GameId;
  state: TState;
  handlePlayerAction: (playerId: string, action: GameAction, context: GameContext) => void;
  getPublicState: (context: GameContext) => PublicGameState;
  endGame: (context: GameContext) => PublicGameState;
};

export type GameModule<TState = unknown> = {
  id: GameId;
  initGame: (context: GameContext) => GameInstance<TState>;
};
