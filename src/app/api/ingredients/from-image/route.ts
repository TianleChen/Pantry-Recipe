/**
 * POST /api/ingredients/from-image
 * 
 * Extract ingredients from an image using Claude Vision.
 * 
 * Request:
 *   - image: File (multipart form data)
 *   - optional: location, category defaults
 * 
 * Response:
 *   - ingredients: Extracted items with quantities, units, etc.
 *   - ready for user confirmation before saving
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/llm';

const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported image format. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `Image too large. Max size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Convert image to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Get optional defaults from query/body
    const defaultLocation = formData.get('defaultLocation') as string || 'fridge';
    const defaultCategory = formData.get('defaultCategory') as string || 'vegetables';

    // Extract ingredients using LLM
    const llmProvider = getLLMProvider();
    const result = await llmProvider.extractIngredients(base64, file.type);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to extract ingredients' },
        { status: 500 }
      );
    }

    // Augment with defaults
    const ingredients = result.ingredients.map((ing) => ({
      ...ing,
      category: ing.category || defaultCategory,
      location: defaultLocation,
    }));

    return NextResponse.json(
      {
        success: true,
        ingredients,
        message: `Extracted ${ingredients.length} ingredients. Please review and confirm before saving.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/ingredients/from-image error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
