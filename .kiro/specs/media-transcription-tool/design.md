# Design Document

## Overview

音视频转文字稿工具采用现代化的前后端分离架构，结合AI语音识别技术，为用户提供高效、准确的媒体转录服务。系统设计重点关注用户体验、处理性能、多格式支持和结果准确性。

## Architecture

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Web App (React)  │  File Upload   │  Progress Display     │
│  Media Player     │  Text Editor   │  Export Tools         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway                              │
├─────────────────────────────────────────────────────────────┤
│           Load Balancer + Rate Limiting                     │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Backend Services                           │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Upload Service │  Media Service  │  Transcription Service  │
│  Queue Service  │  Export Service │  Notification Service   │
└─────────────────┴─────────────────┴─────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Processing Layer                           │
├─────────────────┬─────────────────┬─────────────────────────┤
│   FFmpeg        │   Whisper AI    │    Audio Enhancement    │
│   (Media Proc)  │   (Speech-to-Text) │   (Noise Reduction)  │
└─────────────────┴─────────────────┴─────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Storage Layer                            │
├─────────────────┬─────────────────┬─────────────────────────┤
│   File Storage  │     Redis       │      Database           │
│   (Media Files) │   (Cache/Queue) │    (Metadata/Jobs)      │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### 技术栈选择

**前端技术栈:**
- React 18 + TypeScript - 主要UI框架
- Vite - 构建工具和开发服务器
- Tailwind CSS - 样式框架
- Zustand - 状态管理
- React Query - 数据获取和缓存
- Wavesurfer.js - 音频波形显示
- React Dropzone - 文件拖拽上传

**后端技术栈:**
- Node.js + Express - API服务器
- TypeScript - 类型安全
- Bull Queue - 任务队列管理
- Multer - 文件上传处理
- Socket.io - 实时进度推送
- Winston - 日志记录

**媒体处理:**
- FFmpeg - 音视频格式转换和处理
- OpenAI Whisper - 语音转文字AI模型
- yt-dlp - 在线视频下载
- SoX - 音频增强和降噪

**存储和缓存:**
- Redis - 任务队列和缓存
- SQLite/PostgreSQL - 任务元数据存储
- 本地文件系统 - 临时文件存储
- AWS S3/MinIO - 可选的云存储

## Components and Interfaces

### 核心组件架构

#### 1. 文件上传模块 (Upload Service)
```typescript
interface UploadService {
  uploadFile(file: File): Promise<UploadResult>
  validateFile(file: File): ValidationResult
  getUploadProgress(uploadId: string): Promise<ProgressInfo>
  cancelUpload(uploadId: string): Promise<void>
}

interface UploadResult {
  uploadId: string
  filename: string
  fileSize: number
  mimeType: string
  duration?: number
  metadata: MediaMetadata
}

interface MediaMetadata {
  format: string
  duration: number
  bitrate: number
  sampleRate: number
  channels: number
  language?: string
}
```

#### 2. 媒体处理模块 (Media Service)
```typescript
interface MediaService {
  extractAudio(videoPath: string): Promise<AudioExtractionResult>
  enhanceAudio(audioPath: string, options: AudioEnhanceOptions): Promise<string>
  downloadFromUrl(url: string): Promise<DownloadResult>
  getMediaInfo(filePath: string): Promise<MediaInfo>
  convertFormat(inputPath: string, outputFormat: string): Promise<string>
}

interface AudioExtractionResult {
  audioPath: string
  duration: number
  format: string
  quality: AudioQuality
}

interface AudioEnhanceOptions {
  noiseReduction: boolean
  volumeNormalization: boolean
  speechEnhancement: boolean
}

interface DownloadResult {
  filePath: string
  originalUrl: string
  title: string
  duration: number
  format: string
}
```

#### 3. 转录服务模块 (Transcription Service)
```typescript
interface TranscriptionService {
  transcribe(audioPath: string, options: TranscriptionOptions): Promise<TranscriptionJob>
  getTranscriptionStatus(jobId: string): Promise<JobStatus>
  getTranscriptionResult(jobId: string): Promise<TranscriptionResult>
  cancelTranscription(jobId: string): Promise<void>
}

interface TranscriptionOptions {
  language?: string
  model: 'tiny' | 'base' | 'small' | 'medium' | 'large'
  includeTimestamps: boolean
  wordLevelTimestamps: boolean
  initialPrompt?: string
}

interface TranscriptionResult {
  jobId: string
  text: string
  segments: TranscriptionSegment[]
  language: string
  confidence: number
  processingTime: number
}

interface TranscriptionSegment {
  id: number
  start: number
  end: number
  text: string
  confidence: number
  words?: WordTimestamp[]
}

interface WordTimestamp {
  word: string
  start: number
  end: number
  confidence: number
}
```

