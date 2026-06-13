const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../outputs/preview");
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";
const rooms = new Map();

const categories = ["默契测试", "反应对抗", "合作挑战", "甜蜜问答", "脑力小游戏", "运气小游戏", "亲密互动"];
const resultMessages = [
  "你们也太有默契啦！",
  "这局甜度爆表！",
  "差一点点就心有灵犀啦，再来一局！",
  "小糖豆和豪豪的配合越来越好了！",
  "本局糖分严重超标！",
  "这份默契已经很像专属暗号了！"
];

const questionThemes = {
  日常生活: [
    ["周末更想宅在家还是出去玩？", ["宅在家", "出去玩"]],
    ["晚上更想聊天还是一起玩游戏？", ["聊天", "一起玩游戏"]],
    ["早上起床后更想先吃早餐还是赖床？", ["吃早餐", "赖床"]],
    ["家里更想保持整洁还是舒服最重要？", ["整洁", "舒服"]],
    ["休息日更想睡到自然醒还是早起安排计划？", ["自然醒", "早起计划"]],
    ["下班后更想散步还是躺着休息？", ["散步", "休息"]],
    ["一起做家务更想洗碗还是整理房间？", ["洗碗", "整理房间"]],
    ["手机没电时更焦虑的是谁？", ["豪豪", "小糖豆"]],
    ["更喜欢安静陪伴还是热闹互动？", ["安静陪伴", "热闹互动"]],
    ["临睡前更想听晚安还是抱抱？", ["晚安", "抱抱"]],
    ["周末计划更适合提前安排还是随心出发？", ["提前安排", "随心出发"]],
    ["一起看剧更想追新剧还是重温老剧？", ["追新剧", "老剧"]]
  ],
  约会偏好: [
    ["约会更喜欢看电影还是吃饭？", ["看电影", "吃饭"]],
    ["更想去游乐园还是海边？", ["游乐园", "海边"]],
    ["约会时更喜欢拍照还是认真享受？", ["拍照", "享受当下"]],
    ["纪念日更想收到礼物还是一起旅行？", ["礼物", "旅行"]],
    ["第一次约会更适合咖啡馆还是公园？", ["咖啡馆", "公园"]],
    ["晚上约会更想看夜景还是吃宵夜？", ["看夜景", "吃宵夜"]],
    ["下雨天约会更想逛商场还是窝在家？", ["逛商场", "窝在家"]],
    ["约会迟到十分钟更容易生气的是谁？", ["豪豪", "小糖豆"]],
    ["更喜欢计划满满的约会还是松弛随意的约会？", ["计划满满", "松弛随意"]],
    ["旅行约会更想住民宿还是酒店？", ["民宿", "酒店"]],
    ["拍情侣照更喜欢自然风还是可爱风？", ["自然风", "可爱风"]],
    ["约会结束更想再散步还是早点回家？", ["再散步", "早点回家"]]
  ],
  吃喝选择: [
    ["奶茶还是咖啡？", ["奶茶", "咖啡"]],
    ["火锅还是烧烤？", ["火锅", "烧烤"]],
    ["甜品还是炸鸡？", ["甜品", "炸鸡"]],
    ["辣的还是不辣的？", ["辣的", "不辣的"]],
    ["早餐更想吃包子还是面包？", ["包子", "面包"]],
    ["夜宵更想吃面还是小吃？", ["面", "小吃"]],
    ["水果更喜欢草莓还是西瓜？", ["草莓", "西瓜"]],
    ["约会饮料更想点同款还是各喝各的？", ["同款", "各喝各的"]],
    ["吃饭更看重味道还是环境？", ["味道", "环境"]],
    ["甜味更喜欢奶油还是巧克力？", ["奶油", "巧克力"]],
    ["点外卖更容易纠结的是谁？", ["豪豪", "小糖豆"]],
    ["一起做饭更想做简单菜还是挑战大餐？", ["简单菜", "挑战大餐"]]
  ],
  性格习惯: [
    ["更喜欢惊喜还是陪伴？", ["惊喜", "陪伴"]],
    ["谁更容易主动撒娇？", ["豪豪", "小糖豆"]],
    ["谁更爱记小细节？", ["豪豪", "小糖豆"]],
    ["谁更容易心软？", ["豪豪", "小糖豆"]],
    ["遇到问题更想先沟通还是先冷静？", ["先沟通", "先冷静"]],
    ["谁更像计划派？", ["豪豪", "小糖豆"]],
    ["谁更容易被可爱东西打动？", ["豪豪", "小糖豆"]],
    ["谁更会安慰人？", ["豪豪", "小糖豆"]],
    ["谁更喜欢仪式感？", ["豪豪", "小糖豆"]],
    ["谁更容易因为一句话开心很久？", ["豪豪", "小糖豆"]],
    ["谁更擅长制造小浪漫？", ["豪豪", "小糖豆"]],
    ["谁更容易忘记带东西？", ["豪豪", "小糖豆"]]
  ],
  情绪反应: [
    ["生气后谁更容易先低头？", ["豪豪", "小糖豆"]],
    ["难过时更想被抱抱还是被逗笑？", ["抱抱", "逗笑"]],
    ["压力大时更想独处还是被陪着？", ["独处", "被陪着"]],
    ["开心时更想分享还是先偷笑？", ["分享", "偷笑"]],
    ["吵架后更需要解释还是行动？", ["解释", "行动"]],
    ["突然下雨没带伞会觉得浪漫还是麻烦？", ["浪漫", "麻烦"]],
    ["计划被取消会失落还是轻松？", ["失落", "轻松"]],
    ["看到可爱猫猫会激动还是淡定？", ["激动", "淡定"]],
    ["收到长消息会感动还是紧张？", ["感动", "紧张"]],
    ["冷战时更想发消息还是等对方？", ["发消息", "等对方"]],
    ["被夸奖时会害羞还是骄傲？", ["害羞", "骄傲"]],
    ["心情不好时更想吃甜食还是散步？", ["吃甜食", "散步"]]
  ],
  未来计划: [
    ["未来更想养猫还是养狗？", ["猫", "狗"]],
    ["更想住热闹市中心还是安静小区？", ["市中心", "安静小区"]],
    ["旅行清单更想先去国内还是国外？", ["国内", "国外"]],
    ["未来家里更想有大厨房还是大客厅？", ["大厨房", "大客厅"]],
    ["纪念日传统更想每年旅行还是每年拍照？", ["旅行", "拍照"]],
    ["以后更想一起学做饭还是学跳舞？", ["做饭", "跳舞"]],
    ["攒钱目标更偏向旅行还是小家？", ["旅行", "小家"]],
    ["周末固定活动更想运动还是探店？", ["运动", "探店"]],
    ["未来更想看日出还是看星星？", ["日出", "星星"]],
    ["更想一起开一个愿望清单还是相册？", ["愿望清单", "相册"]],
    ["以后更想拥有游戏房还是影音房？", ["游戏房", "影音房"]],
    ["未来惊喜更想悄悄准备还是一起策划？", ["悄悄准备", "一起策划"]]
  ],
  甜蜜回忆: [
    ["更记得第一次见面还是第一次聊天？", ["第一次见面", "第一次聊天"]],
    ["更喜欢对方哪种瞬间？", ["认真时", "撒娇时"]],
    ["最甜的回忆更像烟花还是棉花糖？", ["烟花", "棉花糖"]],
    ["第一次心动更像突然一下还是慢慢靠近？", ["突然一下", "慢慢靠近"]],
    ["更想重温哪种时刻？", ["牵手散步", "一起吃饭"]],
    ["更常想起对方的笑还是声音？", ["笑", "声音"]],
    ["纪念照更想做成相册还是贴纸？", ["相册", "贴纸"]],
    ["更想保留聊天记录还是旅行票根？", ["聊天记录", "旅行票根"]],
    ["更喜欢被叫宝贝还是小名？", ["宝贝", "小名"]],
    ["更难忘的是一次拥抱还是一句话？", ["拥抱", "一句话"]],
    ["更想把回忆写成日记还是做成视频？", ["日记", "视频"]],
    ["更像你们的关键词是甜甜还是稳稳？", ["甜甜", "稳稳"]]
  ]
};

