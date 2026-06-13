export type GameCategory =
  | "默契测试"
  | "反应对抗"
  | "合作挑战"
  | "甜蜜问答"
  | "脑力小游戏"
  | "运气小游戏"
  | "亲密互动";

export type GameDifficulty = "入门" | "简单" | "普通" | "困难" | "超甜挑战";

export type GameMode = {
  modeId: string;
  modeName: string;
  description: string;
};

export type GameDefinition = {
  gameId: string;
  gameName: string;
  category: GameCategory;
  description: string;
  recommendedPlayers: string;
  difficulty: GameDifficulty;
  supportsLevels: boolean;
  modes: GameMode[];
};

export const gameCategories: GameCategory[] = [
  "默契测试",
  "反应对抗",
  "合作挑战",
  "甜蜜问答",
  "脑力小游戏",
  "运气小游戏",
  "亲密互动"
];

export const games: GameDefinition[] = [
  {
    gameId: "compatibility-quest",
    gameName: "默契大考验",
    category: "默契测试",
    description: "随机中文题库，双人同时选择，计算默契值。",
    recommendedPlayers: "2 人",
    difficulty: "简单",
    supportsLevels: true,
    modes: [
      { modeId: "classic", modeName: "经典模式", description: "10 题计分。" },
      { modeId: "quick", modeName: "快速模式", description: "5 题快速结束。" },
      { modeId: "deep", modeName: "深度模式", description: "20 题并生成详细报告。" }
    ]
  },
  {
    gameId: "reaction-duel",
    gameName: "心动抢答",
    category: "反应对抗",
    description: "随机倒计时后抢先点击，提前点击算犯规。",
    recommendedPlayers: "2 人",
    difficulty: "普通",
    supportsLevels: true,
    modes: [
      { modeId: "normal", modeName: "普通抢答", description: "稳定倒计时抢答。" },
      { modeId: "noise", modeName: "干扰抢答", description: "出现不要点、等等等干扰文字。" },
      { modeId: "streak", modeName: "连胜挑战", description: "连续抢中获得额外心动值。" }
    ]
  },
  {
    gameId: "heart-sync",
    gameName: "双人心有灵犀",
    category: "合作挑战",
    description: "不能交流，选择相同选项即可过关。",
    recommendedPlayers: "2 人",
    difficulty: "普通",
    supportsLevels: true,
    modes: [
      { modeId: "color", modeName: "颜色选择", description: "同步选择颜色。" },
      { modeId: "emoji", modeName: "表情选择", description: "同步选择表情和心情。" },
      { modeId: "date", modeName: "约会选择", description: "同步选择约会地点。" }
    ]
  },
  {
    gameId: "guess-me",
    gameName: "你猜我想",
    category: "甜蜜问答",
    description: "一人先回答，另一人猜对方的答案。",
    recommendedPlayers: "2 人",
    difficulty: "普通",
    supportsLevels: true,
    modes: [
      { modeId: "turn", modeName: "轮流猜心", description: "每轮交换身份。" },
      { modeId: "quick", modeName: "快速猜想", description: "更短局数。" },
      { modeId: "deep", modeName: "深度提问", description: "更多亲密问题。" }
    ]
  },
  {
    gameId: "couple-choice",
    gameName: "情侣选择题",
    category: "亲密互动",
    description: "双方同时二选一，最后生成情侣默契报告。",
    recommendedPlayers: "2 人",
    difficulty: "入门",
    supportsLevels: false,
    modes: [
      { modeId: "classic", modeName: "经典二选一", description: "轻松甜蜜选择。" },
      { modeId: "quick", modeName: "快速甜问", description: "快速完成。" },
      { modeId: "report", modeName: "报告模式", description: "生成更详细报告。" }
    ]
  },
  {
    gameId: "memory-cards",
    gameName: "甜蜜记忆翻牌",
    category: "脑力小游戏",
    description: "轮流翻牌，配对相同图案得分。",
    recommendedPlayers: "2 人",
    difficulty: "普通",
    supportsLevels: true,
    modes: [
      { modeId: "coop", modeName: "合作模式", description: "一起完成配对。" },
      { modeId: "versus", modeName: "对抗模式", description: "各自得分竞争。" },
      { modeId: "timed", modeName: "限时模式", description: "限定时间内配对。" }
    ]
  },
  {
    gameId: "lucky-wheel",
    gameName: "糖豆运气转盘",
    category: "运气小游戏",
    description: "轮流转盘，获得奖励、加分或甜蜜问题。",
    recommendedPlayers: "2 人",
    difficulty: "入门",
    supportsLevels: false,
    modes: [
      { modeId: "score", modeName: "积分模式", description: "分数高者获胜。" },
      { modeId: "sweet", modeName: "甜蜜问题模式", description: "更多甜蜜提问。" },
      { modeId: "bean", modeName: "糖豆奖励模式", description: "更高随机奖励。" }
    ]
  },
  {
    gameId: "heart-relay",
    gameName: "爱心接力",
    category: "合作挑战",
    description: "双方轮流点击传递爱心，连续成功增加爱心值。",
    recommendedPlayers: "2 人",
    difficulty: "困难",
    supportsLevels: true,
    modes: [
      { modeId: "easy", modeName: "简单节奏", description: "基础轮流点击。" },
      { modeId: "fast", modeName: "加速节奏", description: "节奏逐步加快。" },
      { modeId: "random", modeName: "随机节奏", description: "节奏更随机。" }
    ]
  },
  {
    gameId: "emotion-sync",
    gameName: "情绪同步挑战",
    category: "默契测试",
    description: "根据同一场景选择情绪，计算情绪同步指数。",
    recommendedPlayers: "2 人",
    difficulty: "简单",
    supportsLevels: true,
    modes: [
      { modeId: "scene", modeName: "场景同步", description: "生活场景情绪选择。" },
      { modeId: "quick", modeName: "快速情绪", description: "快速结束。" },
      { modeId: "deep", modeName: "深度情绪", description: "更多场景。" }
    ]
  },
  {
    gameId: "sugarbean-qa",
    gameName: "小糖豆问答挑战",
    category: "甜蜜问答",
    description: "围绕彼此的随机问题，轮流回答和猜测。",
    recommendedPlayers: "2 人",
    difficulty: "简单",
    supportsLevels: false,
    modes: [
      { modeId: "public", modeName: "公开答案", description: "回答后直接公开。" },
      { modeId: "hidden", modeName: "隐藏答案", description: "先猜再公开。" },
      { modeId: "turn", modeName: "轮流回答", description: "每轮交换身份。" }
    ]
  }
];