#### 4. 导出服务模块 (Export Service)
```typescript
interface ExportService {
  exportToFormat(transcription: TranscriptionResult, format: ExportFormat): Promise<ExportResult>
  generateSubtitles(transcription: TranscriptionResult, format: SubtitleFormat): Promise<string>
  createDocument(transcription: TranscriptionResult, template: DocumentTemplate): Promise<Buffer>
}

type ExportFormat = 'txt' | 'srt' | 'vtt' | 'docx' | 'pdf' | 'json'
type SubtitleFormat = 'srt' | 'vtt' | 'ass' | 'ssa'

interface ExportResult {
  filename: string
  content: string | Buffer
  mimeType: string
  size: number
}

interface DocumentTemplate {
  includeTimestamps: boolean
  includeConfidence: boolean
  formatting: DocumentFormatting
}
```

#### 5. 任务队列模块 (Queue Service)
```typescript
interface QueueService {
  addJob(jobType: JobType, data: JobData): Promise<Job>
  getJob(jobId: string): Promise<Job | null>
  getJobStatus(jobId: string): Promise<JobStatus>
  cancelJob(jobId: string): Promise<void>
  getQueueStats(): Promise<QueueStats>
}

type JobType = 'upload' | 'extract_audio' | 'transcribe' | 'export'

interface Job {
  id: string
  type: JobType
  status: JobStatus
  progress: number
  data: JobData
  result?: any
  error?: string
  createdAt: Date
  updatedAt: Date
}

type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'cancelled'

interface QueueStats {
  waiting: number
  active: number
  completed: number
  failed: number
}
```

## Data Models

### 数据库设计

#### 转录任务表
```sql
CREATE TABLE transcription_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session VARCHAR(255),
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  duration DECIMAL(10,2),
  
  -- 处理状态
  status VARCHAR(50) DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- 转录配置
  language VARCHAR(10),
  model VARCHAR(20) DEFAULT 'base',
  include_timestamps BOOLEAN DEFAULT true,
  word_level_timestamps BOOLEAN DEFAULT false,
  
  -- 结果数据
  transcription_text TEXT,
  confidence_score DECIMAL(3,2),
  processing_time INTEGER, -- 秒
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_transcription_jobs_status ON transcription_jobs(status);
CREATE INDEX idx_transcription_jobs_created_at ON transcription_jobs(created_at);
CREATE INDEX idx_transcription_jobs_user_session ON transcription_jobs(user_session);
```

#### 转录片段表
```sql
CREATE TABLE transcription_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES transcription_jobs(id) ON DELETE CASCADE,
  segment_index INTEGER NOT NULL,
  start_time DECIMAL(8,3) NOT NULL,
  end_time DECIMAL(8,3) NOT NULL,
  text TEXT NOT NULL,
  confidence DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_segments_job_id ON transcription_segments(job_id);
CREATE INDEX idx_segments_time ON transcription_segments(start_time, end_time);
```

#### 词级时间戳表
```sql
CREATE TABLE word_timestamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID REFERENCES transcription_segments(id) ON DELETE CASCADE,
  word_index INTEGER NOT NULL,
  word VARCHAR(100) NOT NULL,
  start_time DECIMAL(8,3) NOT NULL,
  end_time DECIMAL(8,3) NOT NULL,
  confidence DECIMAL(3,2)
);

CREATE INDEX idx_words_segment_id ON word_timestamps(segment_id);
```