const compatibilityQuestions = Object.entries(questionThemes).flatMap(([theme, rows], index) =>
  rows.map(([prompt, options], rowIndex) => ({ id: `q-${index}-${rowIndex}`, theme, prompt, options }))
);

const guessQuestions = [
  ["我现在最想吃什么？", ["火锅", "甜品", "烧烤", "奶茶"]],
  ["我今天心情怎么样？", ["开心", "有点累", "想撒娇", "很放松"]],
  ["我最喜欢你的哪个小习惯？", ["认真听我说话", "悄悄照顾我", "逗我笑", "记得小细节"]],
  ["我更想去哪里约会？", ["海边", "电影院", "咖啡馆", "游乐园"]],
  ["我现在最想收到什么？", ["抱抱", "夸夸", "小惊喜", "陪我聊天"]],
  ["我最想一起做什么？", ["散步", "打游戏", "看剧", "吃夜宵"]],
  ["我最容易被什么打动？", ["温柔语气", "实际行动", "可爱礼物", "认真陪伴"]],
  ["如果今晚约会，我更想？", ["吃饭", "看夜景", "拍照", "回家贴贴"]]
];

const emotionScenes = [
  ["突然下雨但没有带伞", ["浪漫", "慌张", "想笑", "想回家"]],
  ["约会迟到了十分钟", ["委屈", "理解", "有点气", "想被哄"]],
  ["晚上突然想吃夜宵", ["兴奋", "纠结", "立刻出发", "想点外卖"]],
  ["看到一只很可爱的猫", ["融化", "想拍照", "想摸摸", "想分享"]],
  ["周末计划被临时取消", ["失落", "轻松", "想改计划", "想宅家"]],
  ["收到对方的小惊喜", ["害羞", "开心", "感动", "想抱抱"]],
  ["一起迷路了", ["紧张", "好笑", "冒险感", "想查地图"]],
  ["对方突然说想你", ["心动", "害羞", "开心", "想见面"]]
];

