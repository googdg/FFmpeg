#!/bin/sh

# 等待数据库启动
echo "Waiting for database to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "Database is ready!"

# 等待Redis启动
echo "Waiting for Redis to be ready..."
while ! nc -z redis 6379; do
  sleep 1
done
echo "Redis is ready!"

# 运行数据库迁移
echo "Running database migrations..."
cd /app/server && npm run db:migrate

# 启动应用
echo "Starting applications..."

# 启动后端服务
cd /app/server && npm start &

# 启动前端服务
cd /app/client && npm start &

# 等待所有后台进程
wait