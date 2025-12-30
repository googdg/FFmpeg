const express = require('express');
const { body, validationResult } = require('express-validator');
const { asyncHandler, ValidationError } = require('../middleware/errorHandler');
const { authenticate, getClientInfo } = require('../middleware/auth');
const AuthService = require('../services/AuthService');
const User = require('../models/User');

const router = express.Router();

// 验证结果处理中间件
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    throw new ValidationError(errorMessages);
  }
  next();
};

// 用户注册
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['organizer', 'speaker', 'participant'])
    .withMessage('Invalid role'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { email, name, password, role, avatarUrl, bio } = req.body;
  const clientInfo = getClientInfo(req);

  const result = await AuthService.register({
    email,
    name,
    password,
    role,
    avatarUrl,
    bio
  }, clientInfo);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt
    }
  });
}));

// 用户登录
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const clientInfo = getClientInfo(req);

  const result = await AuthService.login(email, password, clientInfo);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt
    }
  });
}));

// 用户登出
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  await AuthService.logout(req.token);

  res.json({
    success: true,
    message: 'Logout successful',
    data: null
  });
}));

// 登出所有会话
router.post('/logout-all', authenticate, asyncHandler(async (req, res) => {
  await AuthService.logoutAll(req.user.id);

  res.json({
    success: true,
    message: 'All sessions logged out successfully',
    data: null
  });
}));

// 刷新令牌
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const clientInfo = getClientInfo(req);

  const result = await AuthService.refreshToken(refreshToken, clientInfo);

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt
    }
  });
}));

// 获取当前用户信息
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  // 获取完整的用户信息（包括权限）
  const user = await User.findById(req.user.id);
  const permissions = await user.getPermissions();

  res.json({
    success: true,
    message: 'User information retrieved successfully',
    data: {
      user: user.toJSON(),
      permissions
    }
  });
}));

// 更新当前用户信息
router.put('/me', authenticate, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { name, bio, avatarUrl, preferences } = req.body;
  
  const user = await User.findById(req.user.id);
  const updatedUser = await user.update({
    name,
    bio,
    avatarUrl,
    preferences
  });

  res.json({
    success: true,
    message: 'User information updated successfully',
    data: {
      user: updatedUser.toJSON()
    }
  });
}));

// 修改密码
router.put('/change-password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user.id);
  
  // 验证当前密码
  const isValidPassword = await user.verifyPassword(currentPassword);
  if (!isValidPassword) {
    throw new ValidationError('Current password is incorrect');
  }

  // 更新密码
  await user.update({ password: newPassword });

  res.json({
    success: true,
    message: 'Password changed successfully',
    data: null
  });
}));

// 获取用户会话列表
router.get('/sessions', authenticate, asyncHandler(async (req, res) => {
  const sessions = await AuthService.getUserSessions(req.user.id);

  res.json({
    success: true,
    message: 'User sessions retrieved successfully',
    data: {
      sessions
    }
  });
}));

// 撤销特定会话
router.delete('/sessions/:sessionId', authenticate, asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  
  await AuthService.revokeSession(req.user.id, sessionId);

  res.json({
    success: true,
    message: 'Session revoked successfully',
    data: null
  });
}));

// 验证令牌（用于客户端检查令牌有效性）
router.post('/verify', authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
}));

module.exports = router;