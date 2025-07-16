import fs from 'fs';
import path from 'path';

interface DatabaseData {
  invoices: any[];
  customers: any[];
  companyProfiles: any[];
}

// JSON file database adapter for development
export class JSONAdapter {
  private dbPath: string;
  private data: DatabaseData;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.data = {
      invoices: [],
      customers: [],
      companyProfiles: []
    };
  }

  async init() {
    // Only initialize on server side
    if (typeof window === 'undefined') {
      try {
        // Load existing database or create new one
        if (fs.existsSync(this.dbPath)) {
          const fileContent = fs.readFileSync(this.dbPath, 'utf8');
          this.data = JSON.parse(fileContent);
        } else {
          await this.saveDatabase();
        }
        
        console.log('JSON database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize JSON database:', error);
        throw error;
      }
    } else {
      throw new Error('JSONAdapter can only be used on the server side');
    }
  }

  async saveDatabase() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // Helper method to run a query (simplified for basic operations)
  run(sql: string, params: any[] = []) {
    try {
      const sqlLower = sql.toLowerCase().trim();
      
      if (sqlLower.startsWith('insert into invoices')) {
        const invoice = this.parseInsertParams(params);
        this.data.invoices.push(invoice);
        this.saveDatabase();
        return { lastInsertRowid: invoice.id };
      }
      
      if (sqlLower.startsWith('insert into customers')) {
        const customer = this.parseInsertCustomerParams(params);
        this.data.customers.push(customer);
        this.saveDatabase();
        return { lastInsertRowid: customer.id };
      }
      
      if (sqlLower.startsWith('insert into companyprofiles')) {
        const company = this.parseInsertCompanyParams(params);
        this.data.companyProfiles.push(company);
        this.saveDatabase();
        return { lastInsertRowid: company.id };
      }
      
      // Handle UPDATE operations
      if (sqlLower.startsWith('update invoices')) {
        const invoiceId = params[params.length - 1]; // ID is usually the last parameter
        const invoiceIndex = this.data.invoices.findIndex(inv => inv.id === invoiceId);
        if (invoiceIndex !== -1) {
          // Update invoice based on the provided data
          const updates = this.parseUpdateParams(sqlLower, params);
          this.data.invoices[invoiceIndex] = { ...this.data.invoices[invoiceIndex], ...updates, updatedAt: new Date().toISOString() };
          this.saveDatabase();
          return { changes: 1 };
        }
        return { changes: 0 };
      }
      
      if (sqlLower.startsWith('update customers')) {
        const customerId = params[params.length - 1];
        const customerIndex = this.data.customers.findIndex(cust => cust.id === customerId);
        if (customerIndex !== -1) {
          const updates = this.parseUpdateParams(sqlLower, params);
          this.data.customers[customerIndex] = { ...this.data.customers[customerIndex], ...updates };
          this.saveDatabase();
          return { changes: 1 };
        }
        return { changes: 0 };
      }
      
      if (sqlLower.startsWith('update companyprofiles')) {
        const companyId = params[params.length - 1];
        const companyIndex = this.data.companyProfiles.findIndex(comp => comp.id === companyId);
        if (companyIndex !== -1) {
          const updates = this.parseUpdateParams(sqlLower, params);
          this.data.companyProfiles[companyIndex] = { ...this.data.companyProfiles[companyIndex], ...updates };
          this.saveDatabase();
          return { changes: 1 };
        }
        return { changes: 0 };
      }
      
      // Handle DELETE operations
      if (sqlLower.startsWith('delete from invoices')) {
        const invoiceId = params[0];
        const initialLength = this.data.invoices.length;
        this.data.invoices = this.data.invoices.filter(inv => inv.id !== invoiceId);
        this.saveDatabase();
        return { changes: initialLength - this.data.invoices.length };
      }
      
      if (sqlLower.startsWith('delete from customers')) {
        const customerId = params[0];
        const initialLength = this.data.customers.length;
        this.data.customers = this.data.customers.filter(cust => cust.id !== customerId);
        this.saveDatabase();
        return { changes: initialLength - this.data.customers.length };
      }
      
      if (sqlLower.startsWith('delete from companyprofiles')) {
        const companyId = params[0];
        const initialLength = this.data.companyProfiles.length;
        this.data.companyProfiles = this.data.companyProfiles.filter(comp => comp.id !== companyId);
        this.saveDatabase();
        return { changes: initialLength - this.data.companyProfiles.length };
      }
      
      return {};
    } catch (error) {
      console.error('Error running query:', error);
      throw error;
    }
  }
  
  // Helper method to update a record directly
  updateRecord(table: string, id: string, data: any): any {
    try {
      if (table === 'invoices') {
        const index = this.data.invoices.findIndex(item => item.id === id);
        if (index !== -1) {
          this.data.invoices[index] = { ...this.data.invoices[index], ...data, updatedAt: new Date().toISOString() };
          this.saveDatabase();
          return this.data.invoices[index];
        }
      } else if (table === 'customers') {
        const index = this.data.customers.findIndex(item => item.id === id);
        if (index !== -1) {
          this.data.customers[index] = { ...this.data.customers[index], ...data, updatedAt: new Date().toISOString() };
          this.saveDatabase();
          return this.data.customers[index];
        }
      } else if (table === 'companyProfiles') {
        const index = this.data.companyProfiles.findIndex(item => item.id === id);
        if (index !== -1) {
          this.data.companyProfiles[index] = { ...this.data.companyProfiles[index], ...data, updatedAt: new Date().toISOString() };
          this.saveDatabase();
          return this.data.companyProfiles[index];
        }
      }
      return null;
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  }
  
  // Helper method to delete a record directly
  deleteRecord(table: string, id: string): boolean {
    try {
      if (table === 'invoices') {
        const initialLength = this.data.invoices.length;
        this.data.invoices = this.data.invoices.filter(item => item.id !== id);
        this.saveDatabase();
        return initialLength > this.data.invoices.length;
      } else if (table === 'customers') {
        const initialLength = this.data.customers.length;
        this.data.customers = this.data.customers.filter(item => item.id !== id);
        this.saveDatabase();
        return initialLength > this.data.customers.length;
      } else if (table === 'companyProfiles') {
        const initialLength = this.data.companyProfiles.length;
        this.data.companyProfiles = this.data.companyProfiles.filter(item => item.id !== id);
        this.saveDatabase();
        return initialLength > this.data.companyProfiles.length;
      }
      return false;
    } catch (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  }
  
  // Helper method to parse update parameters (simplified)
  private parseUpdateParams(sql: string, params: any[]): any {
    // This is a simplified parser - in a real app you'd want more robust SQL parsing
    const updates: any = {};
    
    // For now, we'll assume the data is passed as an object in the first parameter
    if (params.length > 0 && typeof params[0] === 'object') {
      return params[0];
    }
    
    // Parse invoice update parameters based on the SQL structure
    if (sql.includes('update invoices set') && params.length >= 16) {
      return {
        invoiceNumber: params[0],
        status: params[1],
        issueDate: params[2],
        dueDate: params[3],
        subtotal: params[4],
        tax: params[5],
        total: params[6],
        currency: params[7],
        customer: params[8],
        company: params[9],
        lineItems: params[10],
        notes: params[11],
        invoiceTitle: params[12],
        footerMessage: params[13]
        // params[14] is updatedAt (handled separately)
        // params[15] is the ID (handled separately)
      };
    }
    
    return updates;
  }

  // Helper method to get all results
  all(sql: string, params: any[] = []): any[] {
    try {
      const sqlLower = sql.toLowerCase().trim();
      
      if (sqlLower.includes('from invoices')) {
        let result = [...this.data.invoices];
        
        // Handle status filter
        if (params.length > 0 && sqlLower.includes('where status = ?')) {
          result = result.filter(invoice => invoice.status === params[0]);
        }
        
        // Sort by createdAt DESC
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return result;
      }
      
      if (sqlLower.includes('from customers')) {
        return [...this.data.customers];
      }
      
      if (sqlLower.includes('from companyprofiles')) {
        return [...this.data.companyProfiles];
      }
      
      return [];
    } catch (error) {
      console.error('Error getting all results:', error);
      throw error;
    }
  }

  // Helper method to get single result
  get(sql: string, params: any[] = []): any | null {
    try {
      const sqlLower = sql.toLowerCase().trim();
      
      if (sqlLower.includes('from invoices')) {
        const invoice = this.data.invoices.find(inv => inv.id === params[0]);
        return invoice || null;
      }
      
      if (sqlLower.includes('from customers')) {
        const customer = this.data.customers.find(cust => cust.id === params[0]);
        return customer || null;
      }
      
      if (sqlLower.includes('from companyprofiles')) {
        const company = this.data.companyProfiles.find(comp => comp.id === params[0]);
        return company || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting single result:', error);
      throw error;
    }
  }

  private parseInsertParams(params: any[]): any {
    return {
      id: params[0],
      invoiceNumber: params[1],
      status: params[2],
      issueDate: params[3],
      dueDate: params[4],
      subtotal: params[5],
      tax: params[6],
      total: params[7],
      currency: params[8],
      customer: params[9],
      company: params[10],
      lineItems: params[11],
      notes: params[12],
      invoiceTitle: params[13],
      footerMessage: params[14],
      createdAt: params[15],
      updatedAt: params[16]
    };
  }

  private parseInsertCustomerParams(params: any[]): any {
    return {
      id: params[0],
      name: params[1],
      email: params[2],
      address: params[3],
      city: params[4],
      state: params[5],
      postalCode: params[6],
      country: params[7],
      createdAt: params[8] || new Date().toISOString(),
      updatedAt: params[9] || new Date().toISOString()
    };
  }

  private parseInsertCompanyParams(params: any[]): any {
    return {
      id: params[0],
      name: params[1],
      email: params[2],
      address: params[3],
      city: params[4],
      state: params[5],
      postalCode: params[6],
      country: params[7],
      logo: params[8],
      createdAt: params[9] || new Date().toISOString(),
      updatedAt: params[10] || new Date().toISOString()
    };
  }

  close() {
    // Save database when closing
    this.saveDatabase();
  }
}

// Global database instance
let dbInstance: JSONAdapter | null = null;

export async function getDatabase() {
  if (!dbInstance) {
    const dbPath = path.resolve(process.cwd(), 'invoice-data.json');
    dbInstance = new JSONAdapter(dbPath);
    await dbInstance.init();
  }
  return dbInstance;
}
