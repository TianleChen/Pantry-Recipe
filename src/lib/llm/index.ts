/**
 * LLM Provider Factory
 * 
 * Centralized interface for all vision LLM providers.
 * Easily switch between Claude, Gemini, GPT-4, etc.
 */

import { LLMProvider } from './types';
import { getClaudeProvider } from './claude';

// Export types for use throughout the app
export type { LLMProvider, ImageExtractionResult, ExtractedIngredient } from './types';

/**
 * Get the active LLM provider
 * 
 * To switch providers:
 * 1. Add provider implementation to this directory
 * 2. Import it here
 * 3. Update this function to return the desired provider
 * 
 * Example: Add Gemini
 * ----
 * import { getGeminiProvider } from './gemini';
 * 
 * export function getLLMProvider(): LLMProvider {
 *   const provider = process.env.LLM_PROVIDER || 'claude';
 *   
 *   switch (provider) {
 *     case 'gemini':
 *       return getGeminiProvider();
 *     case 'claude':
 *     default:
 *       return getClaudeProvider();
 *   }
 * }
 */
export function getLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || 'claude';

  switch (provider) {
    case 'claude':
    default:
      return getClaudeProvider();
    // TODO: Add more providers
    // case 'gemini':
    //   return getGeminiProvider();
    // case 'gpt4':
    //   return getGPT4Provider();
  }
}
