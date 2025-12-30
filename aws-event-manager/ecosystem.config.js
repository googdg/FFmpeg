// PM2 配置文件

module.exports = {
  apps: [{
    name: 'aws-event-manager',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 80
    },
    // 监控配置
    monitoring: false,
    
    // 日志配置
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // 重启配置
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    
    // 自动重启配置
    watch: false,
    ignore_watch: [
      'node_modules',
      'logs',
      'uploads',
      '*.db'
    ],
    
    // 进程配置
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // 环境变量
    env_file: '.env'
  }],

  // 部署配置
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/aws-event-manager.git',
      path: '/var/www/aws-event-manager',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    },
    
    staging: {
      user: 'deploy',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/aws-event-manager.git',
      path: '/var/www/aws-event-manager-staging',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging'
    }
  }
};