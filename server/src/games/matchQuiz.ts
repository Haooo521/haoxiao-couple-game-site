import type { MatchQuizPublicState } from "../../../packages/shared/types";
import type { GameContext, GameInstance, GameModule } from "../types/game";

type Question = {
  prompt: string;
  options: string[];
};

type MatchQuizState = {
  status: MatchQuizPublicState["status"];
  round: number;
  totalRounds: number;
  questions: Question[];
  answers: Record<string, string>;
  revealed?: MatchQuizPublicState["revealed"];
  score: number;
};

const QUESTION_BANK: Question[] = [
  { prompt: "周末更想宅家还是出门？", options: ["宅家抱抱", "出门约会"] },
  { prompt: "吵架后谁更容易先低头？", options: ["豪豪", "小糖豆"] },
  { prompt: "约会更喜欢电影还是吃饭？", options: ["看电影", "吃好吃的"] },
  { prompt: "睡前更想听哪一句？", options: ["晚安宝贝", "明天也爱你"] },
  { prompt: "如果一起旅行，先去哪？", options: ["海边", "山里"] }
];

function pickQuestions(total: number) {
  return [...QUESTION_BANK].sort(() => Math.random() - 0.5).slice(0, total);
}

function currentQuestion(state: MatchQuizState) {
  return state.questions[state.round - 1];
}

function toPublicState(state: MatchQuizState): MatchQuizPublicState {
  return {
    gameId: "match-quiz",
    status: state.status,
    round: state.round,
    totalRounds: state.totalRounds,
    prompt: currentQuestion(state)?.prompt ?? "默契满分，准备看结果吧。",
    options: currentQuestion(state)?.options ?? [],
    submittedPlayerIds: Object.keys(state.answers),
    revealed: state.revealed,
    score: state.score
  };
}

export const matchQuizGame: GameModule<MatchQuizState> = {
  id: "match-quiz",
  initGame(): GameInstance<MatchQuizState> {
    const state: MatchQuizState = {
      status: "answering",
      round: 1,
      totalRounds: 3,
      questions: pickQuestions(3),
      answers: {},
      score: 0
    };

    return {
      id: "match-quiz",
      state,
      handlePlayerAction(playerId, action, context) {
        if (action.type === "match-answer" && state.status === "answering") {
          if (!currentQuestion(state)?.options.includes(action.answer)) return;
          state.answers[playerId] = action.answer;

          const activeIds = context.players.map((player) => player.id);
          if (activeIds.length >= 2 && activeIds.every((id) => state.answers[id])) {
            const values = activeIds.map((id) => state.answers[id]);
            const matched = values.every((value) => value === values[0]);
            if (matched) state.score += 1;
            state.status = "revealing";
            state.revealed = {
              answers: Object.fromEntries(activeIds.map((id) => [id, state.answers[id]])),
              matched
            };
            context.schedule(() => {
              if (state.round >= state.totalRounds) {
                state.status = "ended";
              } else {
                state.round += 1;
                state.status = "answering";
                state.answers = {};
                state.revealed = undefined;
              }
              context.broadcast();
            }, 2200);
          }
        }

        if (action.type === "next-round" && state.status === "revealing") {
          state.round = Math.min(state.round + 1, state.totalRounds);
          state.status = state.round >= state.totalRounds ? "ended" : "answering";
          state.answers = {};
          state.revealed = undefined;
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
