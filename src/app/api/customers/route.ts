import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    
    let result;
    
    if (search) {
      result = db.all(
        'SELECT * FROM customers WHERE name LIKE ? ORDER BY createdAt DESC',
        [`%${search}%`]
      );
    } else {
      result = db.all(
        'SELECT * FROM customers ORDER BY createdAt DESC'
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    
    const id = nanoid();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO customers (
        id, name, email, address, city, state, postalCode, country, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      body.name,
      body.email || null,
      body.address || null,
      body.city || null,
      body.state || null,
      body.postalCode || null,
      body.country || null,
      now,
      now
    ]);
    
    const result = db.get('SELECT * FROM customers WHERE id = ?', [id]);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