const choiceQuestions = [
  ["奶茶 or 咖啡", ["奶茶", "咖啡"], "你们的口味里藏着小默契。"],
  ["看电影 or 逛街", ["看电影", "逛街"], "约会路线已经开始冒粉色泡泡了。"],
  ["拍照 or 吃饭", ["拍照", "吃饭"], "一个记录甜蜜，一个制造甜蜜。"],
  ["旅行 or 宅家", ["旅行", "宅家"], "无论去哪，重点都是一起。"],
  ["撒娇 or 讲道理", ["撒娇", "讲道理"], "情侣世界里，两种都很有用。"],
  ["星空 or 海边", ["星空", "海边"], "浪漫场景自动加载中。"],
  ["惊喜 or 陪伴", ["惊喜", "陪伴"], "这题的答案都很甜。"],
  ["牵手 or 拥抱", ["牵手", "拥抱"], "糖分已经开始上升了。"]
];

const levelSets = {
  basic10: [
    { levelId: "l1", levelName: "入门甜甜局", difficulty: "入门", description: "轻松熟悉规则，适合第一局。", timeLimit: 0, targetScore: 3, rounds: 5, options: [], unlockCondition: "默认解锁" },
    { levelId: "l2", levelName: "简单默契局", difficulty: "简单", description: "题目更多，看看你们的日常默契。", timeLimit: 0, targetScore: 6, rounds: 10, options: [], unlockCondition: "完成入门甜甜局" },
    { levelId: "l3", levelName: "超甜挑战局", difficulty: "超甜挑战", description: "更长的深度挑战，结束后更适合生成报告。", timeLimit: 0, targetScore: 12, rounds: 20, options: [], unlockCondition: "默契值达到 60%" }
  ],
  reaction: [
    { levelId: "easy", levelName: "简单心动", difficulty: "简单", description: "倒计时 2-5 秒，适合热身。", timeLimit: 0, targetScore: 3, rounds: 5, options: ["简单"], unlockCondition: "默认解锁" },
    { levelId: "normal", levelName: "普通抢答", difficulty: "普通", description: "倒计时 1.5-4 秒。", timeLimit: 0, targetScore: 3, rounds: 5, options: ["普通"], unlockCondition: "默认解锁" },
    { levelId: "hard", levelName: "地狱干扰", difficulty: "困难", description: "更短倒计时，并出现干扰文字。", timeLimit: 0, targetScore: 4, rounds: 5, options: ["困难", "地狱"], unlockCondition: "完成普通抢答" }
  ],
  memory: [
    { levelId: "m1", levelName: "第 1 关：4 对卡牌", difficulty: "入门", description: "4 对可爱卡牌。", timeLimit: 0, targetScore: 4, rounds: 8, options: ["4 对"], unlockCondition: "默认解锁" },
    { levelId: "m2", levelName: "第 2 关：6 对卡牌", difficulty: "简单", description: "6 对卡牌，记忆力小考验。", timeLimit: 0, targetScore: 6, rounds: 12, options: ["6 对"], unlockCondition: "完成第 1 关" },
    { levelId: "m3", levelName: "第 3 关：8 对卡牌", difficulty: "普通", description: "8 对卡牌，开始认真了。", timeLimit: 0, targetScore: 8, rounds: 16, options: ["8 对"], unlockCondition: "完成第 2 关" },
    { levelId: "m4", levelName: "第 4 关：10 对卡牌", difficulty: "困难", description: "10 对卡牌，需要更强配合。", timeLimit: 0, targetScore: 10, rounds: 20, options: ["10 对"], unlockCondition: "完成第 3 关" },
    { levelId: "m5", levelName: "第 5 关：12 对卡牌", difficulty: "超甜挑战", description: "12 对卡牌，记忆甜度拉满。", timeLimit: 0, targetScore: 12, rounds: 24, options: ["12 对"], unlockCondition: "完成第 4 关" }
  ]
};

