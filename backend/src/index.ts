import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React frontend can request resources from this server
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Track start time for uptime calculation
const startTime = new Date();

// Health/Status API Endpoint
app.get('/api/status', (req: Request, res: Response) => {
  const uptimeMs = Date.now() - startTime.getTime();
  const seconds = Math.floor((uptimeMs / 1000) % 60);
  const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
  const hours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

  let uptimeString = '';
  if (days > 0) uptimeString += `${days}d `;
  if (hours > 0) uptimeString += `${hours}h `;
  if (minutes > 0) uptimeString += `${minutes}m `;
  uptimeString += `${seconds}s`;

  res.json({
    status: 'online',
    message: 'Express server is active and connected to Anvaya client!',
    uptime: uptimeString,
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Hello World example endpoint
app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the Node.js backend!' });
});

// Default fallback route
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
