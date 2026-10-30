const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const server = http.createServer((req, res) => {
  let pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  if (pathname === '/') pathname = '/index.html';
  const file = path.join(PUBLIC, pathname.replace(/^\/+/, ''));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(file);
    res.writeHead(200, {'Content-Type': ext === '.html' ? 'text/html; charset=utf-8' : 'application/octet-stream'});
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server, perMessageDeflate: false });
const players = new Map(); // Một phòng chung: tất cả kết nối vào cùng danh sách này.
let nextId = 1;
function send(ws, data) { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data)); }
function broadcast(data, except) {
  const raw = JSON.stringify(data);
  for (const client of wss.clients) if (client !== except && client.readyState === WebSocket.OPEN) client.send(raw);
}
function updateCount() { broadcast({type:'count', count:players.size}); }

wss.on('connection', ws => {
  ws.isAlive = true;
  ws.on('pong', () => ws.isAlive = true);
  ws.on('message', raw => {
    if (raw.length > 2048) return;
    let msg; try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (msg.type === 'join') {
      if (ws.playerId) return;
      const id = String(nextId++);
      const player = {
        id, name: String(msg.name || 'Khách chùa').slice(0, 20), gender: msg.gender === 'male' ? 'male' : 'female', outfit: ['ceremony','lam','brown','gold'].includes(msg.outfit) ? msg.outfit : 'ceremony',
        x: clamp(msg.x), z: clamp(msg.z), rot: 0
      };
      ws.playerId = id;
      players.set(id, player);
      send(ws, {type:'welcome', id, players:[...players.values()]});
      broadcast({type:'join', player}, ws);
      updateCount();
    } else if (msg.type === 'profile' && ws.playerId) {
      const p = players.get(ws.playerId); if (!p) return;
      p.name = String(msg.name || p.name).slice(0,20);
      p.gender = msg.gender === 'male' ? 'male' : 'female';
      p.outfit = ['ceremony','lam','brown','gold'].includes(msg.outfit) ? msg.outfit : 'ceremony';
      broadcast({type:'profile', player:p}, ws);
    } else if (msg.type === 'move' && ws.playerId) {
      const p = players.get(ws.playerId); if (!p) return;
      p.x = clamp(msg.x); p.z = clamp(msg.z);
      p.rot = Number.isFinite(msg.rot) ? msg.rot : 0;
      broadcast({type:'move', player:p}, ws);
    }
  });
  ws.on('close', () => {
    if (ws.playerId) { players.delete(ws.playerId); broadcast({type:'leave', id:ws.playerId}); updateCount(); }
  });
});
function clamp(v) { return Number.isFinite(v) ? Math.max(-78, Math.min(78, v)) : 0; }
const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false; ws.ping();
  }
}, 30000);
wss.on('close', () => clearInterval(heartbeat));
server.listen(PORT, '0.0.0.0', () => console.log(`Đi Chùa Online chạy tại port ${PORT}`));
