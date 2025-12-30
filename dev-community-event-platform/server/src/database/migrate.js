const fs = require('fs');
const path = require('path');
const { query, connectDatabase } = require('../config/database');
const { logger } = require('../utils/logger');

class DatabaseMigrator {
  constructor() {
    this.migrationsDir = path.join(__dirname, 'migrations');
    this.migrationTableName = 'schema_migrations';
  }

  async initialize() {
    try {
      await connectDatabase();
      await this.createMigrationsTable();
      logger.info('Database migrator initialized');
    } catch (error) {
      logger.error('Failed to initialize database migrator:', error);
      throw error;
    }
  }

  async createMigrationsTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${this.migrationTableName} (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await query(createTableQuery);
    logger.info('Migrations table created or already exists');
  }

  async getExecutedMigrations() {
    const result = await query(
      `SELECT filename FROM ${this.migrationTableName} ORDER BY executed_at`
    );
    return result.rows.map(row => row.filename);
  }

  async getMigrationFiles() {
    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    return files;
  }

  async executeMigration(filename) {
    const filePath = path.join(this.migrationsDir, filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    try {
      // 执行迁移SQL
      await query(sql);
      
      // 记录迁移执行
      await query(
        `INSERT INTO ${this.migrationTableName} (filename) VALUES ($1)`,
        [filename]
      );
      
      logger.info(`Migration executed successfully: ${filename}`);
    } catch (error) {
      logger.error(`Failed to execute migration ${filename}:`, error);
      throw error;
    }
  }

  async runMigrations() {
    try {
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(file)
      );
      
      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations to execute');
        return;
      }
      
      logger.info(`Found ${pendingMigrations.length} pending migrations`);
      
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      logger.info('All migrations executed successfully');
    } catch (error) {
      logger.error('Migration failed:', error);
      throw error;
    }
  }

  async rollbackMigration(filename) {
    // 简单的回滚实现 - 在生产环境中需要更复杂的逻辑
    try {
      await query(
        `DELETE FROM ${this.migrationTableName} WHERE filename = $1`,
        [filename]
      );
      
      logger.info(`Migration rollback recorded: ${filename}`);
      logger.warn('Note: SQL rollback must be done manually');
    } catch (error) {
      logger.error(`Failed to rollback migration ${filename}:`, error);
      throw error;
    }
  }

  async getStatus() {
    const executedMigrations = await this.getExecutedMigrations();
    const migrationFiles = await this.getMigrationFiles();
    
    const status = migrationFiles.map(file => ({
      filename: file,
      executed: executedMigrations.includes(file)
    }));
    
    return status;
  }
}

// CLI 接口
async function main() {
  const migrator = new DatabaseMigrator();
  
  try {
    await migrator.initialize();
    
    const command = process.argv[2];
    
    switch (command) {
      case 'up':
        await migrator.runMigrations();
        break;
        
      case 'status':
        const status = await migrator.getStatus();
        console.log('\nMigration Status:');
        console.log('================');
        status.forEach(({ filename, executed }) => {
          const status = executed ? '✓' : '✗';
          console.log(`${status} ${filename}`);
        });
        break;
        
      case 'rollback':
        const filename = process.argv[3];
        if (!filename) {
          console.error('Please provide migration filename to rollback');
          process.exit(1);
        }
        await migrator.rollbackMigration(filename);
        break;
        
      default:
        console.log('Usage:');
        console.log('  node migrate.js up       - Run pending migrations');
        console.log('  node migrate.js status   - Show migration status');
        console.log('  node migrate.js rollback <filename> - Rollback migration');
        break;
    }
    
    process.exit(0);
  } catch (error) {
    logger.error('Migration command failed:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = { DatabaseMigrator };