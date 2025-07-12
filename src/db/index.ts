import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';

const sqlite = new Database('./invoice.db');
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
migrate(db, { migrationsFolder: './drizzle' });
