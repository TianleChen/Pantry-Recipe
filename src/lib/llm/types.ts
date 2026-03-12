/**
 * LLM Provider Types
 * 
 * Define the interface for all LLM vision providers.
 * Implement this to add new providers (Gemini, GPT-4, etc.)
 */

export interface ExtractedIngredient {
  name: string;
  quantity: number;
  unit: string; // 'pcs', 'g', 'kg', 'ml', 'L', 'pack', 'box'
  category?: string; // 'vegetables', 'meat', 'dairy', etc.
  expiryDate?: string; // ISO date string
  notes?: string;
}

export interface ImageExtractionResult {
  success: boolean;
  ingredients: ExtractedIngredient[];
  error?: string;
}

export interface LLMProvider {
  /**
   * Extract ingredients from an image
   * @param imageBase64 - Base64 encoded image data
   * @param mimeType - Image MIME type (e.g., 'image/jpeg')
   * @returns Extracted ingredients or error
   */
  extractIngredients(
    imageBase64: string,
    mimeType: string
  ): Promise<ImageExtractionResult>;
}
