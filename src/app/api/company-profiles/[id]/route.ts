import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companyProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await db.select().from(companyProfiles).where(eq(companyProfiles.id, id));
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return NextResponse.json({ error: 'Failed to fetch company profile' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // If this is being set as default, remove default from others
    if (body.isDefault) {
      await db.update(companyProfiles)
        .set({ isDefault: false })
        .where(eq(companyProfiles.isDefault, true));
    }
    
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    const result = await db
      .update(companyProfiles)
      .set(updateData)
      .where(eq(companyProfiles.id, id))
      .returning();
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating company profile:', error);
    return NextResponse.json({ error: 'Failed to update company profile' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await db
      .delete(companyProfiles)
      .where(eq(companyProfiles.id, id))
      .returning();
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Company profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting company profile:', error);
    return NextResponse.json({ error: 'Failed to delete company profile' }, { status: 500 });
  }
}
