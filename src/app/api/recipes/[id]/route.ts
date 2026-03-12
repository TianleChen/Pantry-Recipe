import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: true,
        favorites: true,
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('GET /api/recipes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      prepTimeMinutes,
      cookTimeMinutes,
      totalTimeMinutes,
      steps,
      tags,
      ingredients,
    } = body;

    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: true },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Update recipe
    const updated = await prisma.recipe.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(prepTimeMinutes !== undefined && { prepTimeMinutes: parseInt(prepTimeMinutes) || 0 }),
        ...(cookTimeMinutes !== undefined && { cookTimeMinutes: parseInt(cookTimeMinutes) || 0 }),
        ...(totalTimeMinutes !== undefined && { totalTimeMinutes: parseInt(totalTimeMinutes) || 0 }),
        ...(steps !== undefined && { steps: JSON.stringify(steps) }),
        ...(tags !== undefined && { tags: tags?.trim() || null }),
      },
      include: {
        ingredients: true,
        favorites: true,
      },
    });

    // Update ingredients if provided
    if (ingredients) {
      // Delete old ingredients
      await prisma.recipeIngredient.deleteMany({
        where: { recipeId: id },
      });

      // Create new ingredients
      await prisma.recipeIngredient.createMany({
        data: ingredients.map((ing: any) => ({
          recipeId: id,
          ingredientName: ing.name,
          normalizedName: ing.name.toLowerCase(),
          quantity: parseFloat(ing.quantity) || 1,
          unit: ing.unit || 'pcs',
          isOptional: ing.isOptional || false,
          isKeyIngredient: ing.isKeyIngredient || false,
        })),
      });

      // Refetch to include updated ingredients
      const refetched = await prisma.recipe.findUnique({
        where: { id },
        include: {
          ingredients: true,
          favorites: true,
        },
      });
      return NextResponse.json(refetched);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/recipes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Delete recipe (CASCADE will handle related records)
    await prisma.recipe.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/recipes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
  }
}
