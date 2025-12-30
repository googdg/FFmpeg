import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

interface SeedFile {
  filename: string;
  sql: string;
}

class DatabaseSeeder {
  private seedsPath: string;

  constructor() {
    this.seedsPath = path.join(__dirname, 'seeds');
  }

  /**
   * 获取所有种子文件
   */
  private getSeedFiles(): SeedFile[] {
    if (!fs.existsSync(this.seedsPath)) {
      console.log('📁 Creating seeds directory...');
      fs.mkdirSync(this.seedsPath, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(this.seedsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(filename => {
      const filePath = path.join(this.seedsPath, filename);
      const sql = fs.readFileSync(filePath, 'utf8');
      return { filename, sql };
    });
  }

  /**
   * 执行单个种子文件
   */
  private async executeSeedFile(seedFile: SeedFile): Promise<void> {
    const client = await pool.connect();
    
    try {
      console.log(`🌱 Executing seed: ${seedFile.filename}`);
      
      // 分割SQL语句（以分号分隔）
      const statements = seedFile.sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          await client.query(statement);
        }
      }
      
      console.log(`✅ Seed completed: ${seedFile.filename}`);
    } catch (error) {
      console.error(`❌ Seed failed: ${seedFile.filename}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 运行所有种子文件
   */
  async runSeeds(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');
      
      const seedFiles = this.getSeedFiles();
      
      if (seedFiles.length === 0) {
        console.log('📝 No seed files found');
        return;
      }
      
      console.log(`📋 Found ${seedFiles.length} seed files`);
      
      for (const seedFile of seedFiles) {
        await this.executeSeedFile(seedFile);
      }
      
      console.log('🎉 All seeds completed successfully');
    } catch (error) {
      console.error('❌ Seeding process failed:', error);
      throw error;
    }
  }

  /**
   * 清空所有数据表（谨慎使用）
   */
  async clearAllData(): Promise<void> {
    try {
      console.log('🗑️  Clearing all data...');
      
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // 获取所有表名（排除系统表和迁移表）
        const tablesResult = await client.query(`
          SELECT tablename 
          FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename != 'migrations'
          ORDER BY tablename
        `);
        
        const tables = tablesResult.rows.map(row => row.tablename);
        
        if (tables.length === 0) {
          console.log('📝 No tables to clear');
          await client.query('COMMIT');
          return;
        }
        
        // 禁用外键约束检查
        await client.query('SET session_replication_role = replica');
        
        // 清空所有表
        for (const table of tables) {
          await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
          console.log(`🗑️  Cleared table: ${table}`);
        }
        
        // 重新启用外键约束检查
        await client.query('SET session_replication_role = DEFAULT');
        
        await client.query('COMMIT');
        
        console.log('✅ All data cleared successfully');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Clear data failed:', error);
      throw error;
    }
  }

  /**
   * 重置数据库（清空数据并重新种子）
   */
  async resetDatabase(): Promise<void> {
    try {
      console.log('🔄 Resetting database...');
      
      await this.clearAllData();
      await this.runSeeds();
      
      console.log('🎉 Database reset completed successfully');
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
  }

  /**
   * 检查数据库是否有数据
   */
  async checkDataExists(): Promise<boolean> {
    try {
      const result = await pool.query('SELECT COUNT(*) as count FROM users');
      const userCount = parseInt(result.rows[0].count);
      
      console.log(`📊 Current users in database: ${userCount}`);
      
      return userCount > 0;
    } catch (error) {
      console.error('❌ Failed to check data:', error);
      return false;
    }
  }

  /**
   * 显示数据库统计信息
   */
  async showDatabaseStats(): Promise<void> {
    try {
      console.log('\n📊 Database Statistics:');
      console.log('=====================');
      
      const stats = [
        { table: 'users', description: 'Users' },
        { table: 'courses', description: 'Courses' },
        { table: 'units', description: 'Units' },
        { table: 'skills', description: 'Skills' },
        { table: 'lessons', description: 'Lessons' },
        { table: 'exercises', description: 'Exercises' },
        { table: 'achievements', description: 'Achievements' },
        { table: 'shop_items', description: 'Shop Items' },
      ];
      
      for (const stat of stats) {
        try {
          const result = await pool.query(`SELECT COUNT(*) as count FROM ${stat.table}`);
          const count = result.rows[0].count;
          console.log(`${stat.description}: ${count}`);
        } catch (error) {
          console.log(`${stat.description}: Table not found`);
        }
      }
      
      console.log('=====================\n');
    } catch (error) {
      console.error('❌ Failed to show database stats:', error);
    }
  }
}

// 导出种子器实例
export const seeder = new DatabaseSeeder();

// 如果直接运行此文件，执行种子操作
if (require.main === module) {
  const command = process.argv[2];
  
  async function runCommand() {
    try {
      switch (command) {
        case 'run':
          await seeder.runSeeds();
          break;
        case 'clear':
          await seeder.clearAllData();
          break;
        case 'reset':
          await seeder.resetDatabase();
          break;
        case 'stats':
          await seeder.showDatabaseStats();
          break;
        case 'check':
          await seeder.checkDataExists();
          break;
        default:
          console.log('Usage: npm run seed [run|clear|reset|stats|check]');
          console.log('  run   - Run seed files');
          console.log('  clear - Clear all data');
          console.log('  reset - Clear data and run seeds');
          console.log('  stats - Show database statistics');
          console.log('  check - Check if data exists');
      }
    } catch (error) {
      console.error('Seed command failed:', error);
      process.exit(1);
    } finally {
      await pool.end();
    }
  }
  
  runCommand();
}