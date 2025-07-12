import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companyProfiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    const result = await db.select().from(companyProfiles).orderBy(desc(companyProfiles.isDefault), desc(companyProfiles.createdAt));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching company profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch company profiles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // If this is being set as default, remove default from others
    if (body.isDefault) {
      await db.update(companyProfiles)
        .set({ isDefault: false })
        .where(eq(companyProfiles.isDefault, true));
    }
    
    const newCompanyProfile = {
      id: nanoid(),
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      postalCode: body.postalCode || null,
      country: body.country || null,
      logo: body.logo || null,
      isDefault: body.isDefault || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const result = await db.insert(companyProfiles).values(newCompanyProfile).returning();
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating company profile:', error);
    return NextResponse.json({ error: 'Failed to create company profile' }, { status: 500 });
  }
}
