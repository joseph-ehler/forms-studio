/**
 * Deterministic Random Number Generator
 * Ensures same input → same output via seeded PRNG
 */

/**
 * Simple Linear Congruential Generator (LCG)
 * Used for deterministic tie-breaking when multiple solutions are equally valid
 */
export class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  /**
   * Generate next random number in [0, 1)
   * Uses LCG: X_n+1 = (a * X_n + c) mod m
   */
  next(): number {
    // Numerical Recipes parameters
    const a = 1664525;
    const c = 1013904223;
    const m = 0x100000000; // 2^32
    
    this.seed = (this.seed * a + c) % m;
    return this.seed / m;
  }
  
  /**
   * Generate random number in range [min, max)
   */
  nextInRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  
  /**
   * Reset seed
   */
  reset(seed: number): void {
    this.seed = seed;
  }
}

/**
 * Hash a string to a seed number
 * Used to convert color hex → deterministic seed
 */
export function hashToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
