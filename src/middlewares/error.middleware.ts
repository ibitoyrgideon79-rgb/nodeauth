import { NextFunction, Request, Response } from 'express';

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Route not found.' });
};

export const errorHandler = (
  err: { statusCode?: number; message?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = statusCode >= 500 ? 'Internal server error.' : err.message || 'Request failed.';

  res.status(statusCode).json({ error: message });
};

