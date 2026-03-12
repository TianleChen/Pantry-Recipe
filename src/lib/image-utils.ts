/**
 * Image Compression & Utility Functions
 * 
 * Client-side utilities for preparing images before sending to LLM.
 * Reduces API token usage by compressing to max 1280x1024.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
}

/**
 * Compress an image file to reduce token usage
 * 
 * Default: 1280x1024 at 80% quality
 * This saves ~50% API tokens while preserving legibility
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1280,
    maxHeight = 1024,
    quality = 0.8,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxWidth;
            height = Math.round(width / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(height * aspectRatio);
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get image file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Extract ingredients from image via API
 */
export async function extractIngredientsFromImage(
  file: File,
  options?: {
    defaultLocation?: string;
    defaultCategory?: string;
  }
): Promise<{
  success: boolean;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    category?: string;
    expiryDate?: string;
    notes?: string;
    location?: string;
  }>;
  message?: string;
  error?: string;
}> {
  try {
    // Compress image before sending
    const compressed = await compressImage(file);

    // Create form data
    const formData = new FormData();
    formData.append('image', compressed, 'image.jpg');

    if (options?.defaultLocation) {
      formData.append('defaultLocation', options.defaultLocation);
    }
    if (options?.defaultCategory) {
      formData.append('defaultCategory', options.defaultCategory);
    }

    // Send to API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

    try {
      const response = await fetch('/api/ingredients/from-image', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          ingredients: [],
          error: error.error || 'Failed to extract ingredients',
        };
      }

      return await response.json();
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle abort/timeout specifically
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return {
          success: false,
          ingredients: [],
          error: 'Request took too long. Please try with a smaller or simpler image.',
        };
      }
      
      throw fetchError;
    }
  } catch (error) {
    return {
      success: false,
      ingredients: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