const games = [
  { id: "compatibility-quest", aliases: ["match-quiz"], name: "默契大考验", category: "默契测试", summary: "10 题中文默契挑战，覆盖日常、约会、吃喝、情绪和未来计划。", recommendedPlayers: "2 人", difficulty: "简单", supportsLevels: true, uiType: "sync-choice", modes: ["经典模式", "快速模式", "深度模式"], levels: levelSets.basic10, source: "compatibility" },
  { id: "reaction-duel", aliases: [], name: "心动抢答", category: "反应对抗", summary: "等待心动信号出现后立刻点击，提前点击会犯规。", recommendedPlayers: "2 人", difficulty: "普通", supportsLevels: true, uiType: "reaction", modes: ["普通抢答", "干扰抢答", "连胜挑战"], levels: levelSets.reaction },
  { id: "heart-sync", aliases: [], name: "双人心有灵犀", category: "合作挑战", summary: "不能交流，倒计时内选择同一个选项，连续一致获得连击分。", recommendedPlayers: "2 人", difficulty: "普通", supportsLevels: true, uiType: "sync-choice", modes: ["颜色选择", "表情选择", "约会选择"], levels: levelSets.basic10, source: "heart" },
  { id: "guess-me", aliases: [], name: "你猜我想", category: "甜蜜问答", summary: "一人先回答，另一人猜对方心里的答案，每轮交换身份。", recommendedPlayers: "2 人", difficulty: "普通", supportsLevels: true, uiType: "guess", modes: ["轮流猜心", "快速猜想", "深度提问"], levels: levelSets.basic10 },
  { id: "couple-choice", aliases: [], name: "情侣选择题", category: "亲密互动", summary: "同时做二选一选择，每题附带一句甜蜜评价，结束生成默契报告。", recommendedPlayers: "2 人", difficulty: "入门", supportsLevels: false, uiType: "sync-choice", modes: ["经典二选一", "快速甜问", "报告模式"], levels: levelSets.basic10, source: "choice" },
  { id: "memory-cards", aliases: [], name: "甜蜜记忆翻牌", category: "脑力小游戏", summary: "轮流翻开爱心、糖果、星星等卡牌，配合记忆相同图案。", recommendedPlayers: "2 人", difficulty: "普通", supportsLevels: true, uiType: "memory", modes: ["合作模式", "对抗模式", "限时模式"], levels: levelSets.memory },
  { id: "lucky-wheel", aliases: [], name: "糖豆运气转盘", category: "运气小游戏", summary: "双方轮流转动糖豆转盘，轻松获得奖励、加分或甜蜜问题。", recommendedPlayers: "2 人", difficulty: "入门", supportsLevels: false, uiType: "wheel", modes: ["积分模式", "甜蜜问题模式", "糖豆奖励模式"], levels: levelSets.basic10 },
  { id: "heart-relay", aliases: [], name: "爱心接力", category: "合作挑战", summary: "双方按节奏轮流点击爱心，连续成功增加爱心值。", recommendedPlayers: "2 人", difficulty: "困难", supportsLevels: true, uiType: "relay", modes: ["简单节奏", "加速节奏", "随机节奏"], levels: levelSets.basic10 },
  { id: "emotion-sync", aliases: [], name: "情绪同步挑战", category: "默契测试", summary: "面对同一个生活场景，选择最接近的情绪并计算同步指数。", recommendedPlayers: "2 人", difficulty: "简单", supportsLevels: true, uiType: "sync-choice", modes: ["场景同步", "快速情绪", "深度情绪"], levels: levelSets.basic10, source: "emotion" },
  { id: "sugarbean-qa", aliases: [], name: "小糖豆问答挑战", category: "甜蜜问答", summary: "关于彼此的随机问题，可选择公开答案或隐藏答案，结束生成甜蜜总结。", recommendedPlayers: "2 人", difficulty: "简单", supportsLevels: false, uiType: "guess", modes: ["公开答案", "隐藏答案", "轮流回答"], levels: levelSets.basic10 }
];

const gameById = Object.fromEntries(games.flatMap((game) => [[game.id, game], ...(game.aliases || []).map((alias) => [alias, game])]));
const relayNames = ["简单节奏", "加速节奏", "随机节奏", "干扰节奏", "极限节奏"];
const memoryIcons = ["💗", "🍬", "⭐", "🐱", "🎮", "🌙", "🍓", "🌈", "🧁", "🎀", "💌", "🍀"];
const wheelSegments = [
  { label: "加 10 分", delta: 10 },
  { label: "加 20 分", delta: 20 },
  { label: "偷走对方 10 分", delta: 10, steal: 10 },
  { label: "双方都加 10 分", delta: 10, both: true },
  { label: "本轮空过", delta: 0 },
  { label: "触发甜蜜问题", delta: 15, question: "说一句今天想对对方说的话。" },
  { label: "获得糖豆奖励", delta: 25 }
];

