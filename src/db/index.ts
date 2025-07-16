import { getDatabase } from './json-adapter';

// Export database instance
export { getDatabase as getDb };

// For backward compatibility, export a default db instance
let dbInstance: any = null;

export const db = {
  async init() {
    if (!dbInstance) {
      dbInstance = await getDatabase();
    }
    return dbInstance;
  },
  
  async getInstance() {
    return await this.init();
  }
};
