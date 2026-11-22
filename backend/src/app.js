import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
app.disable('x-powered-by');

// CORS is limited to the exact origin(s) configured in the environment.
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : false }));
app.use(express.json({ limit: '100kb' }));

// Health check intentionally does not touch the database.
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Warm (or create) the cached Mongoose connection for all other /api routes.
app.use('/api', (_req, _res, next) => {
  connectDB().then(() => next()).catch(next);
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
