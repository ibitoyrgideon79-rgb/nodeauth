import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import env from '../config/env';
import {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeAllActiveRefreshTokensForUser,
  revokeRefreshTokenByHash
} from '../models/refresh-token.model';
import HttpError from '../utils/http-error';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken
} from '../utils/jwt';
import {
  validateRefreshTokenInput,
  validateSigninInput,
  validateSignupInput
} from '../validators/auth.validator';
import { createUser, findPublicUserById, findUserByEmail } from '../models/user.model';

const getClientIp = (req: Request): string => req.ip || req.socket.remoteAddress || 'unknown';

export const signup = async (req: Request, res: Response): Promise<void> => {
  const validation = validateSignupInput(req.body || {});
  if (!validation.valid) {
    throw new HttpError(400, validation.message);
  }

  const existingUser = await findUserByEmail(validation.email);
  if (existingUser) {
    throw new HttpError(409, 'Email already registered.');
  }

  const passwordHash = await bcrypt.hash(validation.password, env.security.bcryptRounds);
  const user = await createUser({ email: validation.email, passwordHash });
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken();

  await createRefreshToken({
    userId: user.id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: getRefreshTokenExpiry(),
    createdByIp: getClientIp(req)
  });

  res.status(201).json({
    message: 'User created successfully.',
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email }
  });
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  const validation = validateSigninInput(req.body || {});
  if (!validation.valid) {
    throw new HttpError(400, validation.message);
  }

  const user = await findUserByEmail(validation.email);
  if (!user) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(validation.password, user.passwordHash);
  if (!isMatch) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken();

  await createRefreshToken({
    userId: user.id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: getRefreshTokenExpiry(),
    createdByIp: getClientIp(req)
  });

  res.status(200).json({
    message: 'Login successful.',
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email }
  });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const validation = validateRefreshTokenInput(req.body || {});
  if (!validation.valid) {
    throw new HttpError(400, validation.message);
  }

  const incomingTokenHash = hashRefreshToken(validation.refreshToken);
  const existingToken = await findRefreshTokenByHash(incomingTokenHash);
  if (!existingToken) {
    throw new HttpError(401, 'Invalid refresh token.');
  }

  const now = new Date();
  const isExpired = existingToken.expiresAt.getTime() <= now.getTime();
  const isRevoked = Boolean(existingToken.revokedAt);

  if (isRevoked || isExpired) {
    await revokeAllActiveRefreshTokensForUser(existingToken.userId, getClientIp(req));
    throw new HttpError(401, 'Invalid refresh token.');
  }

  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  await revokeRefreshTokenByHash({
    tokenHash: existingToken.tokenHash,
    revokedByIp: getClientIp(req),
    replacedByTokenHash: newRefreshTokenHash
  });

  await createRefreshToken({
    userId: existingToken.userId,
    tokenHash: newRefreshTokenHash,
    expiresAt: getRefreshTokenExpiry(),
    createdByIp: getClientIp(req)
  });

  const accessToken = generateAccessToken(existingToken.userId);

  res.status(200).json({
    message: 'Token refreshed successfully.',
    accessToken,
    refreshToken: newRefreshToken
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const validation = validateRefreshTokenInput(req.body || {});
  if (!validation.valid) {
    throw new HttpError(400, validation.message);
  }

  await revokeRefreshTokenByHash({
    tokenHash: hashRefreshToken(validation.refreshToken),
    revokedByIp: getClientIp(req)
  });

  res.status(200).json({ message: 'Logged out successfully.' });
};

export const dashboard = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth?.userId) {
    throw new HttpError(401, 'Unauthorized.');
  }

  const user = await findPublicUserById(req.auth.userId);
  if (!user) {
    throw new HttpError(404, 'User not found.');
  }

  res.status(200).json({
    message: 'Welcome to the protected dashboard!',
    user
  });
};
