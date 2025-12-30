const { connectDatabase } = require('../config/database');
const User = require('../models/User');
const { logger } = require('../utils/logger');

class DatabaseSeeder {
  async initialize() {
    try {
      await connectDatabase();
      logger.info('Database seeder initialized');
    } catch (error) {
      logger.error('Failed to initialize database seeder:', error);
      throw error;
    }
  }

  async seedUsers() {
    try {
      logger.info('Seeding users...');

      // 检查是否已有管理员用户
      const existingAdmin = await User.findByEmail('admin@dev-community.com');
      if (existingAdmin) {
        logger.info('Admin user already exists, skipping user seeding');
        return;
      }

      // 创建管理员用户
      const adminUser = await User.create({
        email: 'admin@dev-community.com',
        name: 'Platform Administrator',
        password: 'Admin123!',
        role: 'admin',
        bio: 'Platform administrator with full system access',
        preferences: {
          language: 'zh',
          notifications: {
            email: true,
            push: true
          }
        }
      });

      // 创建组织者用户
      const organizerUser = await User.create({
        email: 'organizer@dev-community.com',
        name: 'Event Organizer',
        password: 'Organizer123!',
        role: 'organizer',
        bio: 'Experienced event organizer for developer community',
        preferences: {
          language: 'zh',
          notifications: {
            email: true,
            push: true
          }
        }
      });

      // 创建嘉宾用户
      const speakerUser = await User.create({
        email: 'speaker@dev-community.com',
        name: 'Tech Speaker',
        password: 'Speaker123!',
        role: 'speaker',
        bio: 'Senior software engineer and tech speaker',
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            push: false
          }
        }
      });

      // 创建参与者用户
      const participantUser = await User.create({
        email: 'participant@dev-community.com',
        name: 'Community Member',
        password: 'Participant123!',
        role: 'participant',
        bio: 'Active community member and developer',
        preferences: {
          language: 'zh',
          notifications: {
            email: false,
            push: true
          }
        }
      });

      logger.info('Users seeded successfully', {
        admin: adminUser.id,
        organizer: organizerUser.id,
        speaker: speakerUser.id,
        participant: participantUser.id
      });

    } catch (error) {
      logger.error('Failed to seed users:', error);
      throw error;
    }
  }

  async seedDemoData() {
    try {
      logger.info('Seeding demo data...');

      // 创建一些演示用户
      const demoUsers = [
        {
          email: 'alice@example.com',
          name: 'Alice Johnson',
          password: 'Demo123!',
          role: 'organizer',
          bio: 'Frontend developer and community organizer'
        },
        {
          email: 'bob@example.com',
          name: 'Bob Smith',
          password: 'Demo123!',
          role: 'speaker',
          bio: 'Backend engineer with 10+ years experience'
        },
        {
          email: 'charlie@example.com',
          name: 'Charlie Brown',
          password: 'Demo123!',
          role: 'participant',
          bio: 'Junior developer eager to learn'
        },
        {
          email: 'diana@example.com',
          name: 'Diana Prince',
          password: 'Demo123!',
          role: 'speaker',
          bio: 'DevOps specialist and cloud architect'
        },
        {
          email: 'eve@example.com',
          name: 'Eve Wilson',
          password: 'Demo123!',
          role: 'participant',
          bio: 'Mobile app developer'
        }
      ];

      for (const userData of demoUsers) {
        // 检查用户是否已存在
        const existingUser = await User.findByEmail(userData.email);
        if (!existingUser) {
          await User.create(userData);
          logger.info(`Demo user created: ${userData.email}`);
        }
      }

      logger.info('Demo data seeded successfully');

    } catch (error) {
      logger.error('Failed to seed demo data:', error);
      throw error;
    }
  }

  async run(options = {}) {
    try {
      await this.initialize();

      if (options.users !== false) {
        await this.seedUsers();
      }

      if (options.demo) {
        await this.seedDemoData();
      }

      logger.info('Database seeding completed successfully');
    } catch (error) {
      logger.error('Database seeding failed:', error);
      throw error;
    }
  }

  async reset() {
    try {
      await this.initialize();
      
      logger.info('Resetting database...');
      
      const { query } = require('../config/database');
      
      // 清空所有表（按依赖顺序）
      await query('TRUNCATE TABLE user_login_logs CASCADE');
      await query('TRUNCATE TABLE user_sessions CASCADE');
      await query('TRUNCATE TABLE users CASCADE');
      
      logger.info('Database reset completed');
      
    } catch (error) {
      logger.error('Database reset failed:', error);
      throw error;
    }
  }
}

// CLI 接口
async function main() {
  const seeder = new DatabaseSeeder();
  
  try {
    const command = process.argv[2];
    
    switch (command) {
      case 'run':
        const demo = process.argv.includes('--demo');
        await seeder.run({ demo });
        break;
        
      case 'users':
        await seeder.seedUsers();
        break;
        
      case 'demo':
        await seeder.seedDemoData();
        break;
        
      case 'reset':
        await seeder.reset();
        break;
        
      default:
        console.log('Usage:');
        console.log('  node seed.js run [--demo]  - Run all seeders');
        console.log('  node seed.js users         - Seed basic users only');
        console.log('  node seed.js demo          - Seed demo data only');
        console.log('  node seed.js reset         - Reset all data');
        break;
    }
    
    process.exit(0);
  } catch (error) {
    logger.error('Seeding command failed:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = { DatabaseSeeder };