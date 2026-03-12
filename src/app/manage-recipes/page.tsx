'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useLanguageSafe } from '@/lib/use-language-safe';
import { t } from '@/lib/translations';

interface RecipeIngredient {
  id?: string;
  name: string;
  quantity: number;
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
  steps: string; // JSON string
  tags: string | null;
  ingredients: RecipeIngredient[];
}

export default function ManageRecipesPage() {
  const language = useLanguageSafe();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
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
    loadRecipes();
  }, []);

  async function loadRecipes() {
    try {
      setLoading(true);
      const res = await fetch('/api/recipes');
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
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
          quantity: parseFloat(ing.quantity) || 1,
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
        loadRecipes();
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
        loadRecipes();
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
    }
  }

  function handleEdit(recipe: Recipe) {
    setEditingId(recipe.id);
    const steps = typeof recipe.steps === 'string' ? JSON.parse(recipe.steps) : recipe.steps;
    setFormData({
      title: recipe.title,
      description: recipe.description || '',
      prepTimeMinutes: recipe.prepTimeMinutes.toString(),
      cookTimeMinutes: recipe.cookTimeMinutes.toString(),
      totalTimeMinutes: recipe.totalTimeMinutes.toString(),
      steps: Array.isArray(steps) ? steps.join('\n') : '',
      tags: recipe.tags || '',
      ingredients: recipe.ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity.toString(),
        unit: ing.unit,
        isOptional: ing.isOptional,
        isKeyIngredient: ing.isKeyIngredient,
      })),
    });
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{t(language, 'recipes.myRecipes')}</h1>
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
                <div key={idx} className="flex gap-2 items-end">
                  <input
                    type="text"
                    placeholder={t(language, 'recipes.ingredientName')}
                    value={ing.name}
                    onChange={(e) => {
                      const newIngs = [...formData.ingredients];
                      newIngs[idx].name = e.target.value;
                      setFormData({ ...formData, ingredients: newIngs });
                    }}
                    className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="flex items-center gap-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={ing.isOptional}
                      onChange={(e) => {
                        const newIngs = [...formData.ingredients];
                        newIngs[idx].isOptional = e.target.checked;
                        setFormData({ ...formData, ingredients: newIngs });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{t(language, 'recipes.isOptional')}</span>
                  </label>
                  <label className="flex items-center gap-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={ing.isKeyIngredient}
                      onChange={(e) => {
                        const newIngs = [...formData.ingredients];
                        newIngs[idx].isKeyIngredient = e.target.checked;
                        setFormData({ ...formData, ingredients: newIngs });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{t(language, 'recipes.isKeyIngredient')}</span>
                  </label>
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

      {/* Recipes List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">Loading...</div>
      ) : recipes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
          No recipes yet. Create your first recipe!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
              <h3 className="font-bold text-lg text-gray-800 mb-2">{recipe.title}</h3>
              {recipe.description && <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>}
              <div className="text-sm text-gray-500 mb-3">
                ⏱️ {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(recipe)}
                  className="text-blue-600 hover:text-blue-800 p-2 flex-1 flex items-center justify-center gap-2 bg-blue-50 rounded"
                >
                  <Edit2 size={16} />
                  {t(language, 'recipes.editRecipe')}
                </button>
                <button
                  onClick={() => handleDelete(recipe.id)}
                  className="text-red-600 hover:text-red-800 p-2 flex-1 flex items-center justify-center gap-2 bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                  {t(language, 'recipes.deleteRecipe')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
