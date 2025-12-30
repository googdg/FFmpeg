# 多邻国克隆项目测试指南

## 📋 测试概述

本项目采用全面的测试策略，包括单元测试、集成测试和端到端测试，确保应用的可靠性和稳定性。

## 🧪 测试类型

### 1. 单元测试
- **前端组件测试**: 使用 Jest + React Testing Library
- **后端服务测试**: 使用 Jest + Supertest
- **工具函数测试**: 纯函数和辅助工具测试

### 2. 集成测试
- **API端点测试**: 完整的请求-响应流程测试
- **数据库交互测试**: 模拟数据库操作
- **服务间交互测试**: 不同服务模块的协作测试

### 3. 功能测试
- **学习流程测试**: 完整的学习会话流程
- **离线功能测试**: 离线下载和同步功能
- **用户认证测试**: 注册、登录、权限验证

## 🛠️ 测试工具和框架

### 前端测试栈
- **Jest**: JavaScript测试框架
- **React Testing Library**: React组件测试工具
- **@testing-library/jest-dom**: DOM断言扩展
- **@testing-library/user-event**: 用户交互模拟

### 后端测试栈
- **Jest**: 测试框架
- **Supertest**: HTTP断言库
- **ts-jest**: TypeScript支持

### 测试配置
- **jest.config.js**: Jest配置文件
- **setupTests.ts**: 测试环境设置
- **模拟文件**: 各种模拟和存根

## 📁 测试文件结构

```
duolingo-clone/
├── src/
│   ├── components/
│   │   └── __tests__/
│   │       ├── SkillTree.test.tsx
│   │       └── ExerciseComponent.test.tsx
│   ├── services/
│   │   └── __tests__/
│   │       └── offlineService.test.ts
│   ├── __mocks__/
│   │   └── fileMock.js
│   └── setupTests.ts
├── server/src/
│   ├── __tests__/
│   │   └── learning.test.ts
│   ├── services/
│   │   └── __tests__/
│   │       └── LearningService.test.ts
│   └── setupTests.ts
├── jest.config.js
└── run-tests.sh
```

## 🚀 运行测试

### 基本命令

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 只运行前端测试
npm run test:frontend

# 只运行后端测试
npm run test:backend

# CI环境测试
npm run test:ci
```

### 使用测试脚本

```bash
# 运行完整测试套件
./run-tests.sh
```

## 📊 测试覆盖率

### 覆盖率目标
- **分支覆盖率**: ≥ 70%
- **函数覆盖率**: ≥ 70%
- **行覆盖率**: ≥ 70%
- **语句覆盖率**: ≥ 70%

### 查看覆盖率报告
测试完成后，覆盖率报告会生成在 `coverage/` 目录：
- **文本报告**: 控制台输出
- **HTML报告**: `coverage/lcov-report/index.html`
- **LCOV报告**: `coverage/lcov.info`

## 🧩 测试示例

### 前端组件测试示例

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import SkillTree from '../SkillTree';

test('renders skill tree correctly', () => {
  render(<SkillTree course={mockCourse} onSkillClick={jest.fn()} />);
  
  expect(screen.getByText('问候')).toBeInTheDocument();
  expect(screen.getByText('介绍')).toBeInTheDocument();
});

test('handles skill click', () => {
  const mockOnClick = jest.fn();
  render(<SkillTree course={mockCourse} onSkillClick={mockOnClick} />);
  
  fireEvent.click(screen.getByText('问候'));
  expect(mockOnClick).toHaveBeenCalledWith('skill-1');
});
```

### 后端API测试示例

```typescript
import request from 'supertest';
import app from '../app';

describe('Learning API', () => {
  test('GET /api/learning/courses', async () => {
    const response = await request(app)
      .get('/api/learning/courses')
      .expect(200);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.courses).toBeInstanceOf(Array);
  });
});
```

### 服务测试示例

```typescript
import { LearningService } from '../LearningService';

describe('LearningService', () => {
  test('starts learning session', async () => {
    const service = new LearningService();
    const session = await service.startLearningSession('user-1', 'lesson-1');
    
    expect(session.userId).toBe('user-1');
    expect(session.lessonId).toBe('lesson-1');
    expect(session.isCompleted).toBe(false);
  });
});
```

## 🔧 测试最佳实践

### 1. 测试命名
- 使用描述性的测试名称
- 遵循 "should do something when condition" 格式
- 使用中文描述更清晰的业务逻辑

### 2. 测试结构
- **Arrange**: 准备测试数据和环境
- **Act**: 执行被测试的操作
- **Assert**: 验证结果

### 3. 模拟和存根
- 模拟外部依赖（API、数据库等）
- 使用真实数据结构的模拟数据
- 保持模拟数据的一致性

### 4. 异步测试
- 正确处理Promise和async/await
- 使用waitFor等待异步操作完成
- 避免测试中的竞态条件

### 5. 清理和隔离
- 每个测试后清理状态
- 测试之间保持独立
- 使用beforeEach和afterEach钩子

## 🐛 调试测试

### 常见问题和解决方案

1. **测试超时**
   ```typescript
   // 增加超时时间
   test('long running test', async () => {
     // test code
   }, 10000); // 10秒超时
   ```

2. **异步操作未完成**
   ```typescript
   // 使用waitFor等待
   await waitFor(() => {
     expect(screen.getByText('Loading...')).not.toBeInTheDocument();
   });
   ```

3. **模拟未生效**
   ```typescript
   // 确保在测试前清理模拟
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

### 调试技巧
- 使用 `screen.debug()` 查看DOM结构
- 使用 `console.log` 输出中间状态
- 运行单个测试文件进行调试
- 使用 `--verbose` 标志获取详细输出

## 📈 持续集成

### CI/CD集成
测试可以集成到CI/CD流水线中：

```yaml
# GitHub Actions示例
- name: Run Tests
  run: npm run test:ci
  
- name: Upload Coverage
  uses: codecov/codecov-action@v1
  with:
    file: ./coverage/lcov.info
```

### 质量门禁
- 所有测试必须通过才能合并代码
- 覆盖率不能低于设定阈值
- 新增代码必须包含相应测试

## 📚 相关资源

- [Jest官方文档](https://jestjs.io/docs/getting-started)
- [React Testing Library文档](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest文档](https://github.com/visionmedia/supertest)
- [测试最佳实践](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🤝 贡献指南

### 添加新测试
1. 为新功能编写对应测试
2. 确保测试覆盖主要场景
3. 遵循现有的测试模式
4. 更新相关文档

### 测试审查清单
- [ ] 测试名称清晰描述功能
- [ ] 覆盖正常和异常情况
- [ ] 模拟数据合理真实
- [ ] 测试独立且可重复
- [ ] 断言明确且有意义

---

通过完善的测试策略，我们确保多邻国克隆项目的高质量和可靠性。每个开发者都应该熟悉测试工具和最佳实践，为项目的长期成功贡献力量。