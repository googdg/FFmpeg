import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
  };
}

export const auth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    // 验证访问令牌
    const payload = authService.verifyAccessToken(token);
    
    req.user = {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    // 验证访问令牌
    const payload = authService.verifyAccessToken(token);
    
    req.user = {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
    };
  } catch (error) {
    // 忽略可选认证的令牌错误
  }
  
  next();
};