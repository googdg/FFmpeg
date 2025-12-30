const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { asyncHandler, ValidationError } = require('../middleware/errorHandler');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
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

// 获取用户列表（需要管理员或组织者权限）
router.get('/', authenticate, requirePermission('user.list'), [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(['admin', 'organizer', 'speaker', 'participant'])
    .withMessage('Invalid role'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term must not be empty'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;

  const result = await User.findAll({
    page: parseInt(page),
    limit: parseInt(limit),
    role,
    search
  });

  res.json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users: result.users.map(user => user.toJSON()),
      pagination: result.pagination
    }
  });
}));

// 创建新用户（需要管理员权限）
router.post('/', authenticate, requirePermission('user.create'), [
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
    .isIn(['admin', 'organizer', 'speaker', 'participant'])
    .withMessage('Invalid role'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { email, name, password, role, bio, avatarUrl } = req.body;

  const user = await User.create({
    email,
    name,
    password,
    role,
    bio,
    avatarUrl
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      user: user.toJSON()
    }
  });
}));

// 获取用户详情
router.get('/:id', authenticate, requirePermission('user.read'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      data: null
    });
  }

  // 获取用户权限
  const permissions = await user.getPermissions();

  res.json({
    success: true,
    message: 'User retrieved successfully',
    data: {
      user: user.toJSON(),
      permissions
    }
  });
}));

// 更新用户信息
router.put('/:id', authenticate, requirePermission('user.update'), [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'organizer', 'speaker', 'participant'])
    .withMessage('Invalid role'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, role, bio, avatarUrl, isActive } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      data: null
    });
  }

  // 防止用户修改自己的角色（除非是管理员）
  if (role && req.user.id === id && req.user.role !== 'admin') {
    throw new ValidationError('Cannot change your own role');
  }

  const updatedUser = await user.update({
    name,
    role,
    bio,
    avatarUrl,
    isActive
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: updatedUser.toJSON()
    }
  });
}));

// 删除用户（软删除）
router.delete('/:id', authenticate, requirePermission('user.delete'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 防止用户删除自己
  if (req.user.id === id) {
    throw new ValidationError('Cannot delete your own account');
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      data: null
    });
  }

  await user.delete();

  res.json({
    success: true,
    message: 'User deleted successfully',
    data: null
  });
}));

// 重置用户密码（需要管理员权限）
router.post('/:id/reset-password', authenticate, requirePermission('user.update'), [
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      data: null
    });
  }

  await user.update({ password: newPassword });

  res.json({
    success: true,
    message: 'Password reset successfully',
    data: null
  });
}));

// 获取用户统计信息（需要管理员权限）
router.get('/stats/overview', authenticate, requirePermission('system.monitor'), asyncHandler(async (req, res) => {
  // 获取用户统计信息
  const statsQuery = `
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
      COUNT(CASE WHEN role = 'organizer' THEN 1 END) as organizer_count,
      COUNT(CASE WHEN role = 'speaker' THEN 1 END) as speaker_count,
      COUNT(CASE WHEN role = 'participant' THEN 1 END) as participant_count,
      COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
      COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d
    FROM users
  `;

  const { query } = require('../config/database');
  const result = await query(statsQuery);
  const stats = result.rows[0];

  // 转换字符串数字为整数
  Object.keys(stats).forEach(key => {
    stats[key] = parseInt(stats[key]);
  });

  res.json({
    success: true,
    message: 'User statistics retrieved successfully',
    data: {
      stats
    }
  });
}));

// 获取用户活动日志（需要管理员权限）
router.get('/:id/activity', authenticate, requirePermission('user.read'), [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      data: null
    });
  }

  // 获取用户登录日志
  const { query } = require('../config/database');
  const logsResult = await query(`
    SELECT ip_address, user_agent, login_success, failure_reason, created_at
    FROM user_login_logs
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `, [id, limit, offset]);

  const countResult = await query(`
    SELECT COUNT(*) FROM user_login_logs WHERE user_id = $1
  `, [id]);

  const total = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    message: 'User activity retrieved successfully',
    data: {
      logs: logsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

module.exports = router;