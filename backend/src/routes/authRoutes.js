const router = require('express').Router();
const { rateLimit } = require('express-rate-limit');
const c = require('../controllers/authController');
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ ok: false, message: 'Demasiados intentos. Intenta más tarde.', errors: [] }) });
router.post('/register', limiter, c.register); router.post('/login', limiter, c.login);
router.get('/me', require('../middlewares/authMiddleware'), c.me);
module.exports = router;
