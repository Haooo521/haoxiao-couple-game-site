import type { ReactionDuelPublicState } from "../../../packages/shared/types";
import type { GameContext, GameInstance, GameModule } from "../types/game";

type ReactionState = {
  status: ReactionDuelPublicState["status"];
  round: number;
  totalRounds: number;
  readyAt: number;
  winnerId?: string;
  foulPlayerId?: string;
  scores: Record<string, number>;
};

function nextDelay() {
  return 1600 + Math.floor(Math.random() * 2600);
}

function armRound(state: ReactionState, context: GameContext) {
  state.status = "waiting";
  state.readyAt = context.now() + nextDelay();
  state.winnerId = undefined;
  state.foulPlayerId = undefined;
  context.schedule(() => {
    if (state.status === "waiting") {
      state.status = "clickable";
      context.broadcast();
    }
  }, Math.max(0, state.readyAt - context.now()));
}

function toPublicState(state: ReactionState): ReactionDuelPublicState {
  return {
    gameId: "reaction-duel",
    status: state.status,
    round: state.round,
    totalRounds: state.totalRounds,
    readyAt: state.readyAt,
    message:
      state.status === "waiting"
        ? "等一下，心动信号还没出现"
        : state.status === "clickable"
          ? "点击！"
          : state.status === "ended"
            ? "抢答结束"
            : "这一轮揭晓中",
    winnerId: state.winnerId,
    foulPlayerId: state.foulPlayerId,
    scores: state.scores
  };
}

export const reactionDuelGame: GameModule<ReactionState> = {
  id: "reaction-duel",
  initGame(context): GameInstance<ReactionState> {
    const state: ReactionState = {
      status: "waiting",
      round: 1,
      totalRounds: 5,
      readyAt: 0,
      scores: Object.fromEntries(context.players.map((player) => [player.id, 0]))
    };
    armRound(state, context);

    return {
      id: "reaction-duel",
      state,
      handlePlayerAction(playerId, action, ctx) {
        if (action.type !== "reaction-click") return;
        if (state.status === "waiting") {
          state.foulPlayerId = playerId;
          state.status = "revealing";
        } else if (state.status === "clickable") {
          state.winnerId = playerId;
          state.scores[playerId] = (state.scores[playerId] ?? 0) + 1;
          state.status = "revealing";
        } else {
          return;
        }

        ctx.schedule(() => {
          if (state.round >= state.totalRounds) {
            state.status = "ended";
          } else {
            state.round += 1;
            armRound(state, ctx);
          }
          ctx.broadcast();
        }, 1700);
      },
      getPublicState() {
        return toPublicState(state);
      },
      endGame() {
        state.status = "ended";
        return toPublicState(state);
      }
    };
  }
};
