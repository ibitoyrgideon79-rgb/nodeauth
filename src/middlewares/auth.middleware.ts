import { NextFunction, Request, Response } from 'express';
import HttpError from '../utils/http-error';
import { verifyAccessToken } from '../utils/jwt';

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    next(new HttpError(401, 'Access denied. Missing Bearer token.'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub };
    next();
  } catch (_error) {
    next(new HttpError(401, 'Invalid or expired token.'));
  }
};
