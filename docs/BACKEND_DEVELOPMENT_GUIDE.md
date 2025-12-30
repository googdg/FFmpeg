# ☕ 后端开发指南 (Java)

## 📋 项目概述

**技术栈**: Spring Boot + MySQL + Redis  
**架构模式**: RESTful API + 微服务架构  
**部署方式**: Docker容器化部署  

## 🏗️ 系统架构

```
backend/
├── 🌐 API网关层
│   ├── Gateway Service      # 统一入口
│   └── Auth Filter         # 认证过滤器
├── 🔧 业务服务层
│   ├── User Service        # 用户管理服务
│   ├── Video Service       # 视频管理服务
│   ├── Category Service    # 分类管理服务
│   └── Analytics Service   # 数据分析服务
├── 💾 数据访问层
│   ├── MySQL Database      # 主数据库
│   ├── Redis Cache        # 缓存层
│   └── File Storage       # 文件存储
└── 🔌 外部集成
    ├── CDN Service        # 内容分发
    └── SMS Service        # 短信服务
```

## 🎯 核心业务模块

### 1. 用户管理模块

#### 实体设计
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(name = "invite_code")
    private String inviteCode;
    
    @Column(name = "access_level")
    private Integer accessLevel;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // getters and setters
}
```

#### 服务接口
```java
@Service
public class UserService {
    
    /**
     * 邀请码验证
     */
    public boolean validateInviteCode(String inviteCode) {
        // 验证逻辑：任意数字即可通过
        return inviteCode != null && inviteCode.matches("\\d+");
    }
    
    /**
     * 创建会话
     */
    public String createSession(String inviteCode) {
        if (validateInviteCode(inviteCode)) {
            return UUID.randomUUID().toString();
        }
        throw new InvalidInviteCodeException("无效的邀请码");
    }
    
    /**
     * 验证会话
     */
    public boolean validateSession(String sessionId) {
        return redisTemplate.hasKey("session:" + sessionId);
    }
}
```

### 2. 视频管理模块

#### 实体设计
```java
@Entity
@Table(name = "videos")
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "video_url")
    private String videoUrl;
    
    @Column(name = "thumbnail_url")
    private String thumbnailUrl;
    
    @Column(name = "category_id")
    private Long categoryId;
    
    @Column(name = "instructor_name")
    private String instructorName;
    
    @Column(name = "duration")
    private Integer duration; // 秒
    
    @Column(name = "view_count")
    private Long viewCount = 0L;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    // getters and setters
}
```

#### 服务接口
```java
@Service
public class VideoService {
    
    /**
     * 获取视频列表（分页）
     */
    public Page<VideoDTO> getVideosByCategory(String category, Pageable pageable) {
        Specification<Video> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("isActive"), true));
            
            if (!"all".equals(category)) {
                predicates.add(cb.equal(root.get("categoryId"), getCategoryId(category)));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        return videoRepository.findAll(spec, pageable)
                .map(this::convertToDTO);
    }
    
    /**
     * 获取视频详情
     */
    public VideoDetailDTO getVideoDetail(Long videoId, String sessionId) {
        // 验证会话权限
        if (!userService.validateSession(sessionId)) {
            throw new UnauthorizedException("请先验证邀请码");
        }
        
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new VideoNotFoundException("视频不存在"));
        
        // 增加观看次数
        video.setViewCount(video.getViewCount() + 1);
        videoRepository.save(video);
        
        return convertToDetailDTO(video);
    }
}
```

### 3. 分类管理模块

#### 实体设计
```java
@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "icon_emoji")
    private String iconEmoji;
    
    @Column(name = "sort_order")
    private Integer sortOrder;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    // getters and setters
}
```

## 🔌 API接口设计

### 1. 邀请码验证接口
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/validate-invite")
    public ResponseEntity<SessionResponse> validateInviteCode(
            @RequestBody @Valid InviteCodeRequest request) {
        
        try {
            String sessionId = userService.createSession(request.getInviteCode());
            
            // 设置会话过期时间（浏览器会话结束）
            redisTemplate.opsForValue().set(
                "session:" + sessionId, 
                "valid", 
                Duration.ofHours(24)
            );
            
            return ResponseEntity.ok(new SessionResponse(sessionId, "验证成功"));
        } catch (InvalidInviteCodeException e) {
            return ResponseEntity.badRequest()
                    .body(new SessionResponse(null, "邀请码无效"));
        }
    }
    
    @PostMapping("/validate-session")
    public ResponseEntity<Boolean> validateSession(
            @RequestHeader("Session-Id") String sessionId) {
        
        boolean isValid = userService.validateSession(sessionId);
        return ResponseEntity.ok(isValid);
    }
}
```

