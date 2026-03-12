'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, CheckCircle, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useLanguageSafe } from '@/lib/use-language-safe';
import { t, Language } from '@/lib/translations';

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

interface RecipeIngredient {
  id?: string;
  name: string;
  quantity: number | string;
  unit: string;
  isOptional: boolean;
  isKeyIngredient: boolean;
}

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  steps: string;
  tags: string | null;
  ingredients: RecipeIngredient[];
}

export default function RecipesPage() {
  const language = useLanguageSafe();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prepTimeMinutes: '0',
    cookTimeMinutes: '0',
    totalTimeMinutes: '0',
    steps: '',
    tags: '',
    ingredients: [{ name: '', quantity: '', unit: 'pcs', isOptional: false, isKeyIngredient: false }],
  });

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    try {
      setLoading(true);
      const res = await fetch('/api/recommendations');
      if (!res.ok) throw new Error('Failed to load recommendations');
      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }

  function handleAddIngredient() {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { name: '', quantity: '', unit: 'pcs', isOptional: false, isKeyIngredient: false },
      ],
    });
  }

  function handleRemoveIngredient(index: number) {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Recipe title is required');
      return;
    }

    const validIngredients = formData.ingredients.filter((ing) => ing.name && ing.name.trim());

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        prepTimeMinutes: parseInt(formData.prepTimeMinutes) || 0,
        cookTimeMinutes: parseInt(formData.cookTimeMinutes) || 0,
        totalTimeMinutes: parseInt(formData.totalTimeMinutes) || 0,
        steps: formData.steps.split('\n').filter((s) => s.trim()),
        tags: formData.tags,
        ingredients: validIngredients.map((ing) => ({
          name: ing.name,
          quantity: parseFloat(ing.quantity as string) || 1,
          unit: ing.unit,
          isOptional: ing.isOptional,
          isKeyIngredient: ing.isKeyIngredient,
        })),
      };

      const url = editingId ? `/api/recipes/${editingId}` : '/api/recipes';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(editingId ? 'Recipe updated successfully' : 'Recipe created successfully');
        setFormData({
          title: '',
          description: '',
          prepTimeMinutes: '0',
          cookTimeMinutes: '0',
          totalTimeMinutes: '0',
          steps: '',
          tags: '',
          ingredients: [{ name: '', quantity: '', unit: 'pcs', isOptional: false, isKeyIngredient: false }],
        });
        setEditingId(null);
        setShowForm(false);
        loadRecommendations();
      } else {
        alert('Failed to save recipe');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadRecommendations();
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
    }
  }

  function handleEdit(recipe: Recommendation) {
    setEditingId(recipe.id);
    setFormData({
      title: recipe.title,
      description: recipe.description || '',
      prepTimeMinutes: recipe.prepTimeMinutes.toString(),
      cookTimeMinutes: recipe.cookTimeMinutes.toString(),
      totalTimeMinutes: recipe.totalTimeMinutes.toString(),
      steps: '',
      tags: '',
      ingredients: recipe.matched_ingredients.map((name) => ({
        name,
        quantity: '',
        unit: 'pcs',
        isOptional: false,
        isKeyIngredient: false,
      })),
    });
    setShowForm(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">{t(language, 'recipes.loadingRecipes')}</div>
      </div>
    );
  }

  const grouped = {
    can_cook: recommendations.filter((r) => r.category === 'can_cook'),
    almost_there: recommendations.filter((r) => r.category === 'almost_there'),
    use_soon: recommendations.filter((r) => r.category === 'use_soon'),
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{t(language, 'recipes.title')}</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              prepTimeMinutes: '0',
              cookTimeMinutes: '0',
              totalTimeMinutes: '0',
              steps: '',
              tags: '',
              ingredients: [{ name: '', quantity: '', unit: 'pcs', isOptional: false, isKeyIngredient: false }],
            });
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} />
          {t(language, 'recipes.addRecipe')}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold">
            {editingId ? t(language, 'recipes.editRecipe') : t(language, 'recipes.addRecipe')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder={t(language, 'recipes.recipeTitle')}
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder={t(language, 'recipes.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(language, 'recipes.prepTime')}
                </label>
                <input
                  type="number"
                  value={formData.prepTimeMinutes}
                  onChange={(e) => setFormData({ ...formData, prepTimeMinutes: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(language, 'recipes.cookTime')}
                </label>
                <input
                  type="number"
                  value={formData.cookTimeMinutes}
                  onChange={(e) => setFormData({ ...formData, cookTimeMinutes: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(language, 'recipes.totalTime')}
                </label>
                <input
                  type="number"
                  value={formData.totalTimeMinutes}
                  onChange={(e) => setFormData({ ...formData, totalTimeMinutes: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <textarea
              placeholder={t(language, 'recipes.steps')}
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />

            <input
              type="text"
              placeholder={t(language, 'recipes.tags')}
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Ingredients */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-bold">{t(language, 'recipes.addIngredient')}</h3>
              {formData.ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-end flex-wrap">
                  <input
                    type="text"
                    placeholder={t(language, 'recipes.ingredientName')}
                    value={ing.name}
                    onChange={(e) => {
                      const newIngs = [...formData.ingredients];
                      newIngs[idx].name = e.target.value;
                      setFormData({ ...formData, ingredients: newIngs });
                    }}
                    className="flex-1 min-w-48 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder={t(language, 'recipes.quantity')}
                    step="0.01"
                    value={ing.quantity}
                    onChange={(e) => {
                      const newIngs = [...formData.ingredients];
                      newIngs[idx].quantity = e.target.value;
                      setFormData({ ...formData, ingredients: newIngs });
                    }}
                    className="w-20 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={ing.unit}
                    onChange={(e) => {
                      const newIngs = [...formData.ingredients];
                      newIngs[idx].unit = e.target.value;
                      setFormData({ ...formData, ingredients: newIngs });
                    }}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>pcs</option>
                    <option>g</option>
                    <option>kg</option>
                    <option>ml</option>
                    <option>L</option>
                    <option>pack</option>
                    <option>box</option>
                  </select>
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddIngredient}
                className="mt-2 bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300"
              >
                + {t(language, 'recipes.addIngredient')}
              </button>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                {editingId ? t(language, 'recipes.updateRecipe') : t(language, 'recipes.saveRecipe')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                {t(language, 'recipes.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Can Cook Now */}
      {grouped.can_cook.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />
            {t(language, 'recipes.canCookNow')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.can_cook.map((rec) => (
              <RecipeCard key={rec.id} recipe={rec} language={language} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Almost There */}
      {grouped.almost_there.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-yellow-700">{t(language, 'recipes.almostThere')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.almost_there.map((rec) => (
              <RecipeCard key={rec.id} recipe={rec} language={language} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Use Soon */}
      {grouped.use_soon.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-orange-700">{t(language, 'recipes.useSoon')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.use_soon.map((rec) => (
              <RecipeCard key={rec.id} recipe={rec} language={language} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {recommendations.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-600">
          <p className="text-lg">{t(language, 'recipes.addIngredientsPrompt')}</p>
        </div>
      )}
    </div>
  );
}

function RecipeCard({
  recipe,
  language,
  onEdit,
  onDelete,
}: {
  recipe: Recommendation;
  language: Language;
  onEdit: (recipe: Recommendation) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 h-full flex flex-col">
      <Link href={`/recipes/${recipe.id}`} className="flex-1">
        <h3 className="font-bold text-lg text-gray-800 mb-2 hover:text-blue-600">{recipe.title}</h3>

        {recipe.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
        )}

        <div className="flex gap-2 mb-3 flex-wrap">
          <span
            className={`px-3 py-1 text-sm rounded-full font-medium ${
              recipe.match_percentage === 100
                ? 'bg-green-100 text-green-800'
                : recipe.match_percentage >= 75
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {recipe.match_percentage}% {t(language, 'recipes.match')}
          </span>
          {recipe.totalTimeMinutes > 0 && (
            <span className="flex items-center gap-1 text-gray-600 text-sm">
              <Clock size={14} />
              {recipe.totalTimeMinutes}m
            </span>
          )}
        </div>

        <p className="text-sm text-gray-700 mb-3">{recipe.recommendation_reason}</p>

        {recipe.missing_ingredients.length > 0 && (
          <div className="text-xs text-gray-600 mt-auto">
            <p className="font-semibold mb-1">{t(language, 'recipes.missing')} {recipe.missing_ingredients.length}</p>
            <p className="line-clamp-2">{recipe.missing_ingredients.join(', ')}</p>
          </div>
        )}
      </Link>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onEdit(recipe)}
          className="flex-1 text-blue-600 hover:text-blue-800 p-2 flex items-center justify-center gap-1 bg-blue-50 rounded text-sm font-medium"
        >
          <Edit2 size={16} />
          {t(language, 'recipes.editRecipe')}
        </button>
        <button
          onClick={() => onDelete(recipe.id)}
          className="flex-1 text-red-600 hover:text-red-800 p-2 flex items-center justify-center gap-1 bg-red-50 rounded text-sm font-medium"
        >
          <Trash2 size={16} />
          {t(language, 'recipes.deleteRecipe')}
        </button>
      </div>
    </div>
  );
}
