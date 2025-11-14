const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../../controllers/authentication/authController');
const { authenticate } = require('../../middleware/authMiddleware');

router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Tên không được để trống')
      .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email không được để trống')
      .isEmail().withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Mật khẩu không được để trống')
      .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[0-9]{10}$/).withMessage('Số điện thoại không hợp lệ')
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email không được để trống')
      .isEmail().withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Mật khẩu không được để trống')
  ],
  authController.login
);

router.get('/verify', authController.verifyEmail);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
// // === ROUTER ===
// const authRouter = (req, res) => {
//     const { url, method } = req;

//     if (url === '/api/v1/auth/login' && method === 'POST') return login(req, res);
//     if (url === '/api/v1/auth/register' && method === 'POST') return register(req, res);
//     if (url === '/api/v1/auth/logout' && method === 'POST') return logout(req, res);
//     if (url === '/api/v1/auth/forgot-password' && method === 'POST') return forgotPassword(req, res);
//     if (url === '/api/v1/auth/reset-password' && method === 'POST') return resetPassword(req, res);
//     if (url.startsWith('/api/v1/auth/verify-email') && method === 'GET') return verifyEmail(req, res);

//     sendJson(res, 404, { message: 'Not Found' });
// };

// module.exports = authRouter;