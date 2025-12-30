# 大众汽车金融 - CA智能体信审报告系统设计文档

## 系统概述

本系统是一个基于AI的智能信审报告生成平台，通过H5网页技术实现，为大众汽车金融的信审员提供自动化、智能化的信审决策支持。

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      前端展示层 (H5)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 报告展示 │  │ 数据录入 │  │ 审批操作 │  │ 报告导出 │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                      应用服务层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 数据收集 │  │ 风险分析 │  │ 报告生成 │  │ 审批引擎 │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      数据集成层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ CRM系统  │  │ 征信接口 │  │ 车辆系统 │  │ 核心系统 │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈选型

**前端技术**:
- HTML5 + CSS3 + JavaScript (ES6+)
- Vue.js 3.x (轻量级、易维护)
- ECharts (数据可视化)
- Print.js (打印优化)
- jsPDF (PDF生成)

**后端技术**:
- Node.js + Express (快速开发)
- Python + FastAPI (AI模型服务)
- PostgreSQL (数据存储)
- Redis (缓存和会话)
- RabbitMQ (异步任务队列)

**AI/ML技术**:
- TensorFlow/PyTorch (风险评估模型)
- Scikit-learn (特征工程)
- XGBoost (信用评分模型)
- SHAP (模型可解释性)

## 核心组件设计

### 1. 数据收集引擎

**功能**: 自动从多个数据源收集客户信息

**数据源**:

- 内部CRM系统（客户基本信息）
- 征信系统（人行征信、百行征信）
- 车辆评估系统（车辆价值、车况）
- 收入验证系统（银行流水、社保公积金）
- 反欺诈系统（黑名单、设备指纹）

**数据流程**:
```
客户申请 → 数据收集任务 → 并行查询多个数据源 → 数据清洗和标准化 → 数据存储
```

### 2. 风险分析引擎

**评分模型**:

1. **信用评分模型** (0-1000分)
   - 还款能力 (35%): 收入、DSR、资产
   - 信用历史 (30%): 征信记录、逾期情况
   - 负债情况 (20%): 负债率、其他贷款
   - 稳定性 (10%): 工作年限、居住稳定性
   - 其他因素 (5%): 年龄、教育、行业

2. **风险等级划分**:
   - 优质 (A): 800-1000分，违约率<0.5%
   - 良好 (B): 650-799分，违约率0.5-2%
   - 一般 (C): 500-649分，违约率2-5%
   - 关注 (D): 350-499分，违约率5-10%
   - 拒绝 (E): <350分，违约率>10%

**关键指标计算**:
- DSR = (现有月供 + 本次贷款月供) / 月收入
- LTV = 贷款金额 / 车辆评估价值
- 资产负债率 = 总负债 / 总资产

**RAG智能信息汇总**:

系统自动汇总多源信息，提供全面的客户画像：

1. **财报数据汇总** (针对企业客户)
   - 自动提取财务报表关键指标
   - 分析财务健康度和趋势
   - 识别财务异常和风险点

2. **第三方数据整合**
   - 征信机构数据
   - 银行流水分析
   - 社保公积金记录
   - 税务数据
   - 司法诉讼记录

3. **公网舆情监控** (基于RAG技术)
   - 企业负面新闻监测
   - 行业风险预警
   - 关联企业风险传导
   - 社交媒体舆情分析
   - 自动生成舆情摘要

**AI智能建议系统**:

1. **建议审核方向**
   - 基于风险评估结果，AI自动生成审核重点
   - 例如："建议重点关注客户的负债率偏高问题，需核实其他贷款的真实情况"
   - 提供3-5个关键审核方向，按优先级排序

2. **辅助提问功能**
   - AI根据客户数据和风险点，自动生成建议提问清单
   - 例如：
     * "请问您目前名下其他贷款的月供总额是多少？"
     * "您的收入来源是否稳定？是否有其他收入来源？"
     * "请说明您最近一次逾期的具体原因？"
   - 提供10-15个建议问题，覆盖关键风险点
   - 支持信审员选择性使用或自定义问题

