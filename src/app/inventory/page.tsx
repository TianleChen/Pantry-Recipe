'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { useLanguageSafe } from '@/lib/use-language-safe';
import { t } from '@/lib/translations';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  expirationDate: string | null;
  notes: string | null;
}

export default function InventoryPage() {
  const language = useLanguageSafe();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'vegetables',
    quantity: '',
    unit: 'pcs',
    location: 'fridge',
    expirationDate: '',
    notes: '',
  });

  const categories = ['vegetables', 'meat', 'seafood', 'dairy', 'grains', 'condiments', 'snacks', 'frozen'];
  const locations = ['fridge', 'freezer', 'pantry', 'counter'];
  const units = ['pcs', 'g', 'kg', 'ml', 'L', 'pack', 'box'];

  // Load ingredients
  useEffect(() => {
    loadIngredients();
  }, [search, selectedCategory, selectedLocation, sortBy]);

  async function loadIngredients() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedLocation) params.append('location', selectedLocation);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/ingredients?${params}`);
      if (res.ok) {
        const data = await res.json();
        setIngredients(data);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.quantity) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const url = editingId ? `/api/ingredients/${editingId}` : '/api/ingredients';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          name: '',
          category: 'vegetables',
          quantity: '',
          unit: 'pcs',
          location: 'fridge',
          expirationDate: '',
          notes: '',
        });
        setEditingId(null);
        setShowForm(false);
        loadIngredients();
      }
    } catch (error) {
      console.error('Error saving ingredient:', error);
      alert('Failed to save ingredient');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return;

    try {
      const res = await fetch(`/api/ingredients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadIngredients();
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      alert('Failed to delete ingredient');
    }
  }

  function handleEdit(ingredient: Ingredient) {
    setEditingId(ingredient.id);
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      quantity: ingredient.quantity.toString(),
      unit: ingredient.unit,
      location: ingredient.location,
      expirationDate: ingredient.expirationDate ? ingredient.expirationDate.split('T')[0] : '',
      notes: ingredient.notes || '',
    });
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{t(language, 'inventory.title')}</h1>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder={t(language, 'inventory.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t(language, 'inventory.allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {t(language, `categories.${cat}`)}
              </option>
            ))}
          </select>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t(language, 'inventory.allLocations')}</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {t(language, `locations.${loc}`)}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">{t(language, 'inventory.sortByName')}</option>
            <option value="expiration">{t(language, 'inventory.sortByExpiration')}</option>
          </select>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: '',
              category: 'vegetables',
              quantity: '',
              unit: 'pcs',
              location: 'fridge',
              expirationDate: '',
              notes: '',
            });
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} />
          {t(language, 'inventory.addIngredient')}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold">
            {editingId ? t(language, 'inventory.editForm') : t(language, 'inventory.addForm')}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={t(language, 'inventory.ingredientName')}
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(language, `categories.${cat}`)}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder={t(language, 'inventory.quantity')}
              required
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {t(language, `locations.${loc}`)}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={formData.expirationDate}
              onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder={t(language, 'inventory.notes')}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-1 md:col-span-2"
            />
            <div className="col-span-1 md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                {editingId ? t(language, 'inventory.updateButton') : t(language, 'inventory.addButton')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                {t(language, 'inventory.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ingredients List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">{t(language, 'inventory.loading')}</div>
      ) : ingredients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">{t(language, 'inventory.noIngredientsFound')}</div>
      ) : (
        <>
          {/* Desktop table — hidden on mobile */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t(language, 'inventory.name')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t(language, 'inventory.category')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t(language, 'inventory.quantity')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t(language, 'inventory.location')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t(language, 'inventory.expires')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t(language, 'inventory.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ing) => (
                  <tr key={ing.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-medium">{ing.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm capitalize">{ing.category}</td>
                    <td className="px-4 py-3 text-gray-600">{ing.quantity} {ing.unit}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm capitalize">{ing.location}</td>
                    <td className="px-4 py-3 text-sm">
                      {ing.expirationDate ? (
                        <span className="text-orange-600">{new Date(ing.expirationDate).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => handleEdit(ing)} className="text-blue-600 hover:text-blue-800 p-1"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(ing.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards — visible only on mobile */}
          <div className="md:hidden space-y-3">
            {ingredients.map((ing) => (
              <div key={ing.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 text-lg">{ing.name}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(ing)} className="text-blue-600 hover:text-blue-800 p-1"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(ing.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-sm text-gray-600">
                  <div><span className="font-medium text-gray-700">{t(language, 'inventory.quantity')}:</span> {ing.quantity} {ing.unit}</div>
                  <div><span className="font-medium text-gray-700">{t(language, 'inventory.category')}:</span> <span className="capitalize">{ing.category}</span></div>
                  <div><span className="font-medium text-gray-700">{t(language, 'inventory.location')}:</span> <span className="capitalize">{ing.location}</span></div>
                  <div>
                    <span className="font-medium text-gray-700">{t(language, 'inventory.expires')}:</span>{' '}
                    {ing.expirationDate ? (
                      <span className="text-orange-600">{new Date(ing.expirationDate).toLocaleDateString()}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
