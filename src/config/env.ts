import dotenv from 'dotenv';

dotenv.config();

const requiredVars = [
  'SUPABASE_DB_URL',
  'JWT_ACCESS_SECRET',
  'JWT_ISSUER',
  'JWT_AUDIENCE'
] as const;

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  trustProxy: process.env.TRUST_PROXY === 'true',
  corsOrigin: process.env.CORS_ORIGIN || '',
  postgres: {
    connectionString: process.env.SUPABASE_DB_URL as string,
    ssl: process.env.SUPABASE_DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    max: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 10000),
    connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000)
  },
  security: {
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12)
  },
  jwt: {
    issuer: process.env.JWT_ISSUER as string,
    audience: process.env.JWT_AUDIENCE as string,
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7)
  }
};

if (!Number.isInteger(env.security.bcryptRounds) || env.security.bcryptRounds < 10) {
  throw new Error('BCRYPT_ROUNDS must be an integer >= 10.');
}

if (!Number.isInteger(env.jwt.refreshTtlDays) || env.jwt.refreshTtlDays < 1) {
  throw new Error('REFRESH_TOKEN_TTL_DAYS must be an integer >= 1.');
}

if (!Number.isInteger(env.postgres.max) || env.postgres.max < 1) {
  throw new Error('DB_POOL_MAX must be an integer >= 1.');
}

export default env;