### 3. 报告生成引擎

**一页纸报告布局设计**:

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] 大众汽车金融 - AI信审报告    [日期] [编号]      │
├─────────────────────────────────────────────────────────┤
│  【客户概览】                                            │
│  姓名: ***  性别: *  年龄: **  申请产品: 新车贷款       │
│  申请金额: ¥***,***  期限: **期  车型: *******          │
├─────────────────────────────────────────────────────────┤
│  【风险评估】                    【关键指标】             │
│  ┌─────────────┐              DSR: **%  [进度条]       │
│  │  综合评分    │              LTV: **%  [进度条]       │
│  │    ***      │              月收入: ¥**,***          │
│  │   [等级]    │              征信分: ***              │
│  └─────────────┘              逾期次数: *次             │
├─────────────────────────────────────────────────────────┤
│  【AI智能信息汇总】(基于RAG技术)                         │
│  📊 财报摘要: 企业营收稳定增长，现金流良好              │
│  🔍 第三方数据: 征信良好，社保连续缴纳36个月            │
│  📰 舆情监测: 未发现负面新闻，行业发展稳定              │
├─────────────────────────────────────────────────────────┤
│  【AI建议审核方向】                                      │
│  🎯 重点关注:                                            │
│  1. 负债率偏高(65%)，需核实其他贷款真实情况             │
│  2. 工作年限较短(2年)，需评估收入稳定性                 │
│  3. 首次购车，需了解购车用途和还款计划                  │
├─────────────────────────────────────────────────────────┤
│  【审批建议】                                            │
│  建议: [批准/有条件批准/拒绝]                            │
│  建议额度: ¥***,*** - ¥***,***                          │
│  建议利率: *.*% - *.*%                                  │
│  预期违约率: *.*%                                        │
├─────────────────────────────────────────────────────────┤
│  【AI辅助提问】(点击展开查看建议问题)                    │
│  💬 建议向客户询问:                                      │
│  • 您目前名下其他贷款的月供总额是多少？                  │
│  • 您的收入来源是否稳定？是否有其他收入？                │
│  • 请说明您的购车用途和还款计划？                        │
│  [查看全部15个建议问题]                                  │
├─────────────────────────────────────────────────────────┤
│  【风险提示】                                            │
│  • 高风险项: [列表]                                      │
│  • 需关注项: [列表]                                      │
│  • 附加条件: [列表]                                      │
├─────────────────────────────────────────────────────────┤
│  【决策依据】                                            │
│  数据来源: [列表]  模型版本: v*.* AI置信度: **%        │
│  免责声明: 本报告由AI系统生成，最终决策需人工复核       │
└─────────────────────────────────────────────────────────┘
```

### 4. H5网页设计

**页面结构**:

1. **登录页面** (`/login`)
   - 企业级SSO登录
   - 双因素认证
   - 权限验证

2. **工作台页面** (`/dashboard`)
   - 待审批列表
   - 统计看板
   - 快速搜索

3. **报告生成页面** (`/report/generate`)
   - 客户信息录入
   - 数据收集进度
   - 实时分析状态

4. **报告展示页面** (`/report/view/:id`)
   - 一页纸报告展示
   - 交互式图表
   - 审批操作按钮

5. **报告管理页面** (`/report/list`)
   - 历史报告查询
   - 批量导出
   - 统计分析

**响应式设计**:
- 桌面端: 1920x1080 (主要使用场景)
- 平板端: 1024x768 (移动办公)
- 打印优化: A4纸张 (210x297mm)

## 数据模型设计

### 客户信息模型

```javascript
{
  "customerId": "string",           // 客户唯一标识
  "personalInfo": {
    "name": "string",                // 姓名（脱敏）
    "idNumber": "string",            // 身份证号（脱敏）
    "gender": "M/F",                 // 性别
    "age": "number",                 // 年龄
    "maritalStatus": "string",       // 婚姻状况
    "education": "string",           // 教育程度
    "mobile": "string"               // 手机号（脱敏）
  },
  "employmentInfo": {
    "employer": "string",            // 雇主名称
    "industry": "string",            // 行业
    "position": "string",            // 职位
    "workYears": "number",           // 工作年限
    "monthlyIncome": "number",       // 月收入
    "incomeSource": "string[]"       // 收入来源
  },
  "creditInfo": {
    "creditScore": "number",         // 征信评分
    "overdueCount": "number",        // 逾期次数
    "currentLoans": "number",        // 当前贷款数
    "totalDebt": "number",           // 总负债
    "creditHistory": "object[]"      // 信用历史记录
  },
  "assetInfo": {
    "realEstate": "object[]",        // 房产信息
    "vehicles": "object[]",          // 车辆信息
    "deposits": "number",            // 存款
    "investments": "number"          // 投资
  },
  "applicationInfo": {
    "productType": "string",         // 产品类型
    "loanAmount": "number",          // 申请金额
    "loanTerm": "number",            // 贷款期限
    "vehicleInfo": "object",         // 车辆信息
    "downPayment": "number"          // 首付金额
  }
}
```

### 风险评估模型

```javascript
{
  "assessmentId": "string",
  "customerId": "string",
  "timestamp": "datetime",
  "riskScore": {
    "overall": "number",             // 综合评分 0-1000
    "dimensions": {
      "repaymentAbility": "number",  // 还款能力得分
      "creditHistory": "number",     // 信用历史得分
      "debtLevel": "number",         // 负债水平得分
      "stability": "number",         // 稳定性得分
      "other": "number"              // 其他因素得分
    }
  },
  "riskLevel": "A/B/C/D/E",         // 风险等级
  "keyIndicators": {
    "dsr": "number",                 // 债务收入比
    "ltv": "number",                 // 贷款价值比
    "debtRatio": "number",           // 资产负债率
    "defaultProbability": "number"   // 违约概率
  },
  "riskFactors": {
    "positive": "string[]",          // 正面因素
    "negative": "string[]",          // 负面因素
    "warnings": "string[]"           // 风险警告
  },
  "ragSummary": {                    // RAG智能汇总
    "financialReport": {
      "summary": "string",           // 财报摘要
      "keyMetrics": "object",        // 关键财务指标
      "trends": "string[]",          // 趋势分析
      "risks": "string[]"            // 财务风险点
    },
    "thirdPartyData": {
      "summary": "string",           // 第三方数据摘要
      "creditBureau": "object",      // 征信数据
      "socialSecurity": "object",    // 社保数据
      "taxRecords": "object",        // 税务数据
      "legalRecords": "object"       // 司法记录
    },
    "publicSentiment": {
      "summary": "string",           // 舆情摘要
      "newsArticles": "object[]",    // 相关新闻
      "riskLevel": "string",         // 舆情风险等级
      "keywords": "string[]",        // 关键词
      "sentiment": "positive/neutral/negative"
    }
  },
  "aiRecommendations": {             // AI智能建议
    "reviewDirections": [            // 建议审核方向
      {
        "priority": "number",        // 优先级 1-5
        "direction": "string",       // 审核方向描述
        "reason": "string",          // 原因说明
        "suggestedActions": "string[]" // 建议行动
      }
    ],
    "suggestedQuestions": [          // 辅助提问
      {
        "category": "string",        // 问题类别
        "question": "string",        // 问题内容
        "purpose": "string",         // 提问目的
        "priority": "number"         // 优先级
      }
    ]
  },
  "modelInfo": {
    "version": "string",             // 模型版本
    "confidence": "number",          // 置信度
    "explainability": "object"       // 可解释性数据
  }
}
```

## API接口设计

### 1. 数据收集API

```
POST /api/v1/data-collection/start
请求体:
{
  "applicationId": "string",
  "customerId": "string",
  "dataSources": ["crm", "credit", "vehicle", "income"]
}

