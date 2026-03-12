# LLM Vision Providers

This directory contains implementations for different vision LLM providers. The app is built to make switching providers easy.

## Current Implementation

- **Claude 3.5 Sonnet** (Primary)
  - Cost: ~$0.005-0.01 per image
  - Quality: Excellent
  - Speed: Fast

## How to Add a New Provider

### 1. Create Provider Implementation

Create a new file, e.g. `src/lib/llm/gemini.ts`:

```typescript
import { LLMProvider, ImageExtractionResult } from './types';

export class GeminiVisionProvider implements LLMProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('GOOGLE_API_KEY is not set');
    }
  }

  async extractIngredients(
    imageBase64: string,
    mimeType: string
  ): Promise<ImageExtractionResult> {
    // Implement Gemini API call
    // Parse response into ExtractedIngredient format
    // Return ImageExtractionResult
  }
}

export function getGeminiProvider(): GeminiVisionProvider {
  return new GeminiVisionProvider();
}
```

### 2. Update Factory

Edit `src/lib/llm/index.ts` to support the new provider:

```typescript
import { getGeminiProvider } from './gemini';

export function getLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || 'claude';

  switch (provider) {
    case 'gemini':
      return getGeminiProvider();
    case 'claude':
    default:
      return getClaudeProvider();
  }
}
```

### 3. Configure Environment

Add API key to `.env`:

```bash
ANTHROPIC_API_KEY=sk-...
GOOGLE_API_KEY=AIza...
LLM_PROVIDER=gemini  # or 'claude'
```

## Provider Comparison

| Provider | Cost/Image | Quality | Speed | Setup |
|----------|-----------|---------|-------|-------|
| **Claude** | $0.005-0.01 | Excellent | Fast | Easy |
| **Gemini** | $0.005-0.008 | Good | Fast | Easy |
| **GPT-4 Vision** | $0.01-0.02 | Excellent | Fast | Easy |
| **Local (Ollama)** | $0 | Fair | Slow | Complex |

## Implementation Requirements

Every provider must:

1. **Implement `LLMProvider` interface**
   ```typescript
   extractIngredients(imageBase64: string, mimeType: string): Promise<ImageExtractionResult>
   ```

2. **Return structured data**
   - `success: boolean` — extraction worked
   - `ingredients: ExtractedIngredient[]` — parsed items
   - `error?: string` — error message if failed

3. **Parse into consistent format**
   ```typescript
   {
     name: string;
     quantity: number;
     unit: 'pcs' | 'g' | 'kg' | 'ml' | 'L' | 'pack' | 'box';
     category?: 'vegetables' | 'meat' | 'seafood' | 'dairy' | 'grains' | 'condiments' | 'snacks' | 'frozen';
     expiryDate?: string; // ISO date: "2026-03-20"
     notes?: string;
   }
   ```

## Extraction Prompt Template

All providers should extract ingredients with:
- **Item name** — What is it?
- **Quantity** — How much? (e.g., 2.5)
- **Unit** — What's the measurement? (pcs, g, kg, ml, L, pack, box)
- **Category** — What type? (vegetables, meat, dairy, etc.)
- **Expiry date** — When does it expire? (optional, ISO format)
- **Notes** — Any additional info? (optional)

Adjust prompts per provider, but maintain consistent output format.

## Testing New Providers

```bash
# 1. Implement provider
# 2. Update LLM_PROVIDER env var
# 3. Test with sample image:

curl -X POST http://localhost:3000/api/ingredients/from-image \
  -F "image=@test-image.jpg"

# 4. Verify response format is correct
```

## Cost Optimization Tips

1. **Compress images** — Max 1280x1024 reduces token usage ~50%
2. **Batch requests** — Process multiple images together if possible
3. **Cache results** — Don't re-process same image
4. **Choose cheaper provider** — Gemini is ~$0.001-0.002 cheaper per image

## Known Issues & Workarounds

### Claude
- Large images (>5MP) cost 2x tokens
  - Solution: Compress in `image-utils.ts` (already done)

### Gemini
- Sometimes returns plain text instead of JSON
  - Solution: Parse text, then try JSON.parse as fallback

### GPT-4
- Slower responses (~3-5s)
  - Solution: Add timeout handling, show spinner

## Future: Local Models

For privacy/offline use, consider:
- **Ollama + LLaVA** — Free, runs locally, ~5-10s per image
- **GGML + Mistral** — Similar to above
- **MLX on Apple Silicon** — Native, fast local processing

Setup would require significant changes to route, but interface remains the same.

---

**Questions?** Check the implementation in `claude.ts` for reference.
