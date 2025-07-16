import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const db = await getDb();
    const result = db.get('SELECT * FROM companyProfiles WHERE id = ?', [id]);
    
    if (!result) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }
    
    return NextResponse.json(result);
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
    const db = await getDb();
    
    // If this is being set as default, remove default from others
    if (body.isDefault) {
      const allCompanies = db.all('SELECT * FROM companyProfiles');
      for (const company of allCompanies) {
        if (company.id !== id && company.isDefault) {
          db.updateRecord('companyProfiles', company.id, { isDefault: false });
        }
      }
    }
    
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    const result = db.updateRecord('companyProfiles', id, updateData);
    
    if (!result) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }
    
    return NextResponse.json(result);
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
    const db = await getDb();
    const result = db.deleteRecord('companyProfiles', id);
    
    if (!result) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Company profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting company profile:', error);
    return NextResponse.json({ error: 'Failed to delete company profile' }, { status: 500 });
  }
}
