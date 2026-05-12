import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import env from './config/env';
import { globalApiLimiter } from './middlewares/rate-limit.middleware';
import authRoutes from './routes/auth.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', env.trustProxy);
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin || true,
    credentials: true
  })
);
app.use(express.json({ limit: '20kb' }));
app.use(globalApiLimiter);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
