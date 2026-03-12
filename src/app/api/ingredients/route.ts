import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const sortBy = searchParams.get('sortBy') || 'name';

    let where: any = {};

    if (search) {
      where.normalizedName = {
        contains: search.toLowerCase(),
      };
    }

    if (category) {
      where.category = category;
    }

    if (location) {
      where.location = location;
    }

    let orderBy: any = { name: 'asc' };
    if (sortBy === 'expiration') {
      orderBy = { expirationDate: 'asc' };
    }

    const ingredients = await prisma.ingredient.findMany({
      where,
      orderBy,
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('GET /api/ingredients error:', error);
    return NextResponse.json({ error: 'Failed to fetch ingredients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, quantity, unit, location, expirationDate, notes } = body;

    if (!name || !category || !quantity || !unit || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        normalizedName: name.toLowerCase(),
        category,
        quantity: parseFloat(quantity),
        unit,
        location,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        notes: notes || null,
      },
    });

    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    console.error('POST /api/ingredients error:', error);
    return NextResponse.json({ error: 'Failed to create ingredient' }, { status: 500 });
  }
}
