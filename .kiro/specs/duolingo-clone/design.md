# 英语学习平台设计文档

## 概述

本文档描述了多邻国克隆版英语学习平台的技术架构和设计方案。该平台将完全复制多邻国的用户体验、视觉设计和功能特性，提供一个功能完整的语言学习解决方案。

## 架构

### 系统架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用      │    │   后端API       │    │   数据库        │
│                 │    │                 │    │                 │
│ - React/Vue.js  │◄──►│ - Node.js       │◄──►│ - PostgreSQL    │
│ - PWA支持       │    │ - Express.js    │    │ - Redis缓存     │
│ - 响应式设计    │    │ - JWT认证       │    │ - 文件存储      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/静态资源  │    │   第三方服务    │    │   监控/分析     │
│                 │    │                 │    │                 │
│ - 图片/音频     │    │ - 邮件服务      │    │ - 用户行为      │
│ - 视频内容      │    │ - 语音识别      │    │ - 性能监控      │
│ - 缓存策略      │    │ - 翻译API       │    │ - 错误追踪      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技术栈选择

**前端技术栈**
- **框架**: React.js 18+ (与多邻国相似的现代化体验)
- **状态管理**: Redux Toolkit (复杂状态管理)
- **路由**: React Router v6 (单页应用导航)
- **UI组件**: 自定义组件库 (完全复制多邻国设计)
- **样式**: Styled-components + CSS Modules
- **动画**: Framer Motion (流畅的交互动画)
- **PWA**: Workbox (离线支持和缓存)
- **音频**: Web Audio API (语音播放和录制)

**后端技术栈**
- **运行时**: Node.js 18+ LTS
- **框架**: Express.js (RESTful API)
- **数据库**: PostgreSQL (关系型数据存储)
- **缓存**: Redis (会话和数据缓存)
- **认证**: JWT + Passport.js
- **文件存储**: AWS S3 / 本地存储
- **实时通信**: Socket.io (好友互动)

**开发工具**
- **构建工具**: Vite (快速开发构建)
- **代码质量**: ESLint + Prettier
- **测试**: Jest + React Testing Library
- **类型检查**: TypeScript
- **API文档**: Swagger/OpenAPI

## 组件和接口

### 前端组件架构

```
src/
├── components/           # 可复用组件
│   ├── common/          # 通用组件
│   │   ├── Button/      # 按钮组件
│   │   ├── Modal/       # 模态框组件
│   │   ├── Loading/     # 加载组件
│   │   └── Icon/        # 图标组件
│   ├── layout/          # 布局组件
│   │   ├── Header/      # 顶部导航
│   │   ├── Sidebar/     # 侧边栏
│   │   └── Footer/      # 底部组件
│   └── learning/        # 学习相关组件
│       ├── LessonCard/  # 课程卡片
│       ├── Exercise/    # 练习题组件
│       ├── Progress/    # 进度条组件
│       └── Achievement/ # 成就组件
├── pages/               # 页面组件
│   ├── Home/           # 首页
│   ├── Learn/          # 学习页面
│   ├── Profile/        # 个人资料
│   ├── Leaderboard/    # 排行榜
│   └── Shop/           # 商店页面
├── hooks/              # 自定义Hooks
├── services/           # API服务
├── store/              # Redux状态管理
├── utils/              # 工具函数
└── assets/             # 静态资源
```

### 核心组件设计

#### 1. 学习路径组件 (LearningPath)
```typescript
interface LearningPathProps {
  course: Course;
  userProgress: UserProgress;
  onSkillClick: (skill: Skill) => void;
}

// 功能特性:
// - 树状课程结构显示
// - 技能解锁状态管理
// - 进度可视化
// - 响应式布局适配
```

#### 2. 练习题组件 (ExerciseComponent)
```typescript
interface ExerciseProps {
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
  heartsRemaining: number;
}

// 支持题型:
// - 选择题 (MultipleChoice)
// - 翻译题 (Translation)
// - 听力题 (Listening)
// - 口语题 (Speaking)
// - 填空题 (FillInBlank)
// - 排序题 (WordOrder)
```

#### 3. 游戏化UI组件 (GameUI)
```typescript
interface GameUIProps {
  xp: number;
  hearts: number;
  streak: number;
  gems: number;
  level: number;
}

// 包含元素:
// - XP进度条
// - 生命值显示
// - 连击计数器
// - 宝石余额
// - 等级徽章
```

### API接口设计

#### 认证相关API
```typescript
// 用户注册
POST /api/auth/register
{
  email: string;
  username: string;
  password: string;
  nativeLanguage: string;
}

// 用户登录
POST /api/auth/login
{
  email: string;
  password: string;
}

// 刷新令牌
POST /api/auth/refresh
{
  refreshToken: string;
}
```

