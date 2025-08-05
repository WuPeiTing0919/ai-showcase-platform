import mysql from 'mysql2/promise';

// 資料庫配置
const dbConfig = {
  host: process.env.DB_HOST || 'mysql.theaken.com',
  port: parseInt(process.env.DB_PORT || '33306'),
  user: process.env.DB_USER || 'AI_Platform',
  password: process.env.DB_PASSWORD || 'Aa123456',
  database: process.env.DB_NAME || 'db_AI_Platform',
  charset: 'utf8mb4',
  timezone: '+08:00',
  // 連接池配置
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// 創建連接池
let pool: mysql.Pool | null = null;

export class Database {
  private static instance: Database;
  
  private constructor() {}
  
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
  
  // 獲取連接池
  public async getPool(): Promise<mysql.Pool> {
    if (!pool) {
      pool = mysql.createPool(dbConfig);
      
      // 測試連接
      try {
        const connection = await pool.getConnection();
        console.log('✅ 資料庫連接池建立成功');
        connection.release();
      } catch (error) {
        console.error('❌ 資料庫連接池建立失敗:', error);
        throw error;
      }
    }
    return pool;
  }
  
  // 執行查詢
  public async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const pool = await this.getPool();
    try {
      const [rows] = await pool.execute(sql, params);
      return rows as T[];
    } catch (error) {
      console.error('查詢執行失敗:', error);
      throw error;
    }
  }
  
  // 執行單一查詢 (返回第一筆結果)
  public async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }
  
  // 執行插入
  public async insert(table: string, data: Record<string, any>): Promise<number> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    const pool = await this.getPool();
    try {
      const [result] = await pool.execute(sql, values);
      return (result as any).insertId;
    } catch (error) {
      console.error('插入執行失敗:', error);
      throw error;
    }
  }
  
  // 執行更新
  public async update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<number> {
    const setColumns = Object.keys(data).map(col => `${col} = ?`).join(', ');
    const whereColumns = Object.keys(where).map(col => `${col} = ?`).join(' AND ');
    
    const sql = `UPDATE ${table} SET ${setColumns} WHERE ${whereColumns}`;
    const values = [...Object.values(data), ...Object.values(where)];
    
    const pool = await this.getPool();
    try {
      const [result] = await pool.execute(sql, values);
      return (result as any).affectedRows;
    } catch (error) {
      console.error('更新執行失敗:', error);
      throw error;
    }
  }
  
  // 執行刪除
  public async delete(table: string, where: Record<string, any>): Promise<number> {
    const whereColumns = Object.keys(where).map(col => `${col} = ?`).join(' AND ');
    const sql = `DELETE FROM ${table} WHERE ${whereColumns}`;
    const values = Object.values(where);
    
    const pool = await this.getPool();
    try {
      const [result] = await pool.execute(sql, values);
      return (result as any).affectedRows;
    } catch (error) {
      console.error('刪除執行失敗:', error);
      throw error;
    }
  }
  
  // 開始事務
  public async beginTransaction(): Promise<mysql.PoolConnection> {
    const pool = await this.getPool();
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    return connection;
  }
  
  // 提交事務
  public async commitTransaction(connection: mysql.PoolConnection): Promise<void> {
    await connection.commit();
    connection.release();
  }
  
  // 回滾事務
  public async rollbackTransaction(connection: mysql.PoolConnection): Promise<void> {
    await connection.rollback();
    connection.release();
  }
  
  // 關閉連接池
  public async close(): Promise<void> {
    if (pool) {
      await pool.end();
      pool = null;
      console.log('🔌 資料庫連接池已關閉');
    }
  }
  
  // 健康檢查
  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.queryOne('SELECT 1 as health');
      return result?.health === 1;
    } catch (error) {
      console.error('資料庫健康檢查失敗:', error);
      return false;
    }
  }
  
  // 獲取資料庫統計
  public async getDatabaseStats(): Promise<{
    tables: number;
    users: number;
    competitions: number;
    apps: number;
    judges: number;
  }> {
    try {
      const tablesResult = await this.queryOne(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ?
      `, [dbConfig.database]);
      
      const usersResult = await this.queryOne('SELECT COUNT(*) as count FROM users');
      const competitionsResult = await this.queryOne('SELECT COUNT(*) as count FROM competitions');
      const appsResult = await this.queryOne('SELECT COUNT(*) as count FROM apps');
      const judgesResult = await this.queryOne('SELECT COUNT(*) as count FROM judges');
      
      return {
        tables: tablesResult?.count || 0,
        users: usersResult?.count || 0,
        competitions: competitionsResult?.count || 0,
        apps: appsResult?.count || 0,
        judges: judgesResult?.count || 0
      };
    } catch (error) {
      console.error('獲取資料庫統計失敗:', error);
      throw error;
    }
  }
}

// 導出單例實例
export const db = Database.getInstance();

import bcrypt from 'bcrypt';

// 工具函數
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
}; 