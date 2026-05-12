import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';

export interface PublicUser {
  id: number;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

interface PublicUserRow extends RowDataPacket {
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
  const sql = 'INSERT INTO users (email, password_hash) VALUES (?, ?)';
  const [result] = await pool.execute<ResultSetHeader>(sql, [email, passwordHash]);
  return { id: result.insertId, email };
};

export const findUserByEmail = async (email: string): Promise<UserRow | null> => {
  const sql =
    'SELECT id, email, password_hash AS passwordHash, created_at AS createdAt FROM users WHERE email = ? LIMIT 1';
  const [rows] = await pool.execute<UserRow[]>(sql, [email]);
  return rows[0] || null;
};

export const findPublicUserById = async (id: string | number): Promise<PublicUser | null> => {
  const sql =
    'SELECT id, email, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ? LIMIT 1';
  const [rows] = await pool.execute<PublicUserRow[]>(sql, [id]);

  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    email: rows[0].email,
    createdAt: rows[0].createdAt,
    updatedAt: rows[0].updatedAt
  };
};

