import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, customers } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    
    let result;
    
    if (status) {
      result = await db.select().from(invoices)
        .where(eq(invoices.status, status as any))
        .orderBy(desc(invoices.createdAt));
    } else {
      result = await db.select().from(invoices)
        .orderBy(desc(invoices.createdAt));
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate invoice number if not provided
    const invoiceNumber = body.invoiceNumber || `INV-${Date.now()}`;
    
    const newInvoice = {
      id: nanoid(),
      invoiceNumber,
      status: body.status || 'draft',
      issueDate: body.issueDate || new Date().toISOString().split('T')[0],
      dueDate: body.dueDate,
      subtotal: body.subtotal || 0,
      tax: body.tax || 0,
      total: body.total || 0,
      currency: body.currency || 'USD',
      customer: JSON.stringify(body.customer || {}),
      company: JSON.stringify(body.company || {}),
      lineItems: JSON.stringify(body.lineItems || []),
      notes: body.notes,
      template: body.template || 'default',
      noteBlocks: body.noteBlocks ? JSON.stringify(body.noteBlocks) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const result = await db.insert(invoices).values(newInvoice).returning();
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
