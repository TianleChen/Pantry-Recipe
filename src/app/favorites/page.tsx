'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import { useLanguageSafe } from '@/lib/use-language-safe';
import { t } from '@/lib/translations';

interface Recipe {
  id: string;
  title: string;
  description: string;
  totalTimeMinutes: number;
}

export default function FavoritesPage() {
  const language = useLanguageSafe();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      setLoading(true);
      const res = await fetch('/api/favorites');
      if (!res.ok) throw new Error('Failed to load favorites');
      const data = await res.json();
      setFavorites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFavorites(favorites.filter((f) => f.id !== id));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">{t(language, 'favorites.loadingFavorites')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{t(language, 'favorites.title')}</h1>

      {favorites.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-600 space-y-4">
          <Heart className="w-12 h-12 mx-auto text-gray-300" />
          <p className="text-lg">{t(language, 'favorites.noFavorites')}</p>
          <p className="text-sm">
            <Link href="/recipes" className="text-blue-600 hover:underline">
              {t(language, 'recipes.title')}
            </Link>
            {' and '}{t(language, 'favorites.browseFavorites').split(' and ')[1]}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="block hover:text-blue-600"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{recipe.title}</h2>
                  {recipe.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
                  )}
                </Link>

                {recipe.totalTimeMinutes > 0 && (
                  <p className="text-sm text-gray-600 mb-4">⏱️ {recipe.totalTimeMinutes} minutes</p>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center text-sm font-medium"
                  >
                    {t(language, 'favorites.viewRecipe')}
                  </Link>
                  <button
                    onClick={() => handleRemove(recipe.id)}
                    className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
