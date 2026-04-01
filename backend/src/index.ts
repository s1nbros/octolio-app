import express from 'express';
import cors from 'cors';
import { initDb } from './db';
import { authRouter } from './routes/auth';
import { modulesRouter } from './routes/modules';
import { progressRouter } from './routes/progress';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json());

initDb();

app.use('/api/auth', authRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/progress', progressRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Octolio backend running on http://localhost:${PORT}`);
});
