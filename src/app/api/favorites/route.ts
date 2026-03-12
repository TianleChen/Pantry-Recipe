import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const favorites = await prisma.favoriteRecipe.findMany({
      include: {
        recipe: {
          include: {
            ingredients: true,
          },
        },
      },
    });

    const recipes = favorites.map((f) => f.recipe);
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('GET /api/favorites error:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}
