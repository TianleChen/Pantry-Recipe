'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ChefHat, Clock, AlertCircle } from 'lucide-react';
import { useLanguageSafe } from '@/lib/use-language-safe';
import { t } from '@/lib/translations';

interface RecipeIngredient {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  isOptional: boolean;
  isKeyIngredient: boolean;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  steps: string;
  tags: string;
  ingredients: RecipeIngredient[];
  favorites: any[];
}

interface Recommendation {
  id: string;
  matched_ingredients: string[];
  missing_ingredients: string[];
  match_percentage: number;
  match_score: number;
  recommendation_reason: string;
}

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const language = useLanguageSafe();
  const [id, setId] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [cooking, setCooking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        setLoading(true);

        // Fetch recipe
        const recipeRes = await fetch(`/api/recipes/${id}`);
        if (!recipeRes.ok) throw new Error('Recipe not found');
        const recipeData = await recipeRes.json();
        setRecipe(recipeData);
        setIsFavorited(recipeData.favorites.length > 0);

        // Fetch recommendations to get scoring data
        const recomRes = await fetch('/api/recommendations');
        if (recomRes.ok) {
          const recomData = await recomRes.json();
          const match = recomData.find((r: any) => r.id === id);
          if (match) {
            setRecommendation(match);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipe');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function handleFavorite() {
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const res = await fetch(`/api/favorites/${id}`, { method });
      if (res.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite');
    }
  }

  async function handleCook() {
    try {
      setCooking(true);
      const res = await fetch(`/api/recipes/${id}/cook`, { method: 'POST' });
      if (res.ok) {
        alert('Recipe marked as cooked! Ingredients have been updated.');
        router.push('/inventory');
      } else {
        alert('Failed to mark recipe as cooked');
      }
    } catch (error) {
      console.error('Error cooking recipe:', error);
      alert('Error marking recipe as cooked');
    } finally {
      setCooking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">{t(language, 'recipes.loadingRecipes')}</div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error: {error || t(language, 'recipeDetail.notFound')}
      </div>
    );
  }

  const steps = JSON.parse(recipe.steps || '[]');
  const tagList = recipe.tags ? recipe.tags.split(',').map((t) => t.trim()) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{recipe.title}</h1>
            {recipe.description && (
              <p className="text-lg text-gray-600">{recipe.description}</p>
            )}
          </div>
          <button
            onClick={handleFavorite}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Heart
              size={32}
              className={isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}
            />
          </button>
        </div>

        {/* Time and Tags */}
        <div className="flex gap-4 flex-wrap mb-4">
          {recipe.prepTimeMinutes > 0 && (
            <div className="flex items-center gap-2 text-gray-700">
              <Clock size={18} />
              <span>{t(language, 'recipeDetail.prep')}</span> {recipe.prepTimeMinutes}m
            </div>
          )}
          {recipe.cookTimeMinutes > 0 && (
            <div className="flex items-center gap-2 text-gray-700">
              <ChefHat size={18} />
              <span>{t(language, 'recipeDetail.cook')}</span> {recipe.cookTimeMinutes}m
            </div>
          )}
          {recipe.totalTimeMinutes > 0 && (
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <Clock size={18} />
              <span>{t(language, 'recipeDetail.total')}</span> {recipe.totalTimeMinutes}m
            </div>
          )}
        </div>

        {/* Tags */}
        {tagList.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {tagList.map((tag) => (
              <span key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recommendation Info */}
      {recommendation && (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-bold text-lg text-blue-900 mb-2">{recommendation.recommendation_reason}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 font-semibold">{t(language, 'recipes.match')}</p>
                  <p className="text-2xl font-bold text-blue-600">{recommendation.match_percentage}%</p>
                </div>
                <div>
                  <p className="text-blue-700 font-semibold">{t(language, 'inventory.quantity')}</p>
                  <p className="text-2xl font-bold text-blue-600">{recommendation.match_score}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ingredients */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t(language, 'recipeDetail.ingredients')}</h2>
        <div className="space-y-3">
          {recipe.ingredients.map((ing) => {
            const isMatched = recommendation?.matched_ingredients.includes(ing.ingredientName);
            const isMissing = recommendation?.missing_ingredients.includes(ing.ingredientName);

            return (
              <div
                key={ing.id}
                className={`p-3 rounded-lg border-l-4 ${
                  isMatched
                    ? 'bg-green-50 border-green-400'
                    : isMissing
                    ? 'bg-red-50 border-red-400'
                    : 'bg-gray-50 border-gray-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{ing.ingredientName}</p>
                    <p className="text-sm text-gray-600">
                      {ing.quantity} {ing.unit}
                      {ing.isKeyIngredient && <span className="ml-2 text-yellow-600">{t(language, 'recipeDetail.key')}</span>}
                      {ing.isOptional && <span className="ml-2 text-gray-500">{t(language, 'recipeDetail.optional')}</span>}
                    </p>
                  </div>
                  <span className="text-xs font-semibold">
                    {isMatched ? (
                      <span className="text-green-700 bg-green-100 px-2 py-1 rounded">{t(language, 'recipeDetail.have')}</span>
                    ) : isMissing ? (
                      <span className="text-red-700 bg-red-100 px-2 py-1 rounded">{t(language, 'recipeDetail.missing')}</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t(language, 'recipeDetail.instructions')}</h2>
          <ol className="space-y-3">
            {steps.map((step: string, idx: number) => (
              <li key={idx} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {idx + 1}
                </span>
                <span className="text-gray-700 pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleCook}
          disabled={cooking}
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
        >
          {cooking ? t(language, 'recipeDetail.marking') : t(language, 'recipeDetail.markAsCooked')}
        </button>
        <a
          href="/recipes"
          className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 text-center font-semibold"
        >
          {t(language, 'recipeDetail.backToRecipes')}
        </a>
      </div>
    </div>
  );
}
