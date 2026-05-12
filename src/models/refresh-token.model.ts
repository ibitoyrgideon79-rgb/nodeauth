import { pool } from '../config/db';

interface RefreshTokenRow {
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
    VALUES ($1, $2, $3, $4)
  `;
  await pool.query(sql, [params.userId, params.tokenHash, params.expiresAt, params.createdByIp || null]);
};

export const findRefreshTokenByHash = async (tokenHash: string): Promise<RefreshTokenRow | null> => {
  const sql = `
    SELECT
      id,
      user_id AS "userId",
      token_hash AS "tokenHash",
      expires_at AS "expiresAt",
      revoked_at AS "revokedAt"
    FROM refresh_tokens
    WHERE token_hash = $1
    LIMIT 1
  `;
  const result = await pool.query<RefreshTokenRow>(sql, [tokenHash]);
  return result.rows[0] || null;
};

export const revokeRefreshTokenByHash = async (params: {
  tokenHash: string;
  revokedByIp?: string | null;
  replacedByTokenHash?: string | null;
}): Promise<void> => {
  const sql = `
    UPDATE refresh_tokens
    SET
      revoked_at = NOW(),
      revoked_by_ip = $1,
      replaced_by_token_hash = COALESCE($2, replaced_by_token_hash)
    WHERE token_hash = $3
      AND revoked_at IS NULL
  `;
  await pool.query(sql, [params.revokedByIp || null, params.replacedByTokenHash || null, params.tokenHash]);
};

export const revokeAllActiveRefreshTokensForUser = async (
  userId: number,
  revokedByIp?: string | null
): Promise<void> => {
  const sql = `
    UPDATE refresh_tokens
    SET revoked_at = NOW(), revoked_by_ip = $1
    WHERE user_id = $2
      AND revoked_at IS NULL
      AND expires_at > NOW()
  `;
  await pool.query(sql, [revokedByIp || null, userId]);
};
