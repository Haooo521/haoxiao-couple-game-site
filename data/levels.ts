import type { GameDifficulty } from "./games";

export type GameLevel = {
  levelId: string;
  levelName: string;
  difficulty: GameDifficulty;
  description: string;
  timeLimit: number;
  targetScore: number;
  rounds: number;
  options: string[];
  unlockCondition: string;
};

export const defaultLevels: GameLevel[] = [
  {
    levelId: "l1",
    levelName: "入门甜甜局",
    difficulty: "入门",
    description: "轻松熟悉规则，适合第一局。",
    timeLimit: 0,
    targetScore: 3,
    rounds: 5,
    options: [],
    unlockCondition: "默认解锁"
  },
  {
    levelId: "l2",
    levelName: "简单默契局",
    difficulty: "简单",
    description: "题目更多，看看你们的日常默契。",
    timeLimit: 0,
    targetScore: 6,
    rounds: 10,
    options: [],
    unlockCondition: "完成入门甜甜局"
  },
  {
    levelId: "l3",
    levelName: "超甜挑战局",
    difficulty: "超甜挑战",
    description: "更长的深度挑战，适合生成详细报告。",
    timeLimit: 0,
    targetScore: 12,
    rounds: 20,
    options: [],
    unlockCondition: "默契值达到 60%"
  }
];

export const memoryLevels: GameLevel[] = [4, 6, 8, 10, 12].map((pairs, index) => ({
  levelId: `m${index + 1}`,
  levelName: `第 ${index + 1} 关：${pairs} 对卡牌`,
  difficulty: (["入门", "简单", "普通", "困难", "超甜挑战"] as const)[index],
  description: `${pairs} 对可爱卡牌，考验你们的共同记忆。`,
  timeLimit: 0,
  targetScore: pairs,
  rounds: pairs * 2,
  options: [`${pairs} 对`],
  unlockCondition: index === 0 ? "默认解锁" : `完成第 ${index} 关`
}));
