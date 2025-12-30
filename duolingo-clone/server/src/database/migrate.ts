import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

interface Migration {
  id: string;
  filename: string;
  sql: string;
}

class DatabaseMigrator {
  private migrationsPath: string;

  constructor() {
    this.migrationsPath = path.join(__dirname, 'migrations');
  }

  /**
   * 创建迁移记录表
   */
  private async createMigrationsTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableSQL);
    console.log('✅ Migrations table created/verified');
  }

  /**
   * 获取所有迁移文件
   */
  private getMigrationFiles(): Migration[] {
    if (!fs.existsSync(this.migrationsPath)) {
      console.log('📁 Creating migrations directory...');
      fs.mkdirSync(this.migrationsPath, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(filename => {
      const filePath = path.join(this.migrationsPath, filename);
      const sql = fs.readFileSync(filePath, 'utf8');
      const id = filename.replace('.sql', '');

      return { id, filename, sql };
    });
  }

  /**
   * 获取已执行的迁移
   */
  private async getExecutedMigrations(): Promise<string[]> {
    try {
      const result = await pool.query('SELECT filename FROM migrations ORDER BY id');
      return result.rows.map(row => row.filename);
    } catch (error) {
      // 如果表不存在，返回空数组
      return [];
    }
  }

  /**
   * 执行单个迁移
   */
  private async executeMigration(migration: Migration): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 执行迁移SQL
      await client.query(migration.sql);
      
      // 记录迁移执行
      await client.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [migration.filename]
      );
      
      await client.query('COMMIT');
      
      console.log(`✅ Migration executed: ${migration.filename}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Migration failed: ${migration.filename}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 运行所有待执行的迁移
   */
  async runMigrations(): Promise<void> {
    try {
      console.log('🚀 Starting database migrations...');
      
      // 创建迁移记录表
      await this.createMigrationsTable();
      
      // 获取所有迁移文件
      const allMigrations = this.getMigrationFiles();
      
      if (allMigrations.length === 0) {
        console.log('📝 No migration files found');
        return;
      }
      
      // 获取已执行的迁移
      const executedMigrations = await this.getExecutedMigrations();
      
      // 找出待执行的迁移
      const pendingMigrations = allMigrations.filter(
        migration => !executedMigrations.includes(migration.filename)
      );
      
      if (pendingMigrations.length === 0) {
        console.log('✅ All migrations are up to date');
        return;
      }
      
      console.log(`📋 Found ${pendingMigrations.length} pending migrations`);
      
      // 执行待执行的迁移
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      console.log('🎉 All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration process failed:', error);
      throw error;
    }
  }

  /**
   * 回滚最后一个迁移（谨慎使用）
   */
  async rollbackLastMigration(): Promise<void> {
    try {
      const result = await pool.query(
        'SELECT filename FROM migrations ORDER BY id DESC LIMIT 1'
      );
      
      if (result.rows.length === 0) {
        console.log('📝 No migrations to rollback');
        return;
      }
      
      const lastMigration = result.rows[0].filename;
      
      // 删除迁移记录
      await pool.query('DELETE FROM migrations WHERE filename = $1', [lastMigration]);
      
      console.log(`⏪ Rolled back migration: ${lastMigration}`);
      console.log('⚠️  Note: You may need to manually revert database changes');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }

  /**
   * 显示迁移状态
   */
  async showMigrationStatus(): Promise<void> {
    try {
      const allMigrations = this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();
      
      console.log('\n📊 Migration Status:');
      console.log('==================');
      
      if (allMigrations.length === 0) {
        console.log('📝 No migration files found');
        return;
      }
      
      allMigrations.forEach(migration => {
        const isExecuted = executedMigrations.includes(migration.filename);
        const status = isExecuted ? '✅ Executed' : '⏳ Pending';
        console.log(`${status} - ${migration.filename}`);
      });
      
      const pendingCount = allMigrations.length - executedMigrations.length;
      console.log(`\n📈 Total: ${allMigrations.length}, Executed: ${executedMigrations.length}, Pending: ${pendingCount}`);
    } catch (error) {
      console.error('❌ Failed to show migration status:', error);
      throw error;
    }
  }
}

// 导出迁移器实例
export const migrator = new DatabaseMigrator();

// 如果直接运行此文件，执行迁移
if (require.main === module) {
  const command = process.argv[2];
  
  async function runCommand() {
    try {
      switch (command) {
        case 'up':
          await migrator.runMigrations();
          break;
        case 'status':
          await migrator.showMigrationStatus();
          break;
        case 'rollback':
          await migrator.rollbackLastMigration();
          break;
        default:
          console.log('Usage: npm run migrate [up|status|rollback]');
          console.log('  up      - Run pending migrations');
          console.log('  status  - Show migration status');
          console.log('  rollback - Rollback last migration');
      }
    } catch (error) {
      console.error('Migration command failed:', error);
      process.exit(1);
    } finally {
      await pool.end();
    }
  }
  
  runCommand();
}