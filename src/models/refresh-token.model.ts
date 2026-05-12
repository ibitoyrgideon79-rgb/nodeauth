import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/db';

interface RefreshTokenRow extends RowDataPacket {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export const createRefreshToken = async (params: {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  createdByIp?: string | null;
}): Promise<void> => {
  const sql = `
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_by_ip)
    VALUES (?, ?, ?, ?)
  `;
  await pool.execute(sql, [params.userId, params.tokenHash, params.expiresAt, params.createdByIp || null]);
};

export const findRefreshTokenByHash = async (tokenHash: string): Promise<RefreshTokenRow | null> => {
  const sql = `
    SELECT
      id,
      user_id AS userId,
      token_hash AS tokenHash,
      expires_at AS expiresAt,
      revoked_at AS revokedAt
    FROM refresh_tokens
    WHERE token_hash = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute<RefreshTokenRow[]>(sql, [tokenHash]);
  return rows[0] || null;
};

export const revokeRefreshTokenByHash = async (params: {
  tokenHash: string;
  revokedByIp?: string | null;
  replacedByTokenHash?: string | null;
}): Promise<void> => {
  const sql = `
    UPDATE refresh_tokens
    SET
      revoked_at = UTC_TIMESTAMP(),
      revoked_by_ip = ?,
      replaced_by_token_hash = COALESCE(?, replaced_by_token_hash)
    WHERE token_hash = ?
      AND revoked_at IS NULL
  `;
  await pool.execute(sql, [params.revokedByIp || null, params.replacedByTokenHash || null, params.tokenHash]);
};

export const revokeAllActiveRefreshTokensForUser = async (
  userId: number,
  revokedByIp?: string | null
): Promise<void> => {
  const sql = `
    UPDATE refresh_tokens
    SET revoked_at = UTC_TIMESTAMP(), revoked_by_ip = ?
    WHERE user_id = ?
      AND revoked_at IS NULL
      AND expires_at > UTC_TIMESTAMP()
  `;
  await pool.execute<ResultSetHeader>(sql, [revokedByIp || null, userId]);
};

