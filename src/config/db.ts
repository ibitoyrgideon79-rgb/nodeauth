import { Pool, types } from 'pg';
import env from './env';

types.setTypeParser(20, (value) => parseInt(value, 10));

export const pool = new Pool(env.postgres);

export const initDatabase = async (): Promise<void> => {
  const createUsersTableSql = `
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  const createRefreshTokensTableSql = `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash CHAR(64) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_by_ip VARCHAR(45) DEFAULT NULL,
      revoked_at TIMESTAMPTZ DEFAULT NULL,
      revoked_by_ip VARCHAR(45) DEFAULT NULL,
      replaced_by_token_hash CHAR(64) DEFAULT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_refresh_tokens_token_hash UNIQUE (token_hash)
    );
  `;

  const createIndexesSql = `
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
  `;

  await pool.query(createUsersTableSql);
  await pool.query(createRefreshTokensTableSql);
  await pool.query(createIndexesSql);
};
