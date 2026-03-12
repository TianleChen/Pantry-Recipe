import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  match_score: number;
  match_percentage: number;
  matched_ingredients: string[];
  missing_ingredients: string[];
  recommendation_reason: string;
  category: 'can_cook' | 'almost_there' | 'use_soon';
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
}

export async function GET() {
  try {
    // Get all ingredients and recipes
    const [ingredients, recipes] = await Promise.all([
      prisma.ingredient.findMany(),
      prisma.recipe.findMany({
        include: { ingredients: true },
      }),
    ]);

    // Create a normalized ingredient map
    const ingredientMap = new Map(
      ingredients.map((ing) => [ing.normalizedName, ing])
    );

    // Score each recipe
    const recommendations: Recommendation[] = recipes
      .map((recipe) => {
        let score = 0;
        const matched: string[] = [];
        const missing: string[] = [];
        let expiringBonus = 0;
        let hasKeyIngredient = false;
        let missingKeyIngredient = false;

        for (const recIng of recipe.ingredients) {
          const invIng = ingredientMap.get(recIng.normalizedName);

          if (invIng && invIng.quantity > 0) {
            matched.push(recIng.ingredientName);

            // Scoring logic
            if (recIng.isKeyIngredient) {
              score += 20;
              hasKeyIngredient = true;
              // Bonus if expiring soon
              if (invIng.expirationDate) {
                const now = new Date();
                const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                if (invIng.expirationDate <= oneWeekFromNow && invIng.expirationDate > now) {
                  expiringBonus += 8;
                }
              }
            } else if (recIng.ingredientName.match(/salt|pepper|soy|oil|garlic|ginger/i)) {
              // Condiments/seasonings
              score += 3;
            } else {
              score += 10;
            }
          } else {
            missing.push(recIng.ingredientName);
            if (recIng.isKeyIngredient) {
              score -= 15;
              missingKeyIngredient = true;
            } else if (!recIng.isOptional) {
              score -= 5;
            }
          }
        }

        score += expiringBonus;

        // Determine category
        let category: 'can_cook' | 'almost_there' | 'use_soon';
        let reason = '';

        if (missing.length === 0) {
          category = 'can_cook';
          reason = 'You have all the ingredients!';
        } else if (missing.length <= 2 && !missingKeyIngredient) {
          category = 'almost_there';
          reason = `Only missing ${missing.length} ingredient(s)`;
        } else {
          category = 'use_soon';
          reason = expiringBonus > 0 ? 'Help use expiring ingredients' : 'Missing key ingredients';
        }

        // Calculate match percentage
        const totalIngredients = recipe.ingredients.length;
        const matchPercentage = totalIngredients > 0 ? Math.round((matched.length / totalIngredients) * 100) : 0;

        return {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description || '',
          match_score: Math.max(0, score),
          match_percentage: matchPercentage,
          matched_ingredients: matched,
          missing_ingredients: missing,
          recommendation_reason: reason,
          category,
          prepTimeMinutes: recipe.prepTimeMinutes,
          cookTimeMinutes: recipe.cookTimeMinutes,
          totalTimeMinutes: recipe.totalTimeMinutes,
        };
      })
      .sort((a, b) => {
        // Sort by category first
        const categoryOrder = { can_cook: 0, almost_there: 1, use_soon: 2 };
        const catDiff = categoryOrder[a.category] - categoryOrder[b.category];
        if (catDiff !== 0) return catDiff;

        // Then by score
        return b.match_score - a.match_score;
      });

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('GET /api/recommendations error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