#### 学习相关API
```typescript
// 获取课程结构
GET /api/courses/:courseId
Response: {
  id: string;
  name: string;
  units: Unit[];
  userProgress: UserProgress;
}

// 开始课程
POST /api/lessons/:lessonId/start
Response: {
  lessonId: string;
  exercises: Exercise[];
  sessionId: string;
}

// 提交答案
POST /api/exercises/:exerciseId/answer
{
  answer: string;
  timeSpent: number;
}
Response: {
  correct: boolean;
  explanation?: string;
  xpEarned: number;
  heartsLost: number;
}
```

#### 用户进度API
```typescript
// 获取用户统计
GET /api/users/:userId/stats
Response: {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  achievements: Achievement[];
  weeklyProgress: DailyProgress[];
}

// 更新学习进度
POST /api/progress/update
{
  lessonId: string;
  exercisesCompleted: number;
  xpEarned: number;
  timeSpent: number;
}
```

## 数据模型

### 数据库设计

#### 用户相关表
```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  native_language VARCHAR(10) NOT NULL,
  learning_language VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户资料表
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  display_name VARCHAR(100),
  avatar_url VARCHAR(255),
  bio TEXT,
  timezone VARCHAR(50),
  notification_settings JSONB,
  privacy_settings JSONB
);

-- 用户统计表
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  hearts INTEGER DEFAULT 5,
  gems INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  lessons_completed INTEGER DEFAULT 0,
  last_activity_date DATE
);
```

#### 课程内容表
```sql
-- 课程表
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  language_from VARCHAR(10) NOT NULL,
  language_to VARCHAR(10) NOT NULL,
  difficulty_level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 单元表
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  unlock_requirement INTEGER DEFAULT 0
);

-- 技能表
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES units(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  order_index INTEGER NOT NULL,
  difficulty_level INTEGER DEFAULT 1
);

-- 课程表
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID REFERENCES skills(id),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'lesson', 'practice', 'story', 'test'
  order_index INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 10
);
```

#### 练习题表
```sql
-- 练习题表
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id),
  type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'translation', 'listening', etc.
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  options JSONB, -- 选择题选项
  audio_url VARCHAR(255), -- 听力题音频
  image_url VARCHAR(255), -- 图片题
  difficulty_level INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL
);

-- 练习题提示表
CREATE TABLE exercise_hints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID REFERENCES exercises(id),
  hint_text TEXT NOT NULL,
  order_index INTEGER NOT NULL
);
```

#### 用户进度表
```sql
-- 用户课程进度表
CREATE TABLE user_course_progress (
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  current_unit_id UUID REFERENCES units(id),
  total_xp INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, course_id)
);

-- 用户技能进度表
CREATE TABLE user_skill_progress (
  user_id UUID REFERENCES users(id),
  skill_id UUID REFERENCES skills(id),
  level INTEGER DEFAULT 0, -- 0: locked, 1-5: skill levels
  xp_earned INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMP,
  strength DECIMAL(3,2) DEFAULT 1.00, -- 技能强度 0.00-1.00
  PRIMARY KEY (user_id, skill_id)
);

-- 用户学习会话表
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  lesson_id UUID REFERENCES lessons(id),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  xp_earned INTEGER DEFAULT 0,
  hearts_lost INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  exercises_correct INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0 -- 秒数
);
```

### 缓存策略

#### Redis缓存设计
```typescript
// 用户会话缓存
"session:{userId}" = {
  userId: string;
  username: string;
  currentCourse: string;
  hearts: number;
  xp: number;
  streak: number;
  lastActivity: timestamp;
}

// 课程内容缓存
"course:{courseId}" = {
  courseData: Course;
  units: Unit[];
  skills: Skill[];
  ttl: 3600; // 1小时
}

// 用户进度缓存
"progress:{userId}:{courseId}" = {
  completedLessons: string[];
  currentSkill: string;
  xpProgress: number;
  ttl: 1800; // 30分钟
}

// 排行榜缓存
"leaderboard:weekly" = {
  users: Array<{userId, username, xp}>;
  ttl: 300; // 5分钟
}
```

## 错误处理

### 前端错误处理策略

