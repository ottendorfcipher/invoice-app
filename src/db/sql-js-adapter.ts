import fs from 'fs';
import path from 'path';

// SQL.js database adapter
export class SQLiteAdapter {
  private db: any;
  private dbPath: string;
  private SQL: any;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  async init() {
    // Only initialize on server side
    if (typeof window === 'undefined') {
      try {
        // Dynamic import for server-side only
        const sqlJsModule = require('sql.js');
        const initSqlJs = sqlJsModule.default || sqlJsModule;
        
        this.SQL = await initSqlJs();

        // Load existing database or create new one
        let buffer: Buffer | null = null;
        try {
          if (fs.existsSync(this.dbPath)) {
            buffer = fs.readFileSync(this.dbPath);
          }
        } catch (error) {
          console.log('Creating new database file');
        }

        this.db = new this.SQL.Database(buffer);
        
        // Create tables if they don't exist
        await this.createTables();
      } catch (error) {
        console.error('Failed to initialize SQL.js:', error);
        throw error;
      }
    } else {
      throw new Error('SQLiteAdapter can only be used on the server side');
    }
  }

  private async createTables() {
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        invoiceNumber TEXT NOT NULL,
        status TEXT NOT NULL,
        issueDate TEXT NOT NULL,
        dueDate TEXT,
        currency TEXT NOT NULL DEFAULT 'USD',
        notes TEXT,
        customer TEXT NOT NULL,
        company TEXT NOT NULL,
        lineItems TEXT NOT NULL,
        subtotal REAL NOT NULL,
        tax REAL NOT NULL,
        total REAL NOT NULL,
        invoiceTitle TEXT DEFAULT 'Invoice',
        footerMessage TEXT DEFAULT 'Thank you for your business!',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        postalCode TEXT,
        country TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS companyProfiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        postalCode TEXT,
        country TEXT,
        logo TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      this.db.run(createTablesSQL);
      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
    }
  }

  async saveDatabase() {
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // Helper method to run a query
  run(sql: string, params: any[] = []) {
    try {
      const result = this.db.run(sql, params);
      this.saveDatabase(); // Save after each write operation
      return result;
    } catch (error) {
      console.error('Error running query:', error);
      throw error;
    }
  }

  // Helper method to get all results
  all(sql: string, params: any[] = []) {
    try {
      const stmt = this.db.prepare(sql);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (error) {
      console.error('Error getting all results:', error);
      throw error;
    }
  }

  // Helper method to get single result
  get(sql: string, params: any[] = []) {
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      if (stmt.step()) {
        const result = stmt.getAsObject();
        stmt.free();
        return result;
      }
      stmt.free();
      return null;
    } catch (error) {
      console.error('Error getting single result:', error);
      throw error;
    }
  }

  close() {
    if (this.db) {
      this.saveDatabase();
      this.db.close();
    }
  }
}

// Global database instance
let dbInstance: SQLiteAdapter | null = null;

export async function getDatabase() {
  if (!dbInstance) {
    const dbPath = path.resolve(process.cwd(), 'invoice.db');
    dbInstance = new SQLiteAdapter(dbPath);
    await dbInstance.init();
  }
  return dbInstance;
}
