import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/api.js';
import { getConfig } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API routes
app.use('/api', apiRouter);

// Serve static frontend files
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback for React SPA router
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/ws')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// WebSocket clients
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'connected', time: new Date().toISOString() }));

  ws.on('close', () => {
    clients.delete(ws);
  });
});

export function broadcast(type: string, data?: any) {
  const payload = JSON.stringify({ type, data });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

const config = getConfig();
const PORT = process.env.PORT || config.port || 4005;

server.listen(PORT, () => {
  console.log(`[DFL TikTok Gaming Suite] Running on http://0.0.0.0:${PORT}`);
});
