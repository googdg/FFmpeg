# 🔌 API接口文档

## 📋 接口概述

**API版本**: v1.0  
**基础URL**: `https://api.aoyou-medical.com/v1`  
**认证方式**: Session-Based Authentication  
**数据格式**: JSON  
**字符编码**: UTF-8  

## 🔐 认证机制

### 邀请码验证流程
1. 用户输入邀请码
2. 后端验证邀请码（任意数字即可）
3. 验证成功后创建会话
4. 返回会话ID给前端
5. 前端在后续请求中携带会话ID

### 会话管理
- **存储方式**: Redis缓存
- **过期时间**: 24小时
- **传递方式**: HTTP Header `Session-Id`

## 📡 接口列表

### 1. 认证相关接口

#### 1.1 验证邀请码
```http
POST /api/auth/validate-invite
```

**请求参数**:
```json
{
    "inviteCode": "1234"
}
```

**响应示例**:
```json
{
    "success": true,
    "message": "验证成功",
    "data": {
        "sessionId": "550e8400-e29b-41d4-a716-446655440000",
        "expiresAt": "2024-10-22T10:30:00Z"
    }
}
```

**错误响应**:
```json
{
    "success": false,
    "message": "邀请码无效",
    "errorCode": "INVALID_INVITE_CODE"
}
```

#### 1.2 验证会话
```http
POST /api/auth/validate-session
```

**请求头**:
```http
Session-Id: 550e8400-e29b-41d4-a716-446655440000
```

**响应示例**:
```json
{
    "success": true,
    "data": {
        "isValid": true,
        "expiresAt": "2024-10-22T10:30:00Z"
    }
}
```

### 2. 视频相关接口

#### 2.1 获取视频列表
```http
GET /api/videos?category={category}&page={page}&size={size}
```

**请求参数**:
- `category` (string, optional): 视频分类，默认为 "all"
- `page` (int, optional): 页码，从0开始，默认为0
- `size` (int, optional): 每页数量，默认为12

**请求头**:
```http
Session-Id: 550e8400-e29b-41d4-a716-446655440000
```

**响应示例**:
```json
{
    "success": true,
    "data": {
        "content": [
            {
                "id": 1,
                "title": "心血管疾病诊断与治疗",
                "description": "系统学习心血管疾病的诊疗方法",
                "thumbnailUrl": "https://cdn.aoyou.com/thumbnails/video1.jpg",
                "duration": 320,
                "viewCount": 12000,
                "category": {
                    "code": "clinical",
                    "name": "临床医学",
                    "iconEmoji": "🩺"
                },
                "instructor": {
                    "name": "张教授",
                    "avatar": "https://cdn.aoyou.com/avatars/zhang.jpg"
                },
                "createdAt": "2024-10-15T08:30:00Z"
            }
        ],
        "pageable": {
            "page": 0,
            "size": 12,
            "totalElements": 48,
            "totalPages": 4
        }
    }
}
```

#### 2.2 获取视频详情
```http
GET /api/videos/{id}
```

**请求头**:
```http
Session-Id: 550e8400-e29b-41d4-a716-446655440000
```

**响应示例**:
```json
{
    "success": true,
    "data": {
        "id": 1,
        "title": "心血管疾病诊断与治疗 - 临床实践指南",
        "description": "本视频详细介绍了心血管疾病的诊断方法和治疗策略...",
        "videoUrl": "https://cdn.aoyou.com/videos/video1.mp4",
        "thumbnailUrl": "https://cdn.aoyou.com/thumbnails/video1.jpg",
        "duration": 320,
        "viewCount": 12001,
        "category": {
            "code": "clinical",
            "name": "临床医学",
            "iconEmoji": "🩺"
        },
        "instructor": {
            "name": "张教授",
            "title": "心血管内科主任医师",
            "avatar": "https://cdn.aoyou.com/avatars/zhang.jpg",
            "bio": "从事心血管疾病诊疗20余年，发表学术论文50余篇"
        },
        "tags": ["心血管", "诊断", "治疗", "临床"],
        "createdAt": "2024-10-15T08:30:00Z",
        "updatedAt": "2024-10-15T08:30:00Z"
    }
}
```