响应:
{
  "taskId": "string",
  "status": "in_progress",
  "estimatedTime": 30
}
```

### 2. 风险分析API

```
POST /api/v1/risk-analysis/evaluate
请求体:
{
  "customerId": "string",
  "applicationId": "string",
  "includeRAG": true,              // 是否包含RAG智能汇总
  "includeSuggestions": true       // 是否包含AI建议
}

响应:
{
  "assessmentId": "string",
  "riskScore": 720,
  "riskLevel": "B",
  "recommendation": "conditional_approve",
  "ragSummary": {
    "financialReport": {
      "summary": "企业营收稳定增长，现金流良好"
    },
    "thirdPartyData": {
      "summary": "征信良好，社保连续缴纳36个月"
    },
    "publicSentiment": {
      "summary": "未发现负面新闻，行业发展稳定",
      "riskLevel": "low"
    }
  },
  "aiRecommendations": {
    "reviewDirections": [
      {
        "priority": 1,
        "direction": "重点关注负债率偏高问题",
        "reason": "当前负债率65%，超过建议阈值60%",
        "suggestedActions": ["核实其他贷款真实情况", "评估还款能力"]
      }
    ],
    "suggestedQuestions": [
      {
        "category": "负债情况",
        "question": "您目前名下其他贷款的月供总额是多少？",
        "purpose": "核实负债真实情况",
        "priority": 1
      }
    ]
  }
}
```

### 2.1 RAG智能汇总API

```
POST /api/v1/rag/summarize
请求体:
{
  "customerId": "string",
  "dataTypes": ["financial", "thirdParty", "sentiment"]
}