function now() { return Date.now(); }
function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" });
  response.end(JSON.stringify(data));
}
function readBody(request) {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => { body += chunk; if (body.length > 100000) request.destroy(); });
    request.on("end", () => { try { resolve(body ? JSON.parse(body) : {}); } catch { resolve({}); } });
  });
}
function makeCode() {
  let value = String(Math.floor(100000 + Math.random() * 900000));
  while (rooms.has(value)) value = String(Math.floor(100000 + Math.random() * 900000));
  return value;
}
function cleanNickname(value) { return String(value || "甜甜玩家").trim().slice(0, 18) || "甜甜玩家"; }
function makePlayer(nickname, isHost) { return { id: `${now()}-${Math.random().toString(16).slice(2)}`, nickname: cleanNickname(nickname), isHost, onlineAt: now() }; }
function getGame(id) { return gameById[id] || gameById["compatibility-quest"]; }
function sample(list, count) { return [...list].sort(() => Math.random() - 0.5).slice(0, count); }
function currentPlayer(room, playerId) { return room.players.find((item) => item.id === playerId); }
function otherPlayer(room, playerId) { return room.players.find((item) => item.id !== playerId); }
function touch(room, playerId) { const player = currentPlayer(room, playerId); if (player) player.onlineAt = now(); }
function makeReport(score, total, metricName) {
  const percent = Math.round((score / Math.max(1, total)) * 100);
  const message = resultMessages[Math.min(resultMessages.length - 1, Math.floor(percent / 20))];
  return { score, total, percent, metricName, title: percent >= 80 ? "甜度爆表" : percent >= 60 ? "心有灵犀" : percent >= 40 ? "继续升温" : "再来一局更甜", message };
}

function publicRoom(room) {
  advanceRoom(room);
  return {
    code: room.code,
    phase: room.phase,
    selectedGame: room.selectedGame,
    selectedMode: room.selectedMode,
    selectedLevelId: room.selectedLevelId,
    players: room.players.map((item) => ({ id: item.id, nickname: item.nickname, isHost: item.isHost, connected: now() - item.onlineAt < 12000 })),
    game: room.game,
    createdAt: room.createdAt
  };
}

function buildQuestionSet(config, mode) {
  if (config.source === "heart") {
    const groups = [
      { prompt: "颜色选择：你觉得现在更像哪种颜色？", options: ["草莓粉", "葡萄紫", "汽水蓝", "奶油黄"] },
      { prompt: "表情选择：此刻最想发哪个表情？", options: ["开心", "害羞", "撒娇", "偷笑"] },
      { prompt: "食物选择：现在最想一起吃什么？", options: ["火锅", "甜品", "烧烤", "奶茶"] },
      { prompt: "约会地点：更想去哪里？", options: ["海边", "电影院", "公园", "咖啡馆"] },
      { prompt: "心情选择：今天更接近哪种心情？", options: ["甜甜", "放松", "期待", "想贴贴"] }
    ];
    return sample([...groups, ...groups, ...groups], 10).map((item, index) => ({ id: `h-${index}`, theme: "心有灵犀", ...item }));
  }
  if (config.source === "choice") return choiceQuestions.map(([prompt, options, comment], index) => ({ id: `c-${index}`, theme: "亲密互动", prompt, options, comment }));
  if (config.source === "emotion") return emotionScenes.map(([prompt, options], index) => ({ id: `e-${index}`, theme: "情绪同步", prompt, options }));
  const count = mode === "快速模式" ? 5 : mode === "深度模式" ? 20 : 10;
  return sample(compatibilityQuestions, count);
}

