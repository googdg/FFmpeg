import express from 'express';
import Joi from 'joi';
import { authService } from '../services/AuthService';
import { auth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// 验证模式
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  username: Joi.string().alphanum().min(3).max(20).required().messages({
    'string.alphanum': 'Username can only contain letters and numbers',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must be less than 20 characters long',
    'any.required': 'Username is required'
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must be less than 128 characters long',
    'any.required': 'Password is required'
  }),
  native_language: Joi.string().default('zh-CN'),
  learning_language: Joi.string().default('en')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required'
  })
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Verification token is required'
  })
});

const passwordResetRequestSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

const passwordResetSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must be less than 128 characters long',
    'any.required': 'Password is required'
  })
});

// 用户注册
router.post('/register', async (req, res, next): Promise<void> => {
  try {
    // 验证请求数据
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    // 注册用户
    const result = await authService.register(value);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Registration successful'
    });
  } catch (error) {
    next(error);
  }
});

// 用户登录
router.post('/login', async (req, res, next): Promise<void> => {
  try {
    // 验证请求数据
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    // 用户登录
    const tokens = await authService.login(value);

    res.json({
      success: true,
      data: tokens,
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
});

// 刷新令牌
router.post('/refresh', async (req, res, next): Promise<void> => {
  try {
    // 验证请求数据
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    // 刷新令牌
    const tokens = await authService.refreshToken(value.refreshToken);

    res.json({
      success: true,
      data: tokens,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// 用户登出
router.post('/logout', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    await authService.logout(req.user!.userId);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
});

// 获取当前用户信息
router.get('/me', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user!.userId);

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// 验证邮箱
router.post('/verify-email', async (req, res, next): Promise<void> => {
  try {
    // 验证请求数据
    const { error, value } = verifyEmailSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    // 验证邮箱
    const result = await authService.verifyEmail(value.token);

    res.json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

// 请求密码重置
router.post('/forgot-password', async (req, res, next): Promise<void> => {
  try {
    // 验证请求数据
    const { error, value } = passwordResetRequestSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    // 请求密码重置
    const result = await authService.requestPasswordReset(value.email);

    res.json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

// 重置密码
router.post('/reset-password', async (req, res, next): Promise<void> => {
  try {
    // 验证请求数据
    const { error, value } = passwordResetSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    // 重置密码
    const result = await authService.resetPassword(value.token, value.password);

    res.json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

export default router;