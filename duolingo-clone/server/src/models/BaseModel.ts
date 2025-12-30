import { Pool, PoolClient, QueryResult } from 'pg';
import { pool } from '../config/database';

export abstract class BaseModel {
  protected pool: Pool;

  constructor() {
    this.pool = pool;
  }

  /**
   * 执行查询
   */
  protected async query(
    text: string,
    params?: any[]
  ): Promise<QueryResult<any>> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Query executed:', {
          text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          duration: `${duration}ms`,
          rows: result.rowCount,
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Database query error:', {
        text,
        params,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * 在事务中执行多个查询
   */
  protected async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 检查记录是否存在
   */
  protected async exists(
    table: string,
    conditions: Record<string, any>
  ): Promise<boolean> {
    const whereClause = Object.keys(conditions)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ');
    
    const values = Object.values(conditions);
    
    const result = await this.query(
      `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${whereClause})`,
      values
    );
    
    return result.rows[0].exists;
  }

  /**
   * 通用插入方法
   */
  protected async insert(
    table: string,
    data: Record<string, any>,
    returning: string = '*'
  ): Promise<any> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`);

    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING ${returning}
    `;

    const result = await this.query(query, values);
    return result.rows[0];
  }

  /**
   * 通用更新方法
   */
  protected async update(
    table: string,
    data: Record<string, any>,
    conditions: Record<string, any>,
    returning: string = '*'
  ): Promise<any> {
    const setClause = Object.keys(data)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const whereClause = Object.keys(conditions)
      .map((key, index) => `${key} = $${Object.keys(data).length + index + 1}`)
      .join(' AND ');

    const values = [...Object.values(data), ...Object.values(conditions)];

    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING ${returning}
    `;

    const result = await this.query(query, values);
    return result.rows[0];
  }

  /**
   * 通用删除方法
   */
  protected async delete(
    table: string,
    conditions: Record<string, any>
  ): Promise<boolean> {
    const whereClause = Object.keys(conditions)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ');
    
    const values = Object.values(conditions);

    const query = `DELETE FROM ${table} WHERE ${whereClause}`;
    const result = await this.query(query, values);
    
    return (result.rowCount || 0) > 0;
  }

  /**
   * 通用查找方法
   */
  protected async findOne(
    table: string,
    conditions: Record<string, any>,
    columns: string = '*'
  ): Promise<any | null> {
    const whereClause = Object.keys(conditions)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ');
    
    const values = Object.values(conditions);

    const query = `SELECT ${columns} FROM ${table} WHERE ${whereClause} LIMIT 1`;
    const result = await this.query(query, values);
    
    return result.rows[0] || null;
  }

  /**
   * 通用查找多条记录方法
   */
  protected async findMany(
    table: string,
    conditions: Record<string, any> = {},
    options: {
      columns?: string;
      orderBy?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<any[]> {
    const {
      columns = '*',
      orderBy,
      limit,
      offset,
    } = options;

    let query = `SELECT ${columns} FROM ${table}`;
    const values: any[] = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(' AND ');
      
      query += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    if (limit) {
      query += ` LIMIT $${values.length + 1}`;
      values.push(limit);
    }

    if (offset) {
      query += ` OFFSET $${values.length + 1}`;
      values.push(offset);
    }

    const result = await this.query(query, values);
    return result.rows;
  }
}