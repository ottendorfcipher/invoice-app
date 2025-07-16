import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const result = db.all(
      'SELECT * FROM companyProfiles ORDER BY createdAt DESC'
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching company profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch company profiles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    
    const id = nanoid();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO companyProfiles (
        id, name, email, address, city, state, postalCode, country, logo, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      body.name,
      body.email || null,
      body.address || null,
      body.city || null,
      body.state || null,
      body.postalCode || null,
      body.country || null,
      body.logo || null,
      now,
      now
    ]);
    
    const result = db.get('SELECT * FROM companyProfiles WHERE id = ?', [id]);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating company profile:', error);
    return NextResponse.json({ error: 'Failed to create company profile' }, { status: 500 });
  }
}
