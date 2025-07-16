import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const db = await getDb();
    const result = db.get('SELECT * FROM invoices WHERE id = ?', [id]);
    
    if (!result) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
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
    
    // Check if invoice exists
    const existing = db.get('SELECT * FROM invoices WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    const now = new Date().toISOString();
    
    db.run(`
      UPDATE invoices SET
        invoiceNumber = ?, status = ?, issueDate = ?, dueDate = ?,
        subtotal = ?, tax = ?, total = ?, currency = ?, customer = ?,
        company = ?, lineItems = ?, notes = ?, invoiceTitle = ?,
        footerMessage = ?, updatedAt = ?
      WHERE id = ?
    `, [
      body.invoiceNumber || existing.invoiceNumber,
      body.status || existing.status,
      body.issueDate || existing.issueDate,
      body.dueDate || existing.dueDate,
      body.subtotal || existing.subtotal,
      body.tax || existing.tax,
      body.total || existing.total,
      body.currency || existing.currency,
      typeof body.customer === 'object' ? JSON.stringify(body.customer) : body.customer || existing.customer,
      typeof body.company === 'object' ? JSON.stringify(body.company) : body.company || existing.company,
      typeof body.lineItems === 'object' ? JSON.stringify(body.lineItems) : body.lineItems || existing.lineItems,
      body.notes || existing.notes,
      body.invoiceTitle || existing.invoiceTitle,
      body.footerMessage || existing.footerMessage,
      now,
      id
    ]);
    
    const result = db.get('SELECT * FROM invoices WHERE id = ?', [id]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const db = await getDb();
    
    // Check if invoice exists
    const existing = db.get('SELECT * FROM invoices WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    db.run('DELETE FROM invoices WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
