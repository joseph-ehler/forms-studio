/**
 * Palette Generation Cache (LRU)
 * Caches generated palettes to avoid redundant computation
 */

import type { GeneratedPalette } from './palette-generator';

export interface CacheKey {
  seed: string;
  theme: 'light' | 'dark';
  level: 'AA' | 'AAA';
  surfaceSignature: string;
  optionsHash: string;
}

/**
 * Compute surface signature for cache keying
 * Changes when surface colors change
 */
export function computeSurfaceSignature(
  surfaceY: number,
  theme: 'light' | 'dark'
): string {
  return `surf_${surfaceY.toFixed(6)}_${theme}`;
}

/**
 * Simple LRU cache for palette generation
 */
export class PaletteCache {
  private cache = new Map<string, GeneratedPalette>();
  private maxSize: number;
  private hits = 0;
  private misses = 0;
  
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }
  
  private computeSignature(key: CacheKey): string {
    return `${key.seed}:${key.theme}:${key.level}:${key.surfaceSignature}:${key.optionsHash}`;
  }
  
  get(key: CacheKey): GeneratedPalette | undefined {
    const sig = this.computeSignature(key);
    const cached = this.cache.get(sig);
    
    if (cached) {
      this.hits++;
      // Move to end (LRU)
      this.cache.delete(sig);
      this.cache.set(sig, cached);
      return cached;
    }
    
    this.misses++;
    return undefined;
  }
  
  set(key: CacheKey, palette: GeneratedPalette): void {
    const sig = this.computeSignature(key);
    
    // Evict oldest if at capacity (LRU)
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(sig, palette);
  }
  
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
  
  getStats(): { size: number; hits: number; misses: number; hitRate: number } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }
}

// Singleton cache instance
export const paletteCache = new PaletteCache();
