-- 创建用户角色枚举类型
CREATE TYPE user_role AS ENUM ('admin', 'organizer', 'speaker', 'participant');

-- 创建用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'participant',
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建用户会话表
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  refresh_token_hash VARCHAR(255),
  expires_at TIMESTAMP NOT NULL,
  refresh_expires_at TIMESTAMP NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建权限表
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建角色权限关联表
CREATE TABLE role_permissions (
  role user_role NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_id)
);

-- 创建用户登录日志表
CREATE TABLE user_login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  login_success BOOLEAN NOT NULL,
  failure_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_login_logs_user_id ON user_login_logs(user_id);
CREATE INDEX idx_user_login_logs_created_at ON user_login_logs(created_at);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为用户表添加更新时间触发器
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 为会话表添加更新时间触发器
CREATE TRIGGER update_user_sessions_updated_at 
    BEFORE UPDATE ON user_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 插入基础权限数据
INSERT INTO permissions (name, description, resource, action) VALUES
-- 用户管理权限
('user.create', '创建用户', 'user', 'create'),
('user.read', '查看用户信息', 'user', 'read'),
('user.update', '更新用户信息', 'user', 'update'),
('user.delete', '删除用户', 'user', 'delete'),
('user.list', '查看用户列表', 'user', 'list'),

-- 活动管理权限
('event.create', '创建活动', 'event', 'create'),
('event.read', '查看活动信息', 'event', 'read'),
('event.update', '更新活动信息', 'event', 'update'),
('event.delete', '删除活动', 'event', 'delete'),
('event.list', '查看活动列表', 'event', 'list'),
('event.manage', '管理活动', 'event', 'manage'),

-- 报名管理权限
('registration.create', '创建报名', 'registration', 'create'),
('registration.read', '查看报名信息', 'registration', 'read'),
('registration.update', '更新报名信息', 'registration', 'update'),
('registration.delete', '删除报名', 'registration', 'delete'),
('registration.list', '查看报名列表', 'registration', 'list'),

-- 直播权限
('stream.create', '创建直播', 'stream', 'create'),
('stream.manage', '管理直播', 'stream', 'manage'),
('stream.view', '观看直播', 'stream', 'view'),

-- 内容管理权限
('content.create', '创建内容', 'content', 'create'),
('content.read', '查看内容', 'content', 'read'),
('content.update', '更新内容', 'content', 'update'),
('content.delete', '删除内容', 'content', 'delete'),
('content.manage', '管理内容', 'content', 'manage'),

-- 系统管理权限
('system.admin', '系统管理', 'system', 'admin'),
('system.monitor', '系统监控', 'system', 'monitor');

-- 为不同角色分配权限
-- 管理员权限（所有权限）
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions;

-- 组织者权限
INSERT INTO role_permissions (role, permission_id)
SELECT 'organizer', id FROM permissions 
WHERE name IN (
    'user.read', 'user.list',
    'event.create', 'event.read', 'event.update', 'event.delete', 'event.list', 'event.manage',
    'registration.create', 'registration.read', 'registration.update', 'registration.delete', 'registration.list',
    'stream.create', 'stream.manage', 'stream.view',
    'content.create', 'content.read', 'content.update', 'content.delete', 'content.manage'
);

-- 嘉宾权限
INSERT INTO role_permissions (role, permission_id)
SELECT 'speaker', id FROM permissions 
WHERE name IN (
    'user.read',
    'event.read', 'event.list',
    'registration.read',
    'stream.view',
    'content.read'
);

-- 参与者权限
INSERT INTO role_permissions (role, permission_id)
SELECT 'participant', id FROM permissions 
WHERE name IN (
    'user.read',
    'event.read', 'event.list',
    'registration.create', 'registration.read', 'registration.update',
    'stream.view',
    'content.read'
);