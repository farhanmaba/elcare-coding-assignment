import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import caseRouter from './routes/case';
import stockRouter from './routes/stock';

const app = express();

dotenv.config();
const port = process.env.PORT || 3001;

app.use(express.json());

// Only allow our localhost @ port 3000
app.use(cors({ origin: 'http://localhost:3000' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routers
app.use('/api/case', caseRouter);
app.use('/api/stock', stockRouter);

app.listen(port, () => {
  console.log(`[server]: API is running at http://localhost:${port}`);
});