const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { WebSocketServer } = require('ws');
const auth = require('./auth_db');

const PORT = process.env.SYNC_PORT || 8082;
const WEB_DIR = path.resolve(__dirname, '../web');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

// HTTP Server for Auth REST API + WebSocket Upgrade
const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    // Helper to read JSON body
    function readBody(cb) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const json = body ? JSON.parse(body) : {};
                cb(null, json);
            } catch (err) {
                cb(err);
            }
        });
    }

    function sendJson(status, data) {
        res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
    }

    // 1. Register API
    if (pathname === '/api/register' && req.method === 'POST') {
        readBody(async (err, body) => {
            if (err) return sendJson(400, { error: '無效的 JSON 請求' });
            try {
                const user = await auth.register(body.username, body.password);
                sendJson(200, { success: true, user });
            } catch (e) {
                sendJson(400, { error: e.message });
            }
        });
        return;
    }

    // 2. Login API
    if (pathname === '/api/login' && req.method === 'POST') {
        readBody(async (err, body) => {
            if (err) return sendJson(400, { error: '無效的 JSON 請求' });
            try {
                const user = await auth.login(body.username, body.password);
                sendJson(200, { success: true, user: { id: user.id, username: user.username, role: user.role }, saveData: user.saveData });
            } catch (e) {
                sendJson(400, { error: e.message });
            }
        });
        return;
    }

    // 3. Save Data Sync API
    if (pathname === '/api/save' && req.method === 'POST') {
        readBody(async (err, body) => {
            if (err) return sendJson(400, { error: '無效的 JSON 請求' });
            if (!body.userId) return sendJson(401, { error: '未授權' });
            try {
                await auth.updateSave(body.userId, body.saveData);
                sendJson(200, { success: true });
            } catch (e) {
                sendJson(500, { error: e.message });
            }
        });
        return;
    }

    if (pathname === '/api/save' && req.method === 'GET') {
        const userId = parsedUrl.searchParams.get('userId');
        if (!userId) return sendJson(401, { error: '未授權' });
        auth.getSave(userId)
            .then(data => sendJson(200, { success: true, saveData: data }))
            .catch(e => sendJson(500, { error: e.message }));
        return;
    }

    // Serve static files from ../web
    let reqPath = decodeURIComponent(pathname);
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(WEB_DIR, reqPath);
    if (!filePath.startsWith(WEB_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            sendJson(404, { error: 'Not Found' });
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const acceptEncoding = req.headers['accept-encoding'] || '';
        const shouldGzip = /\bgzip\b/.test(acceptEncoding) && /\.(html|js|css|json|svg)$/.test(ext);
        if (shouldGzip) {
            res.writeHead(200, { 'Content-Type': contentType, 'Content-Encoding': 'gzip' });
            fs.createReadStream(filePath).pipe(zlib.createGzip()).pipe(res);
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(filePath).pipe(res);
        }
    });
});

// WebSocket Server attached to same HTTP Server
const wss = new WebSocketServer({ server });

// rooms: roomCode -> { hostWs, lastState, clients: Map(ws -> { username, role }) }
const rooms = new Map();

function getRoomMembers(roomCode) {
    const r = rooms.get(roomCode);
    if (!r) return [];
    const members = [];
    for (const [ws, info] of r.clients.entries()) {
        if (ws.readyState === 1) {
            members.push({
                username: info.username || '匿名玩家',
                role: info.role || 'user'
            });
        }
    }
    return members;
}

wss.on('connection', (ws) => {
    let currentRoom = null;
    let isHost = false;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === 'ping') {
                ws.send(JSON.stringify({ type: 'pong' }));
                return;
            }
            if (data.type === 'ping') {
                ws.send(JSON.stringify({ type: 'pong' }));
                return;
            }
            
            if (data.type === 'create') {
                const roomCode = String(data.room || Math.floor(1000 + Math.random() * 9000));
                currentRoom = roomCode;
                isHost = true;
                
                const userInfo = { username: data.user || 'Admin', role: data.role || 'admin' };
                if (!rooms.has(roomCode)) {
                    const clientMap = new Map();
                    clientMap.set(ws, userInfo);
                    rooms.set(roomCode, {
                        hostWs: ws,
                        lastState: data.state || null,
                        clients: clientMap
                    });
                } else {
                    const r = rooms.get(roomCode);
                    r.hostWs = ws;
                    r.clients.set(ws, userInfo);
                    if (data.state) r.lastState = data.state;
                }

                ws.send(JSON.stringify({
                    type: 'created',
                    room: roomCode,
                    isHost: true,
                    memberCount: rooms.get(roomCode).clients.size, members: getRoomMembers(roomCode)
                }));
                console.log(`[Room ${roomCode}] Host connected.`);
            }
            
            else if (data.type === 'join') {
                const roomCode = String(data.room).trim();
                currentRoom = roomCode;
                isHost = false;

                const userInfo = { username: data.user || '匿名玩家', role: data.role || 'user' };
                if (!rooms.has(roomCode)) {
                    const clientMap = new Map();
                    clientMap.set(ws, userInfo);
                    rooms.set(roomCode, {
                        hostWs: null,
                        lastState: null,
                        clients: clientMap
                    });
                } else {
                    rooms.get(roomCode).clients.set(ws, userInfo);
                }

                const r = rooms.get(roomCode);
                ws.send(JSON.stringify({
                    type: 'joined',
                    room: roomCode,
                    isHost: (r.hostWs === ws),
                    state: r.lastState,
                    memberCount: r.clients.size, members: getRoomMembers(roomCode)
                }));

                broadcast(roomCode, {
                    type: 'member_update',
                    memberCount: r.clients.size,
                    members: getRoomMembers(roomCode)
                });
                console.log(`[Room ${roomCode}] Client joined (total: ${r.clients.size}).`);
            }

            else if (data.type === 'sync' && currentRoom) {
                const r = rooms.get(currentRoom);
                if (r) {
                    r.lastState = data.state;
                    console.log(`[Room ${currentRoom}] Syncing state to ${r.clients.size - 1} peers:`, data.state);
                    for (const client of r.clients.keys()) {
                        if (client !== ws && client.readyState === 1) {
                            client.send(JSON.stringify({
                                type: 'sync',
                                state: data.state
                            }));
                        }
                    }
                }
            }

            else if (data.type === 'chat' && currentRoom) {
                // Broadcast chat message to everyone in the room (including sender)
                broadcast(currentRoom, {
                    type: 'chat',
                    user: data.user || '冒險者',
                    role: data.role || 'user',
                    text: data.text,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }
        } catch (err) {
            console.error('Error handling ws message:', err);
        }
    });

    ws.on('close', () => {
        if (currentRoom && rooms.has(currentRoom)) {
            const r = rooms.get(currentRoom);
            r.clients.delete(ws);
            if (r.hostWs === ws) {
                r.hostWs = null;
                broadcast(currentRoom, { type: 'host_left' });
            }
            if (r.clients.size === 0) {
                rooms.delete(currentRoom);
                console.log(`[Room ${currentRoom}] Cleaned up empty room.`);
            } else {
                broadcast(currentRoom, {
                    type: 'member_update',
                    memberCount: r.clients.size,
                    members: getRoomMembers(currentRoom)
                });
            }
        }
    });
});

function broadcast(roomCode, msgObj) {
    const r = rooms.get(roomCode);
    if (!r) return;
    const str = JSON.stringify(msgObj);
    for (const c of r.clients.keys()) {
        if (c.readyState === 1) c.send(str);
    }
}

server.listen(PORT, () => {
    console.log(`Unified Auth & Sync server running on port ${PORT}`);
});
