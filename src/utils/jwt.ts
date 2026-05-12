import { createHash, randomBytes } from 'crypto';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import env from '../config/env';
import HttpError from './http-error';

interface AccessTokenPayload extends JwtPayload {
  sub: string;
  tokenType: 'access';
}

export const generateAccessToken = (userId: string | number): string =>
  jwt.sign({ sub: String(userId), tokenType: 'access' }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn as SignOptions['expiresIn'],
    issuer: env.jwt.issuer,
    audience: env.jwt.audience,
    algorithm: 'HS256'
  });

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const payload = jwt.verify(token, env.jwt.accessSecret, {
    algorithms: ['HS256'],
    issuer: env.jwt.issuer,
    audience: env.jwt.audience
  });

  if (
    typeof payload === 'string' ||
    !payload.sub ||
    payload.tokenType !== 'access'
  ) {
    throw new HttpError(401, 'Invalid token payload.');
  }

  return payload as AccessTokenPayload;
};

export const generateRefreshToken = (): string => randomBytes(64).toString('hex');

export const hashRefreshToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export const getRefreshTokenExpiry = (): Date => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.jwt.refreshTtlDays);
  return expiresAt;
};
