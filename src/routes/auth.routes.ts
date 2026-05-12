import { Router } from 'express';
import { dashboard, logout, refresh, signin, signup } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rate-limit.middleware';
import asyncHandler from '../utils/async-handler';

const router = Router();

router.post('/signup', authLimiter, asyncHandler(signup));
router.post('/signin', authLimiter, asyncHandler(signin));
router.post('/refresh', authLimiter, asyncHandler(refresh));
router.post('/logout', authLimiter, asyncHandler(logout));
router.get('/dashboard', requireAuth, asyncHandler(dashboard));

export default router;