### 2. 视频接口
```java
@RestController
@RequestMapping("/api/videos")
public class VideoController {
    
    @GetMapping
    public ResponseEntity<Page<VideoDTO>> getVideos(
            @RequestParam(defaultValue = "all") String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestHeader("Session-Id") String sessionId) {
        
        // 验证会话
        if (!userService.validateSession(sessionId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<VideoDTO> videos = videoService.getVideosByCategory(category, pageable);
        
        return ResponseEntity.ok(videos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<VideoDetailDTO> getVideoDetail(
            @PathVariable Long id,
            @RequestHeader("Session-Id") String sessionId) {
        
        try {
            VideoDetailDTO video = videoService.getVideoDetail(id, sessionId);
            return ResponseEntity.ok(video);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (VideoNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
```

### 3. 分类接口
```java
@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getCategories() {
        List<CategoryDTO> categories = categoryService.getAllActiveCategories();
        return ResponseEntity.ok(categories);
    }
}
```

## 💾 数据库设计

### 核心表结构
```sql
-- 用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    invite_code VARCHAR(20),
    access_level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 分类表
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    icon_emoji VARCHAR(10),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 视频表
CREATE TABLE videos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    category_id BIGINT,
    instructor_name VARCHAR(100),
    duration INT, -- 秒
    view_count BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 观看记录表
CREATE TABLE view_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100),
    video_id BIGINT,
    view_duration INT, -- 观看时长（秒）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id)
);
```

### 索引优化
```sql
-- 视频查询优化
CREATE INDEX idx_videos_category_active ON videos(category_id, is_active);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);

-- 观看记录优化
CREATE INDEX idx_view_records_session ON view_records(session_id);
CREATE INDEX idx_view_records_video ON view_records(video_id);
```

## 🔧 配置文件

### application.yml
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/aoyou_medical?useUnicode=true&characterEncoding=utf8&useSSL=false
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
    driver-class-name: com.mysql.cj.jdbc.Driver
    
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}
    timeout: 2000ms
    
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 100MB

# 自定义配置
aoyou:
  medical:
    session:
      timeout: 24h # 会话超时时间
    video:
      base-url: ${VIDEO_BASE_URL:http://localhost:8080/videos/}
    invite:
      validation:
        pattern: "\\d+" # 任意数字
```

## 🧪 测试策略

### 单元测试
```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private RedisTemplate<String, String> redisTemplate;
    
    @InjectMocks
    private UserService userService;
    
    @Test
    void testValidateInviteCode_ValidNumeric_ReturnsTrue() {
        // Given
        String inviteCode = "1234";
        
        // When
        boolean result = userService.validateInviteCode(inviteCode);
        
        // Then
        assertTrue(result);
    }
    
    @Test
    void testValidateInviteCode_InvalidNonNumeric_ReturnsFalse() {
        // Given
        String inviteCode = "abc123";
        
        // When
        boolean result = userService.validateInviteCode(inviteCode);
        
        // Then
        assertFalse(result);
    }
}
```

### 集成测试
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class VideoControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void testGetVideos_WithValidSession_ReturnsVideoList() {
        // Given
        String sessionId = createValidSession();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Session-Id", sessionId);
        
        // When
        ResponseEntity<String> response = restTemplate.exchange(
            "/api/videos?category=clinical",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            String.class
        );
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }
}
```

## 🚀 部署配置

### Docker配置
```dockerfile
FROM openjdk:17-jre-slim

WORKDIR /app

COPY target/aoyou-medical-backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
      
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: aoyou_medical
    volumes:
      - mysql_data:/var/lib/mysql
      
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

## 📊 监控和日志

### 日志配置
```xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/aoyou-medical.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/aoyou-medical.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="STDOUT"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

---

**文档版本**: v1.0  
**更新日期**: 2024年10月21日