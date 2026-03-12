import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the recipe with ingredients
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: true },
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Get current inventory
    const ingredients = await prisma.ingredient.findMany();
    const ingredientMap = new Map(
      ingredients.map((ing) => [ing.normalizedName, ing])
    );

    // Deduct ingredient quantities (handle gracefully if missing or insufficient)
    for (const recipeIng of recipe.ingredients) {
      const inventoryIng = ingredientMap.get(recipeIng.normalizedName);

      if (inventoryIng) {
        const newQuantity = inventoryIng.quantity - recipeIng.quantity;
        if (newQuantity < 0) {
          // Handle gracefully - reduce to 0 or just skip
          await prisma.ingredient.update({
            where: { id: inventoryIng.id },
            data: { quantity: 0 },
          });
        } else {
          await prisma.ingredient.update({
            where: { id: inventoryIng.id },
            data: { quantity: newQuantity },
          });
        }
      }
      // If ingredient not found in inventory, just skip
    }

    // Record the cooked recipe
    await prisma.cookedRecipe.create({
      data: { recipeId: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Recipe marked as cooked, ingredients updated',
    });
  } catch (error) {
    console.error('POST /api/recipes/[id]/cook error:', error);
    return NextResponse.json({ error: 'Failed to mark recipe as cooked' }, { status: 500 });
  }
}