#### 2.3 记录观看行为
```http
POST /api/videos/{id}/view
```

**请求头**:
```http
Session-Id: 550e8400-e29b-41d4-a716-446655440000
```

**请求参数**:
```json
{
    "watchDuration": 180,
    "watchPercentage": 56.25
}
```

**响应示例**:
```json
{
    "success": true,
    "message": "观看记录已保存"
}
```

### 3. 分类相关接口

#### 3.1 获取分类列表
```http
GET /api/categories
```

**响应示例**:
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "code": "demo",
            "name": "平台演示",
            "iconEmoji": "🎬",
            "sortOrder": 1,
            "videoCount": 2
        },
        {
            "id": 2,
            "code": "clinical",
            "name": "临床医学",
            "iconEmoji": "🩺",
            "sortOrder": 2,
            "videoCount": 15
        },
        {
            "id": 3,
            "code": "basic",
            "name": "基础医学",
            "iconEmoji": "📚",
            "sortOrder": 3,
            "videoCount": 12
        }
    ]
}
```

### 4. 搜索相关接口

#### 4.1 搜索视频
```http
GET /api/search?q={keyword}&page={page}&size={size}
```

**请求参数**:
- `q` (string, required): 搜索关键词
- `page` (int, optional): 页码，默认为0
- `size` (int, optional): 每页数量，默认为12

**请求头**:
```http
Session-Id: 550e8400-e29b-41d4-a716-446655440000
```

**响应示例**:
```json
{
    "success": true,
    "data": {
        "keyword": "心血管",
        "content": [
            {
                "id": 1,
                "title": "心血管疾病诊断与治疗",
                "description": "系统学习心血管疾病的诊疗方法",
                "thumbnailUrl": "https://cdn.aoyou.com/thumbnails/video1.jpg",
                "duration": 320,
                "viewCount": 12000,
                "category": {
                    "code": "clinical",
                    "name": "临床医学"
                },
                "instructor": {
                    "name": "张教授"
                },
                "matchScore": 0.95
            }
        ],
        "pageable": {
            "page": 0,
            "size": 12,
            "totalElements": 5,
            "totalPages": 1
        }
    }
}
```

## 📊 数据模型

### 视频模型 (Video)
```typescript
interface Video {
    id: number;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number; // 秒
    viewCount: number;
    category: Category;
    instructor: Instructor;
    tags: string[];
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
}
```

### 分类模型 (Category)
```typescript
interface Category {
    id: number;
    code: string;
    name: string;
    iconEmoji: string;
    sortOrder: number;
    videoCount?: number;
}
```

### 讲师模型 (Instructor)
```typescript
interface Instructor {
    id: number;
    name: string;
    title?: string;
    avatar?: string;
    bio?: string;
}
```

### 会话模型 (Session)
```typescript
interface Session {
    sessionId: string;
    isValid: boolean;
    expiresAt: string; // ISO 8601
}
```

## 🚨 错误处理

### 错误响应格式
```json
{
    "success": false,
    "message": "错误描述",
    "errorCode": "ERROR_CODE",
    "timestamp": "2024-10-21T10:30:00Z"
}
```

### 常见错误码
| 错误码 | HTTP状态码 | 描述 |
|--------|------------|------|
| `INVALID_INVITE_CODE` | 400 | 邀请码无效 |
| `SESSION_EXPIRED` | 401 | 会话已过期 |
| `SESSION_INVALID` | 401 | 会话无效 |
| `VIDEO_NOT_FOUND` | 404 | 视频不存在 |
| `CATEGORY_NOT_FOUND` | 404 | 分类不存在 |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求频率超限 |
| `INTERNAL_SERVER_ERROR` | 500 | 服务器内部错误 |

## 🔒 安全考虑

### 请求限制
- **邀请码验证**: 每IP每分钟最多5次尝试
- **视频请求**: 每会话每分钟最多60次请求
- **搜索请求**: 每会话每分钟最多30次请求

### 数据验证
- **输入验证**: 所有输入参数进行格式和长度验证
- **SQL注入防护**: 使用参数化查询
- **XSS防护**: 输出内容进行HTML转义

### 会话安全
- **会话ID**: 使用UUID v4生成，具有足够的随机性
- **会话过期**: 24小时自动过期
- **会话清理**: 定期清理过期会话

## 📈 性能优化

### 缓存策略
- **视频列表**: Redis缓存5分钟
- **视频详情**: Redis缓存10分钟
- **分类列表**: Redis缓存1小时

### 分页优化
- **默认分页**: 每页12条记录
- **最大分页**: 每页不超过50条记录
- **深度分页**: 使用游标分页优化深度分页性能

### CDN加速
- **视频文件**: 使用CDN分发，支持多码率自适应
- **图片资源**: 缩略图和头像使用CDN加速
- **静态资源**: CSS、JS文件使用CDN分发

## 🧪 接口测试

### 测试环境
- **测试地址**: `https://api-test.aoyou-medical.com/v1`
- **测试邀请码**: 任意数字（如：1234、888、2024）