#### 用户会话表
```sql
CREATE TABLE user_sessions (
  session_id VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  job_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0 -- 总处理时长（秒）
);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Media Input Processing Properties

**Property 1: Video link validation consistency**
*For any* video platform URL (YouTube, Bilibili, Vimeo), the validation process should correctly identify valid links and extract video information
**Validates: Requirements 1.1**

**Property 2: Audio extraction reliability**
*For any* valid video link, the system should successfully extract audio tracks and initiate transcription processing
**Validates: Requirements 1.2**

**Property 3: Multi-track selection availability**
*For any* video containing multiple audio tracks, the system should detect all tracks and provide user selection options
**Validates: Requirements 1.3**

**Property 4: Duration limit handling**
*For any* video exceeding time limits, the system should prompt users and offer segmentation processing options
**Validates: Requirements 1.4**

**Property 5: Error message clarity**
*For any* inaccessible or unsupported link, the system should display clear error messages with helpful suggestions
**Validates: Requirements 1.5**

### Audio Processing Properties

**Property 6: Audio link validation**
*For any* direct audio file URL, the system should validate format compatibility and accessibility
**Validates: Requirements 2.1**

**Property 7: Audio processing initiation**
*For any* valid audio link, the system should directly begin speech recognition processing
**Validates: Requirements 2.2**

**Property 8: Format conversion capability**
*For any* unsupported audio format, the system should attempt automatic conversion to supported formats
**Validates: Requirements 2.3**

**Property 9: Large file handling**
*For any* oversized audio file, the system should provide streaming or segmented download options
**Validates: Requirements 2.4**

**Property 10: Network resilience**
*For any* network interruption, the system should support resume functionality and retry mechanisms
**Validates: Requirements 2.5**

### File Upload Properties

**Property 11: File validation completeness**
*For any* uploaded video file, the system should validate format and size constraints before processing
**Validates: Requirements 3.1**

**Property 12: Upload progress tracking**
*For any* supported video format, the system should display upload progress and extract audio successfully
**Validates: Requirements 3.2**

**Property 13: Multi-language track detection**
*For any* video file with multiple language tracks, the system should detect and allow user track selection
**Validates: Requirements 3.3**

**Property 14: Automatic processing trigger**
*For any* completed file upload, the system should automatically initiate audio extraction and transcription
**Validates: Requirements 3.4**

**Property 15: Unsupported format guidance**
*For any* unsupported file format, the system should provide conversion suggestions and tool recommendations
**Validates: Requirements 3.5**

### Audio File Processing Properties

**Property 16: Audio format support**
*For any* common audio format (MP3, WAV, M4A, FLAC), the system should accept and process the file
**Validates: Requirements 4.1**

**Property 17: Audio information display**
*For any* successfully uploaded audio file, the system should display waveform and basic file information
**Validates: Requirements 4.2**

**Property 18: Quality enhancement options**
*For any* low-quality audio file, the system should offer audio enhancement options
**Validates: Requirements 4.3**

**Property 19: Noise reduction availability**
*For any* audio containing background noise, the system should provide noise reduction processing options
**Validates: Requirements 4.4**

**Property 20: Transcription initiation**
*For any* completed audio processing, the system should immediately begin speech recognition transcription
**Validates: Requirements 4.5**

### Transcription Quality Properties

**Property 21: Language detection automation**
*For any* audio input, the transcription engine should automatically detect the primary language
**Validates: Requirements 5.1**

**Property 22: Multi-language segmentation**
*For any* audio with multiple languages, the system should mark different language segments and process separately
**Validates: Requirements 5.2**

**Property 23: Accuracy threshold compliance**
*For any* good-quality audio, the transcription engine should achieve 95%+ recognition accuracy
**Validates: Requirements 5.3**

**Property 24: Technical term handling**
*For any* specialized terminology, the system should provide correction options and custom dictionary functionality
**Validates: Requirements 5.4**

**Property 25: Confidence scoring provision**
*For any* completed transcription, the system should provide confidence scores and potential error markers
**Validates: Requirements 5.5**

### Progress Tracking Properties

**Property 26: Progress display completeness**
*For any* transcription task, the progress tracking should show current stage and overall percentage
**Validates: Requirements 6.1**

**Property 27: Time estimation accuracy**
*For any* large file processing, the system should provide estimated remaining time and processing speed
**Validates: Requirements 6.2**

**Property 28: Real-time text display**
*For any* ongoing transcription, the system should display completed text segments in real-time
**Validates: Requirements 6.3**

**Property 29: Error handling visibility**
*For any* processing error, the system should display error information and retry options
**Validates: Requirements 6.4**

**Property 30: Completion statistics**
*For any* finished task, the system should display total processing time and result statistics
**Validates: Requirements 6.5**

### Timestamp Properties

**Property 31: Timestamp precision**
*For any* completed transcription, timestamps should mark precise start and end times for each sentence or paragraph
**Validates: Requirements 7.1**

**Property 32: Audio navigation accuracy**
*For any* timestamp click, the system should jump to the exact corresponding audio position
**Validates: Requirements 7.2**

**Property 33: Edit synchronization**
*For any* text editing operation, timestamps should remain synchronized with modified text
**Validates: Requirements 7.3**

**Property 34: Export format compliance**
*For any* export operation, timestamps should be correctly included according to the selected format
**Validates: Requirements 7.4**

**Property 35: Manual adjustment capability**
*For any* inaccurate timestamp, the system should allow user manual adjustment of time points
**Validates: Requirements 7.5**

### Text Editing Properties

**Property 36: Editor availability**
*For any* completed transcription, the system should provide a built-in text editor
**Validates: Requirements 8.1**

**Property 37: Real-time saving**
*For any* text editing, the system should save changes in real-time while maintaining timestamp synchronization
**Validates: Requirements 8.2**

**Property 38: Error correction tools**
*For any* recognition errors, the system should provide quick correction and batch replacement functionality
**Validates: Requirements 8.3**

**Property 39: Punctuation assistance**
*For any* punctuation needs, the system should provide intelligent punctuation suggestions
**Validates: Requirements 8.4**

**Property 40: Version control support**
*For any* editing completion, the system should support undo/redo operations and version history
**Validates: Requirements 8.5**

### Export Properties

**Property 41: Format support comprehensiveness**
*For any* export request, the system should support text (TXT), subtitle (SRT, VTT), and document formats (DOCX, PDF)
**Validates: Requirements 9.1**

**Property 42: Subtitle format compliance**
*For any* subtitle export, the format should include accurate timecodes and appropriate line length limits
**Validates: Requirements 9.2**

**Property 43: Document format preservation**
*For any* document export, the format should maintain text formatting and timestamp information
**Validates: Requirements 9.3**

**Property 44: Custom format flexibility**
*For any* custom format needs, the system should provide template editing and format customization options
**Validates: Requirements 9.4**

**Property 45: Save option availability**
*For any* export completion, the system should provide direct download and cloud storage save options
**Validates: Requirements 9.5**

### Multi-language Properties

**Property 46: Language support breadth**
*For any* multi-language content, the system should support Chinese, English, Japanese, Korean, and other major languages
**Validates: Requirements 10.1**

**Property 47: Manual language selection**
*For any* inaccurate language detection, the system should allow manual language selection or switching
**Validates: Requirements 10.2**

**Property 48: Dialect recognition**
*For any* audio containing dialects, the system should recognize and adapt appropriate language models
**Validates: Requirements 10.3**

**Property 49: Mixed language processing**
*For any* mixed-language content, the system should mark different language segments and process separately
**Validates: Requirements 10.4**

**Property 50: Language pack management**
*For any* new language support needs, the system should provide language pack download and installation functionality
**Validates: Requirements 10.5**

### Performance Properties

**Property 51: Concurrent processing capability**
*For any* large file processing, the system should support background processing and multi-task parallelism
**Validates: Requirements 11.1**

**Property 52: Load balancing efficiency**
*For any* high system load, the system should automatically adjust processing priorities and resource allocation
**Validates: Requirements 11.2**

**Property 53: Offline processing support**
*For any* unstable network conditions, the system should provide offline processing and local caching functionality
**Validates: Requirements 11.3**

**Property 54: Crash recovery reliability**
*For any* browser crash, the system should automatically recover incomplete tasks and progress
**Validates: Requirements 11.4**

**Property 55: Task control flexibility**
*For any* long-running process, the system should provide task pause, resume, and cancel functionality
**Validates: Requirements 11.5**

### User Interface Properties

**Property 56: Drag-and-drop functionality**
*For any* user interface interaction, the system should provide intuitive drag-and-drop upload and one-click transcription
**Validates: Requirements 12.2**

**Property 57: Result display clarity**
*For any* transcription result display, the system should provide clear text layout and readable fonts
**Validates: Requirements 12.3**

**Property 58: Responsive design adaptation**
*For any* mobile device usage, the system should provide responsive design and touch optimization
**Validates: Requirements 12.5**

## Error Handling

### 错误处理策略

#### 1. 分层错误处理
```typescript
// API层错误处理
class APIErrorHandler {
  static handle(error: Error, req: Request, res: Response) {
    const errorResponse = {
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.id
      }
    }
    
