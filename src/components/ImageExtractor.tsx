'use client';

import { useState } from 'react';
import { Upload, X, Edit2, Loader } from 'lucide-react';
import { extractIngredientsFromImage, formatFileSize } from '@/lib/image-utils';

interface ExtractedIngredient {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  expiryDate?: string;
  notes?: string;
  location?: string;
}

interface ImageExtractorProps {
  onSaveComplete?: () => void;
  defaultLocation?: string;
  defaultCategory?: string;
}

const categories = ['vegetables', 'meat', 'seafood', 'dairy', 'grains', 'condiments', 'snacks', 'frozen'];
const locations = ['fridge', 'freezer', 'pantry', 'counter'];
const units = ['pcs', 'g', 'kg', 'ml', 'L', 'pack', 'box'];

export default function ImageExtractor({ onSaveComplete, defaultLocation = 'fridge', defaultCategory = 'vegetables' }: ImageExtractorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [ingredients, setIngredients] = useState<ExtractedIngredient[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  async function processFile(file: File) {
    setError('');

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size
    if (file.size > 25 * 1024 * 1024) {
      setError('Image is too large (max 25MB)');
      return;
    }

    setExtracting(true);
    const result = await extractIngredientsFromImage(file, {
      defaultLocation,
      defaultCategory,
    });
    setExtracting(false);

    if (result.success) {
      setIngredients(result.ingredients);
      setError('');
    } else {
      setError(result.error || 'Failed to extract ingredients');
      setIngredients([]);
    }
  }

  function updateIngredient(index: number, updates: Partial<ExtractedIngredient>) {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], ...updates };
    setIngredients(updated);
    setEditingIndex(null);
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (ingredients.length === 0) {
      setError('No ingredients to save');
      return;
    }

    setSaving(true);
    try {
      const promises = ingredients.map((ing) =>
        fetch('/api/ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            category: ing.category || defaultCategory,
            location: ing.location || defaultLocation,
            expirationDate: ing.expiryDate || null,
            notes: ing.notes || null,
          }),
        })
      );

      const results = await Promise.all(promises);
      const allSuccess = results.every((res) => res.ok);

      if (allSuccess) {
        setIngredients([]);
        setError('');
        if (onSaveComplete) {
          onSaveComplete();
        }
      } else {
        setError('Some ingredients failed to save. Please try again.');
      }
    } catch (err) {
      setError('Failed to save ingredients. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // If no ingredients extracted yet, show upload area
  if (ingredients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Quick Add from Image</h2>
        <p className="text-gray-600 text-sm">Upload a photo of your receipt, pantry shelf, or grocery bag to quickly add ingredients.</p>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" id="imageInput" />

          <label htmlFor="imageInput" className="cursor-pointer block">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="font-medium text-gray-700">Drag image here or click to upload</p>
            <p className="text-sm text-gray-500 mt-1">Supports JPEG, PNG, GIF, WebP (max 25MB)</p>
          </label>
        </div>

        {/* Loading State */}
        {extracting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-700">Analyzing image with Claude Vision...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Show extracted ingredients preview
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          {ingredients.length} Ingredient{ingredients.length !== 1 ? 's' : ''} Extracted
        </h2>
        <button
          onClick={() => setIngredients([])}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Ingredients List - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qty</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Expires</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                {editingIndex === idx ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => updateIngredient(idx, { name: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={ing.quantity}
                        onChange={(e) => updateIngredient(idx, { quantity: parseFloat(e.target.value) })}
                        step="0.01"
                        className="border rounded px-2 py-1 w-16"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={ing.unit}
                        onChange={(e) => updateIngredient(idx, { unit: e.target.value })}
                        className="border rounded px-2 py-1"
                      >
                        {units.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={ing.category || defaultCategory}
                        onChange={(e) => updateIngredient(idx, { category: e.target.value })}
                        className="border rounded px-2 py-1"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={ing.location || defaultLocation}
                        onChange={(e) => updateIngredient(idx, { location: e.target.value })}
                        className="border rounded px-2 py-1"
                      >
                        {locations.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={ing.expiryDate || ''}
                        onChange={(e) => updateIngredient(idx, { expiryDate: e.target.value })}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Done
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-gray-800 font-medium">{ing.name}</td>
                    <td className="px-4 py-3 text-gray-600">{ing.quantity}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{ing.unit}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm capitalize">{ing.category || defaultCategory}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm capitalize">{ing.location || defaultLocation}</td>
                    <td className="px-4 py-3 text-sm">
                      {ing.expiryDate ? (
                        <span className="text-orange-600">{new Date(ing.expiryDate).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => setEditingIndex(idx)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => removeIngredient(idx)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ingredients List - Mobile */}
      <div className="md:hidden space-y-3">
        {ingredients.map((ing, idx) => (
          <div key={idx} className="border rounded-lg p-4 space-y-2">
            {editingIndex === idx ? (
              <>
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(idx, { name: e.target.value })}
                  placeholder="Name"
                  className="border rounded px-3 py-2 w-full"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={ing.quantity}
                    onChange={(e) => updateIngredient(idx, { quantity: parseFloat(e.target.value) })}
                    step="0.01"
                    placeholder="Qty"
                    className="border rounded px-3 py-2"
                  />
                  <select
                    value={ing.unit}
                    onChange={(e) => updateIngredient(idx, { unit: e.target.value })}
                    className="border rounded px-3 py-2"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  value={ing.category || defaultCategory}
                  onChange={(e) => updateIngredient(idx, { category: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={ing.location || defaultLocation}
                  onChange={(e) => updateIngredient(idx, { location: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                >
                  {locations.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={ing.expiryDate || ''}
                  onChange={(e) => updateIngredient(idx, { expiryDate: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
                <button
                  onClick={() => setEditingIndex(null)}
                  className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 w-full"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800">{ing.name}</h3>
                  <button
                    onClick={() => removeIngredient(idx)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Qty:</span> {ing.quantity} {ing.unit}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> <span className="capitalize">{ing.category || defaultCategory}</span>
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> <span className="capitalize">{ing.location || defaultLocation}</span>
                  </div>
                  <div>
                    <span className="font-medium">Expires:</span>{' '}
                    {ing.expiryDate ? new Date(ing.expiryDate).toLocaleDateString() : '—'}
                  </div>
                </div>
                <button
                  onClick={() => setEditingIndex(idx)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mt-2"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {saving && <Loader className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : `Save All (${ingredients.length})`}
        </button>
        <button
          onClick={() => setIngredients([])}
          disabled={saving}
          className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 disabled:bg-gray-300"
        >
          Cancel
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center">
        Review extracted items above. Edit quantities, categories, or dates as needed before saving.
      </p>
    </div>
  );
}
