import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        ingredients: true,
        favorites: true,
      },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('GET /api/recipes error:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      prepTimeMinutes = 0,
      cookTimeMinutes = 0,
      totalTimeMinutes = 0,
      steps = [],
      tags = '',
      ingredients = [],
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const recipe = await prisma.recipe.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        prepTimeMinutes: parseInt(prepTimeMinutes) || 0,
        cookTimeMinutes: parseInt(cookTimeMinutes) || 0,
        totalTimeMinutes: parseInt(totalTimeMinutes) || 0,
        steps: JSON.stringify(steps),
        tags: tags?.trim() || null,
        ingredients: {
          create: ingredients.map((ing: any) => ({
            ingredientName: ing.name,
            normalizedName: ing.name.toLowerCase(),
            quantity: parseFloat(ing.quantity) || 1,
            unit: ing.unit || 'pcs',
            isOptional: ing.isOptional || false,
            isKeyIngredient: ing.isKeyIngredient || false,
          })),
        },
      },
      include: {
        ingredients: true,
        favorites: true,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('POST /api/recipes error:', error);
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
  }
}
