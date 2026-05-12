import app from './app';
import { pool } from './config/db';
import env from './config/env';
import { initDatabase } from './config/db';

const startServer = async (): Promise<void> => {
  try {
    await initDatabase();
    const server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
    });

    const shutdown = async (): Promise<void> => {
      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => {
      void shutdown();
    });

    process.on('SIGINT', () => {
      void shutdown();
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown startup error';
    console.error('Startup failed:', message);
    process.exit(1);
  }
};

void startServer();
