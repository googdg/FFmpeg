# 多阶段构建 Dockerfile

# 阶段1: 构建前端
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# 阶段2: 构建后端
FROM node:18-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
RUN npm run build

# 阶段3: 生产环境
FROM node:18-alpine AS production

# 安装系统依赖
RUN apk add --no-cache \
    postgresql-client \
    redis \
    ffmpeg \
    curl

# 创建应用用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 设置工作目录
WORKDIR /app

# 复制后端构建结果
COPY --from=server-builder --chown=nodejs:nodejs /app/server/dist ./server/dist
COPY --from=server-builder --chown=nodejs:nodejs /app/server/node_modules ./server/node_modules
COPY --from=server-builder --chown=nodejs:nodejs /app/server/package.json ./server/

# 复制前端构建结果
COPY --from=client-builder --chown=nodejs:nodejs /app/client/.next ./client/.next
COPY --from=client-builder --chown=nodejs:nodejs /app/client/node_modules ./client/node_modules
COPY --from=client-builder --chown=nodejs:nodejs /app/client/package.json ./client/
COPY --from=client-builder --chown=nodejs:nodejs /app/client/next.config.js ./client/
COPY --from=client-builder --chown=nodejs:nodejs /app/client/public ./client/public

# 复制启动脚本
COPY --chown=nodejs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# 创建必要的目录
RUN mkdir -p logs uploads && chown -R nodejs:nodejs logs uploads

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 3000 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# 启动应用
ENTRYPOINT ["./docker-entrypoint.sh"]