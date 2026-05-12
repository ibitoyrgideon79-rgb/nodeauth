import { pool } from '../config/db';

export interface PublicUser {
  id: number;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserRow {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

interface PublicUserRow {
  id: number;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createUser = async ({
  email,
  passwordHash
}: {
  email: string;
  passwordHash: string;
}): Promise<{ id: number; email: string }> => {
  const sql = 'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email';
  const result = await pool.query<{ id: number; email: string }>(sql, [email, passwordHash]);
  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<UserRow | null> => {
  const sql =
    'SELECT id, email, password_hash AS "passwordHash", created_at AS "createdAt" FROM users WHERE email = $1 LIMIT 1';
  const result = await pool.query<UserRow>(sql, [email]);
  return result.rows[0] || null;
};

export const findPublicUserById = async (id: string | number): Promise<PublicUser | null> => {
  const sql =
    'SELECT id, email, created_at AS "createdAt", updated_at AS "updatedAt" FROM users WHERE id = $1 LIMIT 1';
  const result = await pool.query<PublicUserRow>(sql, [id]);

  if (!result.rows[0]) return null;
  return {
    id: result.rows[0].id,
    email: result.rows[0].email,
    createdAt: result.rows[0].createdAt,
    updatedAt: result.rows[0].updatedAt
  };
};