function initGame(gameId, room, mode, levelId) {
  const config = getGame(gameId);
  const selectedMode = mode || config.modes[0];
  const level = config.levels.find((item) => item.levelId === levelId) || config.levels[0];
  const base = { id: config.id, name: config.name, category: config.category, uiType: config.uiType, mode: selectedMode, level, status: "playing", round: 1, totalRounds: level.rounds || 10, score: 0, report: null, startedAt: now(), endsAt: level.timeLimit ? now() + level.timeLimit * 1000 : null };

  if (config.uiType === "reaction") {
    const ranges = { "简单": [2000, 5000], "普通": [1500, 4000], "困难": [1000, 3000], "超甜挑战": [900, 2600] };
    const [min, max] = ranges[level.difficulty] || ranges["普通"];
    return { ...base, status: "waiting", totalRounds: 5, readyAt: now() + min + Math.floor(Math.random() * (max - min)), nextAt: null, winnerId: null, foulPlayerId: null, prompt: "等待心动信号", scores: Object.fromEntries(room.players.map((p) => [p.id, 0])), streak: {} };
  }
  if (config.uiType === "guess") {
    const rows = config.id === "sugarbean-qa" ? sample([...guessQuestions, ...guessQuestions], 8) : guessQuestions;
    return { ...base, totalRounds: 8, questions: rows.map(([prompt, options], index) => ({ id: `g-${index}`, prompt, options })), status: "answering", answererId: room.players[0].id, guesserId: room.players[1].id, answer: null, guess: null, revealed: null };
  }
  if (config.uiType === "memory") {
    const pairs = Number((level.options[0] || "4").match(/\d+/)?.[0] || 4);
    const cards = sample(memoryIcons, pairs).flatMap((icon, index) => [{ id: `${index}a`, icon, matched: false }, { id: `${index}b`, icon, matched: false }]).sort(() => Math.random() - 0.5).map((card, index) => ({ ...card, index }));
    return { ...base, totalRounds: pairs * 2, cards, flipped: [], matchedPairs: 0, turnPlayerId: room.players[0].id, scores: Object.fromEntries(room.players.map((p) => [p.id, 0])), nextAt: null, lastReveal: null };
  }
  if (config.uiType === "wheel") {
    return { ...base, totalRounds: 8, scores: Object.fromEntries(room.players.map((p) => [p.id, 0])), turnPlayerId: room.players[0].id, lastSpin: null, segments: wheelSegments };
  }
  if (config.uiType === "relay") {
    return { ...base, totalRounds: 20, requiredPlayerId: room.players[0].id, relayName: relayNames[0], combo: 0, heartValue: 0, mistakes: 0, endsAt: now() + 45000 };
  }
  const questions = buildQuestionSet(config, selectedMode);
  return { ...base, totalRounds: questions.length, questions, status: "answering", answers: {}, revealed: null, combo: 0, nextAt: null };
}

function advanceRoom(room) {
  const game = room.game;
  if (!game || room.phase !== "playing") return;
  const t = now();
  if (game.endsAt && t >= game.endsAt && game.status !== "ended") endGame(room);
  if (game.uiType === "reaction") {
    if (game.status === "waiting" && t >= game.readyAt) { game.status = "clickable"; game.prompt = "现在点击！"; }
    if (game.status === "revealing" && t >= game.nextAt) nextReactionRound(room);
  }
  if ((game.uiType === "sync-choice" || game.uiType === "guess") && game.status === "revealing" && t >= game.nextAt) nextQuestionRound(room);
  if (game.uiType === "memory" && game.nextAt && t >= game.nextAt) {
    game.flipped = [];
    game.nextAt = null;
    game.turnPlayerId = otherPlayer(room, game.turnPlayerId)?.id || room.players[0].id;
  }
}

function nextQuestionRound(room) {
  const game = room.game;
  if (game.round >= game.totalRounds) return endGame(room);
  game.round += 1;
  if (game.uiType === "guess") {
    game.status = "answering";
    game.answer = null;
    game.guess = null;
    game.revealed = null;
    const answerer = game.round % 2 === 1 ? room.players[0] : room.players[1];
    game.answererId = answerer.id;
    game.guesserId = otherPlayer(room, answerer.id).id;
  } else {
    game.status = "answering";
    game.answers = {};
    game.revealed = null;
  }
  game.nextAt = null;
}

function nextReactionRound(room) {
  const game = room.game;
  if (game.round >= game.totalRounds) return endGame(room);
  const range = game.level.difficulty === "简单" ? [2000, 5000] : game.level.difficulty === "困难" ? [1000, 3000] : [1500, 4000];
  game.round += 1;
  game.status = "waiting";
  game.readyAt = now() + range[0] + Math.floor(Math.random() * (range[1] - range[0]));
  game.nextAt = null;
  game.winnerId = null;
  game.foulPlayerId = null;
  const distractors = ["不要点", "等等", "快了", "还没到", "别急"];
  game.prompt = game.level.difficulty === "困难" || game.level.difficulty === "超甜挑战" ? distractors[Math.floor(Math.random() * distractors.length)] : "等待心动信号";
}

function endGame(room) {
  const game = room.game;
  game.status = "ended";
  room.phase = "finished";
  if (game.uiType === "reaction" || game.uiType === "wheel" || game.uiType === "memory") {
    const entries = Object.entries(game.scores || {}).sort((a, b) => b[1] - a[1]);
    game.report = { ...makeReport(entries[0]?.[1] || 0, Math.max(1, game.totalRounds), "心动值"), winnerId: entries[0]?.[0] || null, scores: game.scores };
  } else if (game.uiType === "relay") {
    game.report = makeReport(game.heartValue, game.totalRounds * 10, "爱心值");
  } else {
    game.report = makeReport(game.score, game.totalRounds, game.id === "heart-sync" ? "心动值" : "默契值");
  }
}

