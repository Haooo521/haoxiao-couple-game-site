export type GameQuestion = {
  id: string;
  theme: string;
  prompt: string;
  options: string[];
  comment?: string;
};

export const questionThemes = [
  "日常生活",
  "约会偏好",
  "吃喝选择",
  "性格习惯",
  "情绪反应",
  "未来计划",
  "甜蜜回忆"
] as const;

export const compatibilityQuestionCount = 84;

export const sampleCompatibilityQuestions: GameQuestion[] = [
  { id: "demo-1", theme: "日常生活", prompt: "周末更想宅在家还是出去玩？", options: ["宅在家", "出去玩"] },
  { id: "demo-2", theme: "约会偏好", prompt: "约会更喜欢看电影还是吃饭？", options: ["看电影", "吃饭"] },
  { id: "demo-3", theme: "情绪反应", prompt: "生气后谁更容易先低头？", options: ["豪豪", "小糖豆"] },
  { id: "demo-4", theme: "性格习惯", prompt: "更喜欢惊喜还是陪伴？", options: ["惊喜", "陪伴"] },
  { id: "demo-5", theme: "日常生活", prompt: "晚上更想聊天还是一起玩游戏？", options: ["聊天", "一起玩游戏"] }
];

export const guessQuestions: GameQuestion[] = [
  { id: "guess-1", theme: "甜蜜问答", prompt: "我现在最想吃什么？", options: ["火锅", "甜品", "烧烤", "奶茶"] },
  { id: "guess-2", theme: "甜蜜问答", prompt: "我今天心情怎么样？", options: ["开心", "有点累", "想撒娇", "很放松"] },
  { id: "guess-3", theme: "甜蜜问答", prompt: "我最喜欢你的哪个小习惯？", options: ["认真听我说话", "悄悄照顾我", "逗我笑", "记得小细节"] },
  { id: "guess-4", theme: "甜蜜问答", prompt: "我更想去哪里约会？", options: ["海边", "电影院", "咖啡馆", "游乐园"] },
  { id: "guess-5", theme: "甜蜜问答", prompt: "我现在最想收到什么？", options: ["抱抱", "夸夸", "小惊喜", "陪我聊天"] }
];

export const emotionScenes: GameQuestion[] = [
  { id: "emotion-1", theme: "情绪同步", prompt: "突然下雨但没有带伞", options: ["浪漫", "慌张", "想笑", "想回家"] },
  { id: "emotion-2", theme: "情绪同步", prompt: "约会迟到了十分钟", options: ["委屈", "理解", "有点气", "想被哄"] },
  { id: "emotion-3", theme: "情绪同步", prompt: "晚上突然想吃夜宵", options: ["兴奋", "纠结", "立刻出发", "想点外卖"] },
  { id: "emotion-4", theme: "情绪同步", prompt: "看到一只很可爱的猫", options: ["融化", "想拍照", "想摸摸", "想分享"] },
  { id: "emotion-5", theme: "情绪同步", prompt: "周末计划被临时取消", options: ["失落", "轻松", "想改计划", "想宅家"] }
];
