/**
 * Claude Vision Provider
 * 
 * Uses Anthropic's Claude Vision API to extract ingredients from images.
 * Handles image compression and API communication.
 */

import { LLMProvider, ImageExtractionResult } from './types';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: Array<{
    type: string;
    text?: string;
    source?: {
      type: 'base64';
      media_type: string;
      data: string;
    };
  }>;
}

export class ClaudeVisionProvider implements LLMProvider {
  private apiKey: string;
  private model: string = 'claude-3-5-sonnet-20241022';

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
  }

  async extractIngredients(
    imageBase64: string,
    mimeType: string
  ): Promise<ImageExtractionResult> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mimeType,
                    data: imageBase64,
                  },
                },
                {
                  type: 'text',
                  text: this.getExtractionPrompt(),
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.content[0];

      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return this.parseIngredients(content.text);
    } catch (error) {
      console.error('Claude Vision extraction error:', error);
      return {
        success: false,
        ingredients: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getExtractionPrompt(): string {
    return `You are a kitchen inventory assistant. Analyze this image and extract all visible food items/ingredients.

For each item found, provide the following in JSON format:
{
  "ingredients": [
    {
      "name": "Item name",
      "quantity": number,
      "unit": "pcs|g|kg|ml|L|pack|box",
      "category": "vegetables|meat|seafood|dairy|grains|condiments|snacks|frozen",
      "expiryDate": "YYYY-MM-DD or null",
      "notes": "optional notes"
    }
  ]
}

Guidelines:
- Extract ONLY food items, not packaging or non-food items
- For packaged items, use quantity=1 and unit="pack" unless you can read exact weight/amount
- For loose items (vegetables, fruits), estimate quantity and use "pcs" (pieces)
- Try to infer expiry date from visible text on packaging (e.g., "Best By", "Use By", "Exp Date")
- Use ISO date format (YYYY-MM-DD) for expiry dates
- Be conservative with categories - use best judgment
- Return ONLY valid JSON, no markdown formatting or extra text

If no food items are visible, return: {"ingredients": []}`;
  }

  private parseIngredients(jsonText: string): ImageExtractionResult {
    try {
      // Extract JSON from the response (in case there's surrounding text)
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          success: false,
          ingredients: [],
          error: 'Could not find JSON in response',
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const ingredients = parsed.ingredients || [];

      // Validate and sanitize ingredients
      const validated = ingredients
        .filter((ing: any) => ing.name && ing.quantity && ing.unit)
        .map((ing: any) => ({
          name: String(ing.name).trim(),
          quantity: Math.max(0.1, Number(ing.quantity) || 1),
          unit: this.normalizeUnit(ing.unit),
          category: ing.category || 'vegetables',
          expiryDate: ing.expiryDate || undefined,
          notes: ing.notes || undefined,
        }));

      return {
        success: true,
        ingredients: validated,
      };
    } catch (error) {
      console.error('JSON parse error:', error);
      return {
        success: false,
        ingredients: [],
        error: 'Failed to parse ingredients from response',
      };
    }
  }

  private normalizeUnit(unit: string): string {
    const normalized = String(unit).toLowerCase().trim();
    const validUnits = ['pcs', 'g', 'kg', 'ml', 'L', 'pack', 'box'];
    return validUnits.includes(normalized) ? normalized : 'pcs';
  }
}

// Singleton instance
let instance: ClaudeVisionProvider;

export function getClaudeProvider(): ClaudeVisionProvider {
  if (!instance) {
    instance = new ClaudeVisionProvider();
  }
  return instance;
}
