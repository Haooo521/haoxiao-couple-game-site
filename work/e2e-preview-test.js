const { spawn } = require("child_process");

const node = process.execPath;
const port = 5199;
const base = `http://127.0.0.1:${port}`;
const server = spawn(node, ["work/static-server.js"], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"]
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

async function room(code, playerId) {
  const response = await fetch(`${base}/api/room?code=${code}&playerId=${encodeURIComponent(playerId)}`);
  const json = await response.json();
  if (!json.ok) throw new Error(`/api/room: ${json.error}`);
  return json.room;
}

async function run() {
  await wait(500);

  async function createPair() {
    const created = await api("/api/create", { nickname: "Host" });
    const code = created.room.code;
    const hostId = created.playerId;
    const joined = await api("/api/join", { code, nickname: "Guest" });
    const guestId = joined.playerId;
    const current = await room(code, hostId);
    if (current.players.length !== 2) throw new Error("join failed");
    return { code, hostId, guestId };
  }

  let pair = await createPair();
  let code = pair.code;
  let hostId = pair.hostId;
  let guestId = pair.guestId;
  await api("/api/select", { code, playerId: hostId, gameId: "match-quiz" });
  await api("/api/start", { code, playerId: hostId, gameId: "match-quiz" });
  let current = await room(code, hostId);
  const firstAnswer = current.game.questions[0].options[0];
  await api("/api/action", { code, playerId: hostId, type: "answer", answer: firstAnswer });
  await api("/api/action", { code, playerId: guestId, type: "answer", answer: firstAnswer });
  current = await room(code, hostId);
  if (current.game.status !== "revealing") throw new Error("match reveal failed");

  pair = await createPair();
  code = pair.code;
  hostId = pair.hostId;
  guestId = pair.guestId;
  await api("/api/select", { code, playerId: hostId, gameId: "reaction-duel" });
  await api("/api/start", { code, playerId: hostId, gameId: "reaction-duel" });
  current = await room(code, hostId);
  await wait(Math.max(0, current.game.readyAt - Date.now()) + 100);
  await room(code, hostId);
  await api("/api/action", { code, playerId: guestId, type: "tap" });
  current = await room(code, hostId);
  if (current.game.status !== "revealing") throw new Error("reaction tap failed");

  pair = await createPair();
  code = pair.code;
  hostId = pair.hostId;
  guestId = pair.guestId;
  await api("/api/select", { code, playerId: hostId, gameId: "heart-sync" });
  await api("/api/start", { code, playerId: hostId, gameId: "heart-sync" });
  current = await room(code, hostId);
  const target = current.game.questions[0].options[0];
  await api("/api/action", { code, playerId: hostId, type: "answer", answer: target });
  await api("/api/action", { code, playerId: guestId, type: "answer", answer: target });
  current = await room(code, hostId);
  if (current.game.status !== "revealing") throw new Error("heart reveal failed");

  console.log("preview e2e ok");
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    server.kill();
  });
