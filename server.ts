import 'dotenv/config';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { app } from './server/app';

const PORT = 3000;

async function startServer() {
  const mainApp = express();

  // Express API routes and webhooks must run FIRST
  mainApp.use(app);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    mainApp.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    mainApp.use(express.static(distPath));
    mainApp.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  mainApp.listen(PORT, '0.0.0.0', () => {
    console.log(`[Zain Automation SaaS] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