    // 记录错误日志
    logger.error('API Error', { error, requestId: req.id })
    
    // 返回适当的HTTP状态码
    const statusCode = this.getStatusCode(error)
    res.status(statusCode).json(errorResponse)
  }
}

// 业务逻辑层错误处理
class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}
```

#### 2. 媒体处理错误处理
```typescript
class MediaProcessingErrorHandler {
  // 文件格式错误
  static handleFormatError(file: File, error: Error) {
    return {
      code: 'UNSUPPORTED_FORMAT',
      message: `不支持的文件格式: ${file.type}`,
      suggestions: this.getFormatSuggestions(file.type)
    }
  }
  
  // 文件大小错误
  static handleSizeError(file: File, maxSize: number) {
    return {
      code: 'FILE_TOO_LARGE',
      message: `文件过大: ${file.size} bytes，最大支持: ${maxSize} bytes`,
      suggestions: ['压缩文件', '分段处理', '使用云端处理']
    }
  }
  
  // 网络错误处理
  static handleNetworkError(url: string, error: Error) {
    return {
      code: 'NETWORK_ERROR',
      message: `网络连接失败: ${url}`,
      retryable: true,
      suggestions: ['检查网络连接', '稍后重试', '使用本地文件']
    }
  }
}
```

#### 3. 转录服务错误处理
```typescript
class TranscriptionErrorHandler {
  // 语音识别错误
  static handleRecognitionError(audioData: AudioData, error: Error) {
    if (error.code === 'AUDIO_QUALITY_LOW') {
      return {
        code: 'LOW_QUALITY_AUDIO',
        message: '音频质量较低，可能影响识别准确性',
        suggestions: ['启用音频增强', '手动校对结果', '重新录制']
      }
    }
    
    if (error.code === 'LANGUAGE_NOT_DETECTED') {
      return {
        code: 'LANGUAGE_DETECTION_FAILED',
        message: '无法检测音频语言',
        suggestions: ['手动选择语言', '检查音频内容', '尝试其他模型']
      }
    }
    
    return {
      code: 'TRANSCRIPTION_FAILED',
      message: '转录处理失败',
      retryable: true
    }
  }
}
```

## Testing Strategy

### 双重测试方法

本项目采用单元测试和基于属性的测试相结合的综合测试策略：

- **单元测试**：验证具体示例、边界条件和错误处理
- **基于属性的测试**：验证跨所有输入的通用属性
- 两种测试方法互补：单元测试捕获具体错误，属性测试验证通用正确性

### 单元测试策略

**测试框架选择**：
- **前端**：Jest + React Testing Library
- **后端**：Jest + Supertest (Node.js API测试)
- **媒体处理**：使用测试音视频文件进行集成测试
- **模拟服务**：使用MSW (Mock Service Worker)

**单元测试覆盖范围**：
- 文件上传和验证逻辑
- 媒体格式转换和处理
- 转录API集成和结果处理
- 导出功能和格式生成
- 用户界面组件交互

### 基于属性的测试策略

**测试库选择**：
- **JavaScript/TypeScript**：fast-check
- **最小迭代次数**：每个属性测试运行100次迭代
- **测试标注格式**：每个属性测试必须包含注释 `**Feature: media-transcription-tool, Property {number}: {property_text}**`

**属性测试实现要求**：
- 每个正确性属性必须由单独的属性测试实现
- 测试必须生成随机输入数据来验证属性
- 使用智能生成器约束输入空间
- 重点测试核心转录逻辑的通用规则

**测试数据生成策略**：
```typescript
// 示例：媒体文件生成器
const mediaFileGenerator = fc.record({
  name: fc.string({ minLength: 1, maxLength: 255 }),
  size: fc.integer({ min: 1024, max: 100 * 1024 * 1024 }), // 1KB to 100MB
  type: fc.constantFrom('video/mp4', 'audio/mp3', 'audio/wav', 'video/avi'),
  duration: fc.integer({ min: 1, max: 3600 }) // 1 second to 1 hour
})

// 示例：转录配置生成器
const transcriptionOptionsGenerator = fc.record({
  language: fc.constantFrom('zh', 'en', 'ja', 'ko', 'auto'),
  model: fc.constantFrom('tiny', 'base', 'small', 'medium', 'large'),
  includeTimestamps: fc.boolean(),
  wordLevelTimestamps: fc.boolean()
})

// 示例：URL生成器
const urlGenerator = fc.oneof(
  fc.webUrl({ validSchemes: ['https'] }).filter(url => 
    url.includes('youtube.com') || 
    url.includes('bilibili.com') || 
    url.includes('vimeo.com')
  ),
  fc.webUrl({ validSchemes: ['https'] }).map(url => url + '.mp3')
)
```

### 集成测试策略

**端到端测试场景**：
- 完整的文件上传到转录完成流程
- 在线视频链接处理全流程
- 多语言音频处理和导出
- 错误恢复和重试机制

**性能测试**：
- 大文件处理性能测试
- 并发转录任务负载测试
- 内存使用和资源管理测试
- 网络中断恢复测试

**兼容性测试**：
- 不同浏览器兼容性测试
- 移动设备响应式测试
- 各种音视频格式支持测试
- 不同语言和方言识别测试