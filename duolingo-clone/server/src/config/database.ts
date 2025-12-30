import { Pool, PoolConfig } from 'pg';
import { createClient, RedisClientType } from 'redis';

// PostgreSQL 连接配置
const pgConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'duolingo_clone',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
};

// 创建 PostgreSQL 连接池
export const pool = new Pool(pgConfig);

// Redis 连接配置
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
};

// 创建 Redis 客户端
const redisOptions: any = {
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
  database: redisConfig.db,
};

if (redisConfig.password) {
  redisOptions.password = redisConfig.password;
}

export const redisClient: RedisClientType = createClient(redisOptions);

// 数据库连接初始化函数
export const initializeDatabase = async (): Promise<void> => {
  // 在开发环境中，如果没有数据库，跳过连接
  if (process.env.NODE_ENV === 'development' && !process.env.DB_REQUIRED) {
    console.log('⚠️  Skipping PostgreSQL connection in development mode');
    console.log('💡 To enable PostgreSQL:');
    console.log('   1. Install PostgreSQL: brew install postgresql');
    console.log('   2. Start PostgreSQL: brew services start postgresql');
    console.log('   3. Create database: createdb duolingo_clone');
    console.log('   4. Set DB_REQUIRED=true in .env');
    console.log('   5. Run migrations: npm run migrate:up');
    return;
  }

  try {
    // 测试 PostgreSQL 连接
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    
    // 测试查询
    const result = await client.query('SELECT NOW()');
    console.log('📅 Database time:', result.rows[0].now);
    
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    
    // 在开发环境中，如果数据库连接失败，给出提示但不终止程序
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Running in development mode without database');
      return;
    }
    
    throw error;
  }
};

// Redis 连接初始化函数
export const initializeRedis = async (): Promise<void> => {
  // 在开发环境中，如果没有 Redis，跳过连接
  if (process.env.NODE_ENV === 'development' && !process.env.REDIS_REQUIRED) {
    console.log('⚠️  Skipping Redis connection in development mode');
    console.log('💡 To enable Redis:');
    console.log('   1. Install Redis: brew install redis');
    console.log('   2. Start Redis: brew services start redis');
    console.log('   3. Set REDIS_REQUIRED=true in .env');
    return;
  }

  try {
    await redisClient.connect();
    console.log('✅ Redis connected successfully');
    
    // 测试 Redis 连接
    await redisClient.ping();
    console.log('🔄 Redis ping successful');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    
    // 在开发环境中，如果 Redis 连接失败，给出提示但不终止程序
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Running in development mode without Redis cache');
      return;
    }
    
    throw error;
  }
};

// 数据库健康检查
export const checkDatabaseHealth = async (): Promise<{
  postgres: boolean;
  redis: boolean;
}> => {
  const health = {
    postgres: false,
    redis: false,
  };

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    health.postgres = true;
  } catch (error) {
    console.error('PostgreSQL health check failed:', error);
  }

  try {
    await redisClient.ping();
    health.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  return health;
};

// 优雅关闭数据库连接
export const closeDatabaseConnections = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('✅ PostgreSQL pool closed');
  } catch (error) {
    console.error('❌ Error closing PostgreSQL pool:', error);
  }

  try {
    await redisClient.quit();
    console.log('✅ Redis connection closed');
  } catch (error) {
    console.error('❌ Error closing Redis connection:', error);
  }
};

// 错误处理
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  console.log('🔗 Redis client connected');
});

redisClient.on('ready', () => {
  console.log('🚀 Redis client ready');
});

redisClient.on('end', () => {
  console.log('🔚 Redis client disconnected');
});