function revealSyncIfReady(room) {
  const game = room.game;
  const ids = room.players.map((item) => item.id);
  if (ids.length < 2 || !ids.every((id) => game.answers[id])) return;
  const values = ids.map((id) => game.answers[id]);
  const matched = values.every((value) => value === values[0]);
  game.combo = matched ? game.combo + 1 : 0;
  const add = matched ? 1 + Math.min(2, Math.floor(game.combo / 3)) : 0;
  game.score += add;
  const question = game.questions[game.round - 1];
  game.status = "revealing";
  game.revealed = { matched, answers: Object.fromEntries(ids.map((id) => [id, game.answers[id]])), comment: question.comment || (matched ? "你们真的很会选同一颗心。" : "这题差一点点，再来一局更甜。"), add };
  game.nextAt = now() + 2300;
}

async function handleApi(request, response, pathname) {
  try {
    if (request.method === "OPTIONS") return sendJson(response, 200, { ok: true });
    if (pathname === "/api/catalog") return sendJson(response, 200, { ok: true, categories, games });
    const body = request.method === "POST" ? await readBody(request) : {};
    if (pathname === "/api/create" && request.method === "POST") {
      const roomCode = makeCode();
      const host = makePlayer(body.nickname, true);
      const room = { code: roomCode, phase: "waiting", selectedGame: "compatibility-quest", selectedMode: "经典模式", selectedLevelId: "l2", players: [host], game: null, createdAt: now() };
      rooms.set(roomCode, room);
      return sendJson(response, 200, { ok: true, room: publicRoom(room), playerId: host.id });
    }
    if (pathname === "/api/join" && request.method === "POST") {
      const room = requireRoom(body.code);
      const existing = body.playerId ? currentPlayer(room, body.playerId) : null;
      if (existing) { existing.nickname = cleanNickname(body.nickname || existing.nickname); existing.onlineAt = now(); return sendJson(response, 200, { ok: true, room: publicRoom(room), playerId: existing.id }); }
      if (room.players.length >= 2) return sendJson(response, 400, { ok: false, error: "房间已经满员啦。" });
      if (room.phase !== "waiting") return sendJson(response, 400, { ok: false, error: "这局已经开始，请重新创建房间。" });
      const guest = makePlayer(body.nickname, false);
      room.players.push(guest);
      return sendJson(response, 200, { ok: true, room: publicRoom(room), playerId: guest.id });
    }
    if (pathname === "/api/room" && request.method === "GET") {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const room = requireRoom(url.searchParams.get("code"));
      touch(room, url.searchParams.get("playerId"));
      return sendJson(response, 200, { ok: true, room: publicRoom(room) });
    }
    if (pathname === "/api/select" && request.method === "POST") {
      const room = requireRoom(body.code);
      touch(room, body.playerId);
      requireHost(room, body.playerId);
      const config = getGame(body.gameId);
      if (room.phase === "playing") return sendJson(response, 400, { ok: false, error: "游戏进行中，不能切换游戏。" });
      room.selectedGame = config.id;
      room.selectedMode = body.mode || config.modes[0];
      room.selectedLevelId = body.levelId || config.levels[0].levelId;
      room.phase = "waiting";
      room.game = null;
      return sendJson(response, 200, { ok: true, room: publicRoom(room) });
    }
    if (pathname === "/api/start" && request.method === "POST") {
      const room = requireRoom(body.code);
      touch(room, body.playerId);
      requireHost(room, body.playerId);
      if (room.players.length < 2) return sendJson(response, 400, { ok: false, error: "需要两个人都进入房间后才能开始。" });
      const config = getGame(body.gameId || room.selectedGame);
      room.selectedGame = config.id;
      room.selectedMode = body.mode || room.selectedMode || config.modes[0];
      room.selectedLevelId = body.levelId || room.selectedLevelId || config.levels[0].levelId;
      room.phase = "playing";
      room.game = initGame(config.id, room, room.selectedMode, room.selectedLevelId);
      return sendJson(response, 200, { ok: true, room: publicRoom(room) });
    }
    if (pathname === "/api/action" && request.method === "POST") {
      const room = requireRoom(body.code);
      touch(room, body.playerId);
      if (!room.game || room.phase !== "playing") return sendJson(response, 400, { ok: false, error: "游戏还没有开始。" });
      applyAction(room, body);
      return sendJson(response, 200, { ok: true, room: publicRoom(room) });
    }
    if (pathname === "/api/leave" && request.method === "POST") {
      const room = requireRoom(body.code);
      room.players = room.players.filter((item) => item.id !== body.playerId);
      if (room.players.length === 0) rooms.delete(room.code);
      else { if (!room.players.some((item) => item.isHost)) room.players[0].isHost = true; room.phase = "waiting"; room.game = null; }
      return sendJson(response, 200, { ok: true });
    }
    return sendJson(response, 404, { ok: false, error: "没有找到这个接口。" });
  } catch (error) {
    return sendJson(response, error.status || 500, { ok: false, error: error.message || "服务器开小差了。" });
  }
}

