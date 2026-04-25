import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initDb } from './db';
import { authRouter } from './routes/auth';
import { modulesRouter } from './routes/modules';
import { progressRouter } from './routes/progress';
import { stripeRouter, stripeWebhookHandler } from './routes/stripe';
import { generateRouter } from './routes/generate';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:4173', 'https://octolio-app.vercel.app'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Stripe webhook needs raw body — must be registered BEFORE express.json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/progress', progressRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/generate', generateRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend static build if it exists (local dev)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Octolio backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
