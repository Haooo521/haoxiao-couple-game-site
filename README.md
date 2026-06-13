# 豪豪和小糖豆的游戏网站

一个情侣一起玩的实时在线小游戏 MVP。首页标题为「豪豪和小糖豆的游戏网站」，副标题为「这是只属于我们的小游戏宇宙」。

## 技术栈

- 前端：Next.js + TypeScript + Tailwind CSS
- 实时服务：Node.js + Express + Socket.IO
- 状态存储：MVP 使用内存房间状态，后续可替换为 PostgreSQL
- 认证：昵称进入房间，不强制登录
- 部署：前端适合 Vercel，实时服务适合 Railway / Render / Fly.io

## 项目结构

```txt
app/                    Next.js App Router 页面
  page.tsx              首页、创建房间、加入房间
  room/page.tsx         房间等待页
  game/page.tsx         游戏页
  result/page.tsx       结果页
components/             通用 UI 组件
lib/                    Socket 客户端和本地 session
packages/shared/        前后端共享类型和游戏目录
server/src/             Socket.IO 实时服务
  games/                独立游戏模块
  rooms/                房间状态和房间事件
```

## 安装

```bash
npm install
```

复制环境变量：

```bash
cp .env.example .env.local
```

Windows PowerShell 可以手动复制 `.env.example` 为 `.env.local`。

## 启动前端

```bash
npm run dev:web
```

前端默认运行在 `http://localhost:3000`。

## 启动实时服务

```bash
npm run dev:server
```

实时服务默认运行在 `http://localhost:4000`，健康检查：

```bash
curl http://localhost:4000/health
```

也可以同时启动：

```bash
npm run dev
```

## 环境变量

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
```

部署时：

- Vercel 前端设置 `NEXT_PUBLIC_SOCKET_URL` 为实时服务公网地址
- Railway / Render / Fly.io 实时服务设置 `CLIENT_ORIGIN` 为 Vercel 域名

## 已实现功能

- 首页展示品牌、甜蜜背景、游戏列表
- 昵称创建房间
- 6 位房间码加入房间
- 房间最多 2 人
- 房间成员在线/重连状态
- 房主选择游戏并开始
- 断线重连：使用本地保存的 `playerId` 重新加入原房间
- 离开房间
- 三个 MVP 游戏：
  - 默契问答 Match Quiz
  - 反应抢答 Reaction Duel
  - 合作心动连线 Heart Sync

## 添加新游戏

1. 在 `packages/shared/types.ts` 扩展 `GameId`、`PublicGameState` 和 `GAME_CATALOG`。
2. 在 `server/src/games/` 下创建新模块。
3. 每个游戏模块都要实现：

```ts
initGame(context)
handlePlayerAction(playerId, action, context)
getPublicState(context)
endGame(context)
```

4. 在 `server/src/games/index.ts` 注册到 `gameRegistry`。
5. 在 `app/game/page.tsx` 添加对应的前端渲染组件。

## 基础错误处理

- 创建/加入房间使用 Socket.IO ack 返回明确错误
- 加入房间会校验 6 位房间码
- 房间满员会拒绝加入
- 非房主不能选择或开始游戏
- 游戏 action 会校验当前状态和玩家输入
- 服务端只广播公开游戏状态，未揭晓答案不会提前传给客户端

## 后续升级建议

- 使用 PostgreSQL + Prisma 保存房间、玩家和对局记录
- 增加登录账号和情侣空间
- 给房间增加观战/多人模式
- 为游戏引擎增加自动化测试和持久化回放
- 为移动端增加触感反馈和更细致的动画
