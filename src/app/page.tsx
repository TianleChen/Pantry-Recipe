'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, AlertCircle, ChefHat } from 'lucide-react';

interface DashboardData {
  totalIngredients: number;
  expiringIngredients: any[];
  topRecommendations: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [ingredRes, recomRes] = await Promise.all([
          fetch('/api/ingredients'),
          fetch('/api/recommendations'),
        ]);

        if (!ingredRes.ok || !recomRes.ok) throw new Error('Failed to load data');

        const ingredients = await ingredRes.json();
        const recommendations = await recomRes.json();

        // Find expiring ingredients
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const expiring = ingredients.filter((ing: any) => {
          if (!ing.expirationDate) return false;
          const expDate = new Date(ing.expirationDate);
          return expDate <= oneWeekFromNow && expDate > now;
        });

        setData({
          totalIngredients: ingredients.length,
          expiringIngredients: expiring.slice(0, 5),
          topRecommendations: recommendations.slice(0, 5),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
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
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">Welcome to Pantry Recipe</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Ingredients</p>
              <p className="text-3xl font-bold text-blue-600">{data?.totalIngredients || 0}</p>
            </div>
            <ChefHat className="w-10 h-10 text-blue-200" />
          </div>
          <Link href="/inventory" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            Manage inventory →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Expiring Soon</p>
              <p className="text-3xl font-bold text-orange-600">{data?.expiringIngredients.length || 0}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-orange-200" />
          </div>
          <p className="text-gray-600 text-xs mt-2">Within 7 days</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Recipe Ideas</p>
              <p className="text-3xl font-bold text-green-600">{data?.topRecommendations.length || 0}</p>
            </div>
            <Clock className="w-10 h-10 text-green-200" />
          </div>
          <Link href="/recipes" className="text-green-600 hover:underline text-sm mt-2 inline-block">
            Browse recipes →
          </Link>
        </div>
      </div>

      {/* Expiring Ingredients */}
      {data?.expiringIngredients.length ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Ingredients Expiring Soon
          </h2>
          <ul className="space-y-2">
            {data.expiringIngredients.map((ing: any) => (
              <li key={ing.id} className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-700">{ing.name}</span>
                <span className="text-orange-600 text-sm font-medium">
                  {new Date(ing.expirationDate).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Top Recommendations */}
      {data?.topRecommendations.length ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top Recipe Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.topRecommendations.map((rec: any) => (
              <Link
                key={rec.id}
                href={`/recipes/${rec.id}`}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-gray-800">{rec.title}</h3>
                <div className="flex gap-2 mt-2 text-sm">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    {rec.match_percentage}% match
                  </span>
                  <span className="text-gray-600">Score: {rec.match_score}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
          Add ingredients to your pantry to get recipe recommendations!
        </div>
      )}
    </div>
  );
}
