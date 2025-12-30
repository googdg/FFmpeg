const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/database');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class User {
  constructor(data = {}) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.passwordHash = data.password_hash;
    this.role = data.role || 'participant';
    this.avatarUrl = data.avatar_url;
    this.bio = data.bio;
    this.preferences = data.preferences || {};
    this.emailVerified = data.email_verified || false;
    this.emailVerificationToken = data.email_verification_token;
    this.passwordResetToken = data.password_reset_token;
    this.passwordResetExpires = data.password_reset_expires;
    this.lastLogin = data.last_login;
    this.isActive = data.is_active !== false;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // 验证用户数据
  static validate(userData, isUpdate = false) {
    const errors = [];

    if (!isUpdate || userData.email !== undefined) {
      if (!userData.email) {
        errors.push('Email is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        errors.push('Invalid email format');
      }
    }

    if (!isUpdate || userData.name !== undefined) {
      if (!userData.name || userData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
    }

    if (!isUpdate && !userData.password) {
      errors.push('Password is required');
    }

    if (userData.password && userData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (userData.role && !['admin', 'organizer', 'speaker', 'participant'].includes(userData.role)) {
      errors.push('Invalid role');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }

  // 哈希密码
  static async hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // 验证密码
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.passwordHash);
  }

  // 创建用户
  static async create(userData) {
    this.validate(userData);

    // 检查邮箱是否已存在
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ValidationError('Email already exists');
    }

    const passwordHash = await this.hashPassword(userData.password);

    const result = await query(`
      INSERT INTO users (email, name, password_hash, role, avatar_url, bio, preferences)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      userData.email,
      userData.name,
      passwordHash,
      userData.role || 'participant',
      userData.avatarUrl || null,
      userData.bio || null,
      JSON.stringify(userData.preferences || {})
    ]);

    logger.info('User created', { userId: result.rows[0].id, email: userData.email });
    return new User(result.rows[0]);
  }

  // 根据ID查找用户
  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1 AND is_active = true', [id]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  // 根据邮箱查找用户
  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  // 获取用户列表
  static async findAll(options = {}) {
    const { page = 1, limit = 20, role, search } = options;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE is_active = true';
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      params.push(role);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // 获取总数
    const countResult = await query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    // 获取用户列表
    params.push(limit, offset);
    const result = await query(`
      SELECT * FROM users ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, params);

    const users = result.rows.map(row => new User(row));

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // 更新用户
  async update(updateData) {
    User.validate(updateData, true);

    // 检查邮箱唯一性（如果更新邮箱）
    if (updateData.email && updateData.email !== this.email) {
      const existingUser = await User.findByEmail(updateData.email);
      if (existingUser && existingUser.id !== this.id) {
        throw new ValidationError('Email already exists');
      }
    }

    const updates = [];
    const params = [];
    let paramCount = 0;

    // 构建更新字段
    const allowedFields = ['email', 'name', 'role', 'avatar_url', 'bio', 'preferences'];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        paramCount++;
        updates.push(`${field} = $${paramCount}`);
        
        if (field === 'preferences') {
          params.push(JSON.stringify(updateData[field]));
        } else {
          params.push(updateData[field]);
        }
      }
    }

    // 处理密码更新
    if (updateData.password) {
      paramCount++;
      updates.push(`password_hash = $${paramCount}`);
      params.push(await User.hashPassword(updateData.password));
    }

    if (updates.length === 0) {
      return this;
    }

    paramCount++;
    params.push(this.id);

    const result = await query(`
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, params);

    if (result.rows.length === 0) {
      throw new NotFoundError('User');
    }

    logger.info('User updated', { userId: this.id });
    return new User(result.rows[0]);
  }

  // 软删除用户
  async delete() {
    await query('UPDATE users SET is_active = false WHERE id = $1', [this.id]);
    logger.info('User deleted', { userId: this.id });
  }

  // 更新最后登录时间
  async updateLastLogin() {
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [this.id]);
    this.lastLogin = new Date();
  }

  // 设置密码重置令牌
  async setPasswordResetToken(token, expiresIn = 3600000) { // 默认1小时
    const expiresAt = new Date(Date.now() + expiresIn);
    
    await query(`
      UPDATE users 
      SET password_reset_token = $1, password_reset_expires = $2 
      WHERE id = $3
    `, [token, expiresAt, this.id]);

    this.passwordResetToken = token;
    this.passwordResetExpires = expiresAt;
  }

  // 清除密码重置令牌
  async clearPasswordResetToken() {
    await query(`
      UPDATE users 
      SET password_reset_token = NULL, password_reset_expires = NULL 
      WHERE id = $1
    `, [this.id]);

    this.passwordResetToken = null;
    this.passwordResetExpires = null;
  }

  // 验证邮箱
  async verifyEmail() {
    await query(`
      UPDATE users 
      SET email_verified = true, email_verification_token = NULL 
      WHERE id = $1
    `, [this.id]);

    this.emailVerified = true;
    this.emailVerificationToken = null;
  }

  // 获取用户权限
  async getPermissions() {
    const result = await query(`
      SELECT p.name, p.resource, p.action, p.description
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role = $1
    `, [this.role]);

    return result.rows;
  }

  // 检查用户是否有特定权限
  async hasPermission(permissionName) {
    const result = await query(`
      SELECT 1
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role = $1 AND p.name = $2
    `, [this.role, permissionName]);

    return result.rows.length > 0;
  }

  // 转换为JSON（移除敏感信息）
  toJSON() {
    const { passwordHash, emailVerificationToken, passwordResetToken, ...publicData } = this;
    return publicData;
  }

  // 转换为公开信息
  toPublic() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      avatarUrl: this.avatarUrl,
      bio: this.bio,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;