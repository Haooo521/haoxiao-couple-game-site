const { spawn } = require("child_process");

const port = 5201;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["work/static-server.js"], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "ignore", "ignore"]
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api(path, body) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body || {})
  });
  const json = await response.json();
  if (!json.ok) throw new Error(`${path}: ${json.error}`);
  return json;
}

async function getRoom(code, playerId) {
  const response = await fetch(`${base}/api/room?code=${code}&playerId=${encodeURIComponent(playerId)}`);
  const json = await response.json();
  if (!json.ok) throw new Error(`/api/room: ${json.error}`);
  return json.room;
}

async function createPair() {
  const created = await api("/api/create", { nickname: "豪豪" });
  const joined = await api("/api/join", { code: created.room.code, nickname: "小糖豆" });
  return { code: created.room.code, hostId: created.playerId, guestId: joined.playerId };
}

async function runGame(gameId) {
  const { code, hostId, guestId } = await createPair();
  await api("/api/select", { code, playerId: hostId, gameId });
  await api("/api/start", { code, playerId: hostId, gameId });
  let room = await getRoom(code, hostId);
  const game = room.game;

  if (game.uiType === "sync-choice") {
    const answer = game.questions[0].options[0];
    await api("/api/action", { code, playerId: hostId, type: "answer", answer });
    await api("/api/action", { code, playerId: guestId, type: "answer", answer });
  } else if (game.uiType === "guess") {
    const answer = game.questions[0].options[0];
    const guess = answer;
    await api("/api/action", { code, playerId: game.answererId, type: "answer", answer });
    await api("/api/action", { code, playerId: game.guesserId, type: "guess", guess });
  } else if (game.uiType === "reaction") {
    await wait(Math.max(0, game.readyAt - Date.now()) + 120);
    await getRoom(code, hostId);
    await api("/api/action", { code, playerId: guestId, type: "tap" });
  } else if (game.uiType === "memory") {
    const first = game.cards[0];
    const matchIndex = game.cards.findIndex((card, index) => index !== 0 && card.icon === first.icon);
    await api("/api/action", { code, playerId: game.turnPlayerId, type: "flip", index: 0 });
    await api("/api/action", { code, playerId: game.turnPlayerId, type: "flip", index: matchIndex });
  } else if (game.uiType === "wheel") {
    await api("/api/action", { code, playerId: game.turnPlayerId, type: "spin" });
  } else if (game.uiType === "relay") {
    await api("/api/action", { code, playerId: game.requiredPlayerId, type: "tap" });
  }

  room = await getRoom(code, hostId);
  if (!room.game) throw new Error(`${gameId}: game missing after action`);
}

async function main() {
  await wait(500);
  const catalog = await (await fetch(`${base}/api/catalog`)).json();
  for (const game of catalog.games) {
    await runGame(game.id);
  }
  console.log("all games smoke ok");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => server.kill());