### 测试用例

#### 邀请码验证测试
```bash
# 有效邀请码
curl -X POST https://api-test.aoyou-medical.com/v1/api/auth/validate-invite \
  -H "Content-Type: application/json" \
  -d '{"inviteCode": "1234"}'

# 无效邀请码
curl -X POST https://api-test.aoyou-medical.com/v1/api/auth/validate-invite \
  -H "Content-Type: application/json" \
  -d '{"inviteCode": "abc"}'
```

#### 视频列表测试
```bash
# 获取所有视频
curl -X GET "https://api-test.aoyou-medical.com/v1/api/videos" \
  -H "Session-Id: your-session-id"

# 获取临床医学分类视频
curl -X GET "https://api-test.aoyou-medical.com/v1/api/videos?category=clinical" \
  -H "Session-Id: your-session-id"
```

### Postman集合
提供完整的Postman测试集合，包含所有接口的测试用例和环境变量配置。

## 📚 SDK和示例

### JavaScript SDK示例
```javascript
class AoyouMedicalAPI {
    constructor(baseURL, sessionId) {
        this.baseURL = baseURL;
        this.sessionId = sessionId;
    }
    
    async validateInviteCode(inviteCode) {
        const response = await fetch(`${this.baseURL}/api/auth/validate-invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inviteCode })
        });
        return response.json();
    }
    
    async getVideos(category = 'all', page = 0, size = 12) {
        const url = new URL(`${this.baseURL}/api/videos`);
        url.searchParams.set('category', category);
        url.searchParams.set('page', page);
        url.searchParams.set('size', size);
        
        const response = await fetch(url, {
            headers: {
                'Session-Id': this.sessionId
            }
        });
        return response.json();
    }
    
    async getVideoDetail(videoId) {
        const response = await fetch(`${this.baseURL}/api/videos/${videoId}`, {
            headers: {
                'Session-Id': this.sessionId
            }
        });
        return response.json();
    }
}

// 使用示例
const api = new AoyouMedicalAPI('https://api.aoyou-medical.com/v1', 'your-session-id');

// 验证邀请码
const authResult = await api.validateInviteCode('1234');
if (authResult.success) {
    const sessionId = authResult.data.sessionId;
    
    // 获取视频列表
    const videos = await api.getVideos('clinical');
    console.log(videos.data.content);
}
```

---

**文档版本**: v1.0  
**API版本**: v1.0  
**更新日期**: 2024年10月21日