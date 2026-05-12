const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email: unknown): string => String(email || '').trim().toLowerCase();

interface ValidationError {
  valid: false;
  message: string;
}

interface ValidationSuccess {
  valid: true;
  email: string;
  password: string;
}

type ValidationResult = ValidationError | ValidationSuccess;

export const validateSignupInput = (payload: {
  email?: unknown;
  password?: unknown;
}): ValidationResult => {
  const safeEmail = normalizeEmail(payload.email);
  const safePassword = String(payload.password || '');

  if (!safeEmail || !safePassword) {
    return { valid: false, message: 'Email and password are required.' };
  }

  if (!emailRegex.test(safeEmail)) {
    return { valid: false, message: 'Invalid email format.' };
  }

  if (safePassword.length < 12 || safePassword.length > 72) {
    return { valid: false, message: 'Password must be between 12 and 72 characters.' };
  }

  return { valid: true, email: safeEmail, password: safePassword };
};

export const validateSigninInput = (payload: {
  email?: unknown;
  password?: unknown;
}): ValidationResult => {
  const safeEmail = normalizeEmail(payload.email);
  const safePassword = String(payload.password || '');

  if (!safeEmail || !safePassword) {
    return { valid: false, message: 'Email and password are required.' };
  }

  if (!emailRegex.test(safeEmail)) {
    return { valid: false, message: 'Invalid email or password.' };
  }

  return { valid: true, email: safeEmail, password: safePassword };
};

export const validateRefreshTokenInput = (payload: { refreshToken?: unknown }) => {
  const refreshToken = String(payload.refreshToken || '').trim();
  if (!refreshToken) {
    return { valid: false as const, message: 'Refresh token is required.' };
  }

  return { valid: true as const, refreshToken };
};

export { normalizeEmail };
