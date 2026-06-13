export type GameId = "match-quiz" | "reaction-duel" | "heart-sync";

export type RoomPhase = "waiting" | "playing" | "finished";

export type Player = {
  id: string;
  nickname: string;
  connected: boolean;
  isHost: boolean;
};

export type GameSummary = {
  id: GameId;
  name: string;
  tagline: string;
  accent: string;
};

export type RoomSnapshot = {
  code: string;
  phase: RoomPhase;
  players: Player[];
  hostId?: string;
  selectedGame?: GameId;
  gameState?: PublicGameState;
  createdAt: number;
};

export type PublicGameState =
  | MatchQuizPublicState
  | ReactionDuelPublicState
  | HeartSyncPublicState;

export type MatchQuizPublicState = {
  gameId: "match-quiz";
  status: "answering" | "revealing" | "ended";
  round: number;
  totalRounds: number;
  prompt: string;
  options: string[];
  submittedPlayerIds: string[];
  revealed?: {
    answers: Record<string, string>;
    matched: boolean;
  };
  score: number;
};

export type ReactionDuelPublicState = {
  gameId: "reaction-duel";
  status: "waiting" | "clickable" | "revealing" | "ended";
  round: number;
  totalRounds: number;
  readyAt?: number;
  message: string;
  winnerId?: string;
  foulPlayerId?: string;
  scores: Record<string, number>;
};

export type HeartSyncPublicState = {
  gameId: "heart-sync";
  status: "choosing" | "revealing" | "ended";
  round: number;
  totalRounds: number;
  target: {
    color: string;
    label: string;
  };
  choices: Array<{
    color: string;
    label: string;
  }>;
  submittedPlayerIds: string[];
  syncScore: number;
  revealed?: {
    selections: Record<string, string>;
    deltaMs?: number;
    awarded: number;
  };
};

export type ClientToServerEvents = {
  "room:create": (
    payload: { nickname: string },
    ack: (response: ServerAck<{ room: RoomSnapshot; playerId: string }>) => void
  ) => void;
  "room:join": (
    payload: { code: string; nickname: string; previousPlayerId?: string },
    ack: (response: ServerAck<{ room: RoomSnapshot; playerId: string }>) => void
  ) => void;
  "room:leave": (payload: { code: string; playerId: string }) => void;
  "game:select": (payload: { code: string; playerId: string; gameId: GameId }) => void;
  "game:start": (payload: { code: string; playerId: string; gameId: GameId }) => void;
  "game:action": (payload: { code: string; playerId: string; action: GameAction }) => void;
};

export type ServerToClientEvents = {
  "room:update": (room: RoomSnapshot) => void;
  "room:error": (error: { message: string }) => void;
};

export type ServerAck<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };

export type GameAction =
  | { type: "match-answer"; answer: string }
  | { type: "reaction-click"; clientTime: number }
  | { type: "heart-choice"; choice: string; clientTime: number }
  | { type: "next-round" };

export const GAME_CATALOG: GameSummary[] = [
  {
    id: "match-quiz",
    name: "默契问答",
    tagline: "看看你们是不是选到同一颗心。",
    accent: "from-pink-300 to-fuchsia-300"
  },
  {
    id: "reaction-duel",
    name: "反应抢答",
    tagline: "等到心动信号出现，再比谁先点。",
    accent: "from-sky-300 to-violet-300"
  },
  {
    id: "heart-sync",
    name: "合作心动连线",
    tagline: "一起选中同样的颜色，越同步越甜。",
    accent: "from-rose-300 to-amber-200"
  }
];