function applyAction(room, body) {
  advanceRoom(room);
  const game = room.game;
  if (game.status === "ended") return;
  if (game.uiType === "sync-choice" && body.type === "answer" && game.status === "answering") {
    const question = game.questions[game.round - 1];
    if (question.options.includes(body.answer)) { game.answers[body.playerId] = body.answer; revealSyncIfReady(room); }
  }
  if (game.uiType === "guess") {
    const question = game.questions[game.round - 1];
    if (game.status === "answering" && body.playerId === game.answererId && question.options.includes(body.answer)) { game.answer = body.answer; game.status = "guessing"; }
    else if (game.status === "guessing" && body.playerId === game.guesserId && question.options.includes(body.guess)) {
      game.guess = body.guess;
      const matched = game.guess === game.answer;
      if (matched) game.score += 1;
      game.status = "revealing";
      game.revealed = { matched, answer: game.answer, guess: game.guess, answererId: game.answererId, guesserId: game.guesserId };
      game.nextAt = now() + 2400;
    }
  }
  if (game.uiType === "reaction" && body.type === "tap") {
    if (game.status === "waiting") { game.foulPlayerId = body.playerId; game.status = "revealing"; game.nextAt = now() + 1600; }
    else if (game.status === "clickable") { game.winnerId = body.playerId; game.scores[body.playerId] = (game.scores[body.playerId] || 0) + 1; game.status = "revealing"; game.nextAt = now() + 1600; }
  }
  if (game.uiType === "memory" && body.type === "flip" && body.playerId === game.turnPlayerId && !game.nextAt) {
    const card = game.cards[body.index];
    if (!card || card.matched || game.flipped.includes(body.index)) return;
    game.flipped.push(body.index);
    if (game.flipped.length === 2) {
      const [a, b] = game.flipped.map((index) => game.cards[index]);
      if (a.icon === b.icon) { a.matched = true; b.matched = true; game.matchedPairs += 1; game.scores[body.playerId] = (game.scores[body.playerId] || 0) + 1; game.lastReveal = "配对成功！"; game.flipped = []; if (game.matchedPairs * 2 >= game.cards.length) endGame(room); }
      else { game.lastReveal = "没有配对成功，换对方试试。"; game.nextAt = now() + 1200; }
    }
  }
  if (game.uiType === "wheel" && body.type === "spin" && body.playerId === game.turnPlayerId) {
    const segment = wheelSegments[Math.floor(Math.random() * wheelSegments.length)];
    const opponent = otherPlayer(room, body.playerId);
    if (segment.both) room.players.forEach((player) => { game.scores[player.id] = (game.scores[player.id] || 0) + segment.delta; });
    else { game.scores[body.playerId] = (game.scores[body.playerId] || 0) + segment.delta; if (segment.steal && opponent) game.scores[opponent.id] = Math.max(0, (game.scores[opponent.id] || 0) - segment.steal); }
    game.lastSpin = { playerId: body.playerId, ...segment };
    if (game.round >= game.totalRounds) endGame(room);
    else { game.round += 1; game.turnPlayerId = opponent?.id || body.playerId; }
  }
  if (game.uiType === "relay" && body.type === "tap") {
    if (body.playerId === game.requiredPlayerId) { game.combo += 1; game.heartValue += 10 + Math.min(20, game.combo); game.round += 1; game.requiredPlayerId = otherPlayer(room, body.playerId)?.id || body.playerId; }
    else { game.combo = 0; game.mistakes += 1; game.heartValue = Math.max(0, game.heartValue - 10); }
    if (game.round > game.totalRounds) endGame(room);
  }
}

function requireRoom(code) {
  const room = rooms.get(String(code || ""));
  if (!room) { const error = new Error("房间不存在，请重新创建或检查房间码。"); error.status = 404; throw error; }
  return room;
}
function requireHost(room, playerId) {
  const player = currentPlayer(room, playerId);
  if (!player || !player.isHost) { const error = new Error("只有房主可以操作这个按钮。"); error.status = 403; throw error; }
  return player;
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  if (url.pathname.startsWith("/api/")) { handleApi(request, response, url.pathname); return; }
  const urlPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.join(root, decodeURIComponent(urlPath));
  if (!filePath.startsWith(root)) { response.writeHead(403); response.end("禁止访问"); return; }
  fs.readFile(filePath, (error, data) => {
    if (error) { response.writeHead(404); response.end("页面不存在"); return; }
    response.writeHead(200, { "Content-Type": filePath.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream", "Cache-Control": "no-store" });
    response.end(data);
  });
});

server.listen(port, host, () => {
  console.log(`Couple game site running at http://${host}:${port}`);
});