响应:
{
  "summaryId": "string",
  "financialSummary": {
    "summary": "string",
    "keyMetrics": {},
    "risks": []
  },
  "thirdPartySummary": {
    "summary": "string",
    "sources": []
  },
  "sentimentSummary": {
    "summary": "string",
    "riskLevel": "low/medium/high",
    "articles": []
  }
}
```

### 2.2 AI辅助提问API

```
POST /api/v1/ai/suggest-questions
请求体:
{
  "customerId": "string",
  "assessmentId": "string",
  "focusAreas": ["debt", "income", "stability"]
}

响应:
{
  "questions": [
    {
      "id": "string",
      "category": "负债情况",
      "question": "您目前名下其他贷款的月供总额是多少？",
      "purpose": "核实负债真实情况",
      "priority": 1,
      "followUpQuestions": []
    }
  ],
  "totalCount": 15
}
```

### 3. 报告生成API

```
POST /api/v1/reports/generate
请求体:
{
  "customerId": "string",
  "applicationId": "string",
  "assessmentId": "string"
}

响应:
{
  "reportId": "string",
  "status": "generated",
  "viewUrl": "/report/view/xxx"
}
```

## 安全设计

### 认证和授权

- SSO集成与大众金融AD域
- JWT Token用于API认证
- RBAC基于角色的访问控制

### 数据安全

- 传输加密: TLS 1.3
- 存储加密: AES-256
- 数据脱敏: 身份证号、手机号、姓名

### 审计日志

所有操作记录完整的审计日志，包括用户、时间、操作、结果。

## 性能优化

### 前端优化

- 懒加载路由和组件
- 虚拟滚动处理大列表
- Service Worker缓存

### 后端优化

- Redis缓存热点数据
- 数据库索引优化
- 异步处理耗时任务

### AI模型优化

- 模型压缩和量化
- 批量预测
- GPU加速推理

## 部署架构

采用容器化部署，使用Docker + Kubernetes，支持水平扩展和高可用。

## 监控和运维

- 应用性能监控
- 业务指标监控
- 告警机制
- 日志管理（ELK Stack）

## 测试策略

- 单元测试覆盖率 >80%
- 集成测试
- 端到端测试
- 性能测试
- 安全测试

---

**文档版本**: v1.0  
**创建日期**: 2024-11-12  
**设计负责人**: 系统架构师  
**审核人**: 技术总监