#### 1. 全局错误边界
```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 发送错误报告到监控服务
    errorReportingService.captureException(error, {
      extra: errorInfo,
      tags: { component: 'ErrorBoundary' }
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallbackComponent error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

#### 2. API错误处理
```typescript
// API服务错误处理
class APIService {
  async request(url: string, options: RequestOptions) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new APIError(response.status, await response.json());
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        // 处理已知API错误
        this.handleAPIError(error);
      } else {
        // 处理网络错误等未知错误
        this.handleUnknownError(error);
      }
      throw error;
    }
  }

  private handleAPIError(error: APIError) {
    switch (error.status) {
      case 401:
        // 未授权，重定向到登录页
        authService.logout();
        break;
      case 403:
        // 权限不足
        notificationService.showError('权限不足');
        break;
      case 429:
        // 请求过于频繁
        notificationService.showWarning('请求过于频繁，请稍后再试');
        break;
      default:
        notificationService.showError(error.message);
    }
  }
}
```

### 后端错误处理

#### 1. 全局错误中间件
```typescript
// 错误处理中间件
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id
  });

  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message,
      details: error.details
    });
  }

  if (error instanceof AuthenticationError) {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid credentials'
    });
  }

  if (error instanceof AuthorizationError) {
    return res.status(403).json({
      error: 'Authorization Error',
      message: 'Insufficient permissions'
    });
  }

  // 默认服务器错误
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
};
```

#### 2. 数据库错误处理
```typescript
// 数据库操作错误处理
class DatabaseService {
  async executeQuery(query: string, params: any[]) {
    try {
      return await this.pool.query(query, params);
    } catch (error) {
      if (error.code === '23505') {
        // 唯一约束违反
        throw new ValidationError('Duplicate entry');
      }
      
      if (error.code === '23503') {
        // 外键约束违反
        throw new ValidationError('Referenced record not found');
      }
      
      // 记录数据库错误
      logger.error('Database error:', {
        error: error.message,
        code: error.code,
        query,
        params
      });
      
      throw new DatabaseError('Database operation failed');
    }
  }
}
```

## 测试策略

### 前端测试

#### 1. 单元测试
```typescript
// 组件测试示例
describe('ExerciseComponent', () => {
  it('should render multiple choice question correctly', () => {
    const mockExercise = {
      type: 'multiple_choice',
      question: 'What is "hello" in Spanish?',
      options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
      correctAnswer: 'Hola'
    };

    render(<ExerciseComponent exercise={mockExercise} onAnswer={jest.fn()} />);
    
    expect(screen.getByText('What is "hello" in Spanish?')).toBeInTheDocument();
    expect(screen.getByText('Hola')).toBeInTheDocument();
  });

  it('should call onAnswer when option is selected', () => {
    const mockOnAnswer = jest.fn();
    const mockExercise = { /* ... */ };

    render(<ExerciseComponent exercise={mockExercise} onAnswer={mockOnAnswer} />);
    
    fireEvent.click(screen.getByText('Hola'));
    
    expect(mockOnAnswer).toHaveBeenCalledWith('Hola');
  });
});
```

#### 2. 集成测试
```typescript
// 学习流程集成测试
describe('Learning Flow Integration', () => {
  it('should complete a lesson successfully', async () => {
    // 模拟用户登录
    const user = await loginUser('test@example.com', 'password');
    
    // 开始课程
    const lesson = await startLesson(user.id, 'lesson-1');
    
    // 完成所有练习
    for (const exercise of lesson.exercises) {
      await submitAnswer(exercise.id, exercise.correctAnswer);
    }
    
    // 验证课程完成
    const progress = await getUserProgress(user.id);
    expect(progress.completedLessons).toContain('lesson-1');
    expect(progress.xp).toBeGreaterThan(0);
  });
});
```

### 后端测试

#### 1. API测试
```typescript
// API端点测试
describe('Learning API', () => {
  describe('POST /api/lessons/:id/start', () => {
    it('should start a lesson for authenticated user', async () => {
      const user = await createTestUser();
      const token = generateJWT(user.id);
      
      const response = await request(app)
        .post('/api/lessons/lesson-1/start')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body.exercises).toHaveLength(5);
    });

    it('should return 401 for unauthenticated user', async () => {
      await request(app)
        .post('/api/lessons/lesson-1/start')
        .expect(401);
    });
  });
});
```

#### 2. 数据库测试
```typescript
// 数据库操作测试
describe('User Progress Service', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should update user XP correctly', async () => {
    const user = await createTestUser();
    const initialXP = user.totalXP;
    
    await userProgressService.addXP(user.id, 50);
    
    const updatedUser = await getUserById(user.id);
    expect(updatedUser.totalXP).toBe(initialXP + 50);
  });
});
```

### 性能测试

#### 1. 负载测试
```typescript
// 使用Artillery进行负载测试
// artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100

scenarios:
  - name: "Learning Session"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password"
          capture:
            - json: "$.token"
              as: "authToken"
      - post:
          url: "/api/lessons/lesson-1/start"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - post:
          url: "/api/exercises/exercise-1/answer"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            answer: "correct answer"
```

这个设计文档涵盖了多邻国克隆项目的完整技术架构，包括前后端技术选型、数据库设计、API接口、错误处理和测试策略。接下来我们可以进入任务规划阶段。