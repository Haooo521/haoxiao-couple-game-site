import type { HeartSyncPublicState } from "../../../packages/shared/types";
import type { GameContext, GameInstance, GameModule } from "../types/game";

type HeartChoice = {
  color: string;
  label: string;
};

type HeartSyncState = {
  status: HeartSyncPublicState["status"];
  round: number;
  totalRounds: number;
  target: HeartChoice;
  choices: HeartChoice[];
  selections: Record<string, { choice: string; at: number }>;
  syncScore: number;
  revealed?: HeartSyncPublicState["revealed"];
};

const CHOICES: HeartChoice[] = [
  { color: "#ff7eb6", label: "草莓粉" },
  { color: "#c8a5ff", label: "葡萄紫" },
  { color: "#9dd8ff", label: "汽水蓝" },
  { color: "#ffd37e", label: "奶油黄" }
];

function pickTarget() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

function toPublicState(state: HeartSyncState): HeartSyncPublicState {
  return {
    gameId: "heart-sync",
    status: state.status,
    round: state.round,
    totalRounds: state.totalRounds,
    target: state.target,
    choices: state.choices,
    submittedPlayerIds: Object.keys(state.selections),
    syncScore: state.syncScore,
    revealed: state.revealed
  };
}

export const heartSyncGame: GameModule<HeartSyncState> = {
  id: "heart-sync",
  initGame(): GameInstance<HeartSyncState> {
    const state: HeartSyncState = {
      status: "choosing",
      round: 1,
      totalRounds: 5,
      target: pickTarget(),
      choices: CHOICES,
      selections: {},
      syncScore: 0
    };

    return {
      id: "heart-sync",
      state,
      handlePlayerAction(playerId, action, context) {
        if (action.type !== "heart-choice" || state.status !== "choosing") return;
        if (!state.choices.some((choice) => choice.label === action.choice)) return;
        state.selections[playerId] = { choice: action.choice, at: action.clientTime };

        const ids = context.players.map((player) => player.id);
        if (ids.length >= 2 && ids.every((id) => state.selections[id])) {
          const selected = ids.map((id) => state.selections[id]);
          const sameTarget = selected.every((item) => item.choice === state.target.label);
          const deltaMs = Math.abs(selected[0].at - selected[1].at);
          const timingBonus = Math.max(0, 100 - Math.floor(deltaMs / 20));
          const awarded = sameTarget ? 100 + timingBonus : 20;
          state.syncScore += awarded;
          state.status = "revealing";
          state.revealed = {
            selections: Object.fromEntries(ids.map((id) => [id, state.selections[id].choice])),
            deltaMs,
            awarded
          };

          context.schedule(() => {
            if (state.round >= state.totalRounds) {
              state.status = "ended";
            } else {
              state.round += 1;
              state.status = "choosing";
              state.target = pickTarget();
              state.selections = {};
              state.revealed = undefined;
            }
            context.broadcast();
          }, 1900);
        }
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
