import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const db = await getDb();
    const result = db.get('SELECT * FROM customers WHERE id = ?', [id]);
    
    if (!result) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const db = await getDb();
    const body = await request.json();
    
    // Check if customer exists
    const existing = db.get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    const now = new Date().toISOString();
    
    db.run(`
      UPDATE customers SET
        name = ?, email = ?, address = ?, city = ?, state = ?,
        postalCode = ?, country = ?, updatedAt = ?
      WHERE id = ?
    `, [
      body.name || existing.name,
      body.email || existing.email,
      body.address || existing.address,
      body.city || existing.city,
      body.state || existing.state,
      body.postalCode || existing.postalCode,
      body.country || existing.country,
      now,
      id
    ]);
    
    const result = db.get('SELECT * FROM customers WHERE id = ?', [id]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const db = await getDb();
    
    // Check if customer exists
    const existing = db.get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    db.run('DELETE FROM customers WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
