/**
 * Hall of Pain V2: Nasty Seed Tests
 * 
 * Tests the new V2 generator with edge cases:
 * - Ultra-light seeds (near-white)
 * - Ultra-dark seeds (near-black)
 * - Neon/high-chroma seeds
 * - Yellow/Amber/Lime (text policy)
 */

import { describe, it, expect } from 'vitest';
import { generatePalette, getRoleTokens } from '../palette-generator';

const EPS = 1e-3;

describe('Hall of Pain V2: Nasty Seeds', () => {
  
  describe('Yellow/Amber/Lime (Text Policy)', () => {
    it('Pure yellow (#FFFF00) uses black text on solid', () => {
      const palette = generatePalette('#FFFF00', { theme: 'light', level: 'AA' });
      
      expect(palette).not.toBeNull();
      expect(palette!.solid.text).toBe('black');
      expect(palette!.solid.contrast).toBeGreaterThanOrEqual(4.5 - EPS);
    });
    
    it('Amber uses black text on solid', () => {
      const palette = generatePalette('#FFC107', { theme: 'light', level: 'AA' });
      
      expect(palette).not.toBeNull();
      expect(palette!.solid.text).toBe('black');
      expect(palette!.solid.contrast).toBeGreaterThanOrEqual(4.5 - EPS);
    });
    
    it('Yellow in dark mode still uses black text', () => {
      const palette = generatePalette('#FFFF00', { theme: 'dark', level: 'AA' });
      
      expect(palette).not.toBeNull();
      expect(palette!.solid.text).toBe('black');
      expect(palette!._diagnostics.textPolicy).toBe('Yellow/Amber/Lime');
    });
  });
  
  describe('Near-White Seeds', () => {
    const nearWhiteSeeds = ['#FEFEFE', '#F6F6F6', '#FCFCFC'];
    
    nearWhiteSeeds.forEach(seed => {
      it(`${seed} (light): subtle meets 3:1 vs surface`, () => {
        const palette = generatePalette(seed, { theme: 'light' });
        
        expect(palette).not.toBeNull();
        expect(palette!._diagnostics.headroom.subtleUiVsSurface).toBeGreaterThanOrEqual(0);
      });
      
      it(`${seed} (light): subtle meets 7:1 AAA for text`, () => {
        const palette = generatePalette(seed, { theme: 'light' });
        
        expect(palette).not.toBeNull();
        expect(palette!.subtle.contrast).toBeGreaterThanOrEqual(7.0 - EPS);
      });
    });
  });
  
  describe('Near-Black Seeds', () => {
    const nearBlackSeeds = ['#0A0A0A', '#050505', '#030303'];
    
    nearBlackSeeds.forEach(seed => {
      it(`${seed} (dark): subtle meets 3:1 vs surface`, () => {
        const palette = generatePalette(seed, { theme: 'dark' });
        
        expect(palette).not.toBeNull();
        expect(palette!._diagnostics.headroom.subtleUiVsSurface).toBeGreaterThanOrEqual(0);
      });
      
      it(`${seed} (dark): solid meets AA`, () => {
        const palette = generatePalette(seed, { theme: 'dark' });
        
        expect(palette).not.toBeNull();
        expect(palette!.solid.contrast).toBeGreaterThanOrEqual(4.5 - EPS);
      });
    });
  });
  
  describe('Neon/High-Chroma Seeds', () => {
    const neonSeeds = [
      { name: 'Neon Green', hex: '#39FF14' },
      { name: 'Hot Pink', hex: '#FF1493' },
      { name: 'Electric Red', hex: '#FE1B15' },
    ];
    
    neonSeeds.forEach(({ name, hex }) => {
      it(`${name} (${hex}): reports chroma compression`, () => {
        const palette = generatePalette(hex, { theme: 'light' });
        
        expect(palette).not.toBeNull();
        // Neon seeds likely need chroma compression
        // (test will pass even if not compressed, just verifies the flag exists)
        expect(palette!._diagnostics.chromaCompressed).toBeDefined();
      });
      
      it(`${name} (${hex}): solid meets AA`, () => {
        const palette = generatePalette(hex, { theme: 'light' });
        
        expect(palette).not.toBeNull();
        expect(palette!.solid.contrast).toBeGreaterThanOrEqual(4.5 - EPS);
      });
    });
  });
  
  describe('Vibrant Accent', () => {
    it('includes vibrant by default', () => {
      const palette = generatePalette('#FF5733', { theme: 'light' });
      
      expect(palette).not.toBeNull();
      expect(palette!.vibrant).toBeDefined();
      expect(palette!.vibrant!.role).toBe('vibrant-accent');
      expect(palette!.vibrant!.warning).toBe('NO_TEXT_ALLOWED');
    });
    
    it('excludes vibrant when includeVibrant=false', () => {
      const palette = generatePalette('#FF5733', { 
        theme: 'light',
        includeVibrant: false,
      });
      
      expect(palette).not.toBeNull();
      expect(palette!.vibrant).toBeUndefined();
    });
  });
  
  describe('Diagnostics', () => {
    it('reports feasible interval width', () => {
      const palette = generatePalette('#3B82F6', { theme: 'light' });
      
      expect(palette).not.toBeNull();
      expect(palette!._diagnostics.feasibleIntervalWidth).toBeGreaterThan(0);
    });
    
    it('reports headroom for solid and subtle', () => {
      const palette = generatePalette('#10B981', { theme: 'light' });
      
      expect(palette).not.toBeNull();
      expect(palette!._diagnostics.headroom.solidTextVsBg).toBeGreaterThan(0);
      expect(palette!._diagnostics.headroom.subtleTextVsBg).toBeGreaterThan(0);
    });
    
    it('includes generator version', () => {
      const palette = generatePalette('#8B5CF6', { theme: 'light' });
      
      expect(palette).not.toBeNull();
      expect(palette!._diagnostics.generatorVersion).toBe('v2.0.0');
    });
  });
  
  describe('Determinism', () => {
    it('same input produces same output', () => {
      const seed = '#FF5733';
      const options = { theme: 'light' as const, deterministicSeed: 42 };
      
      const p1 = generatePalette(seed, options);
      const p2 = generatePalette(seed, options);
      
      expect(p1).not.toBeNull();
      expect(p2).not.toBeNull();
      expect(p1!.solid.bg).toBe(p2!.solid.bg);
      expect(p1!.subtle.bg).toBe(p2!.subtle.bg);
    });
  });
  
  describe('Caching', () => {
    it('uses cache on repeated calls', () => {
      const seed = '#4169E1';
      const options = { theme: 'light' as const };
      
      const p1 = generatePalette(seed, options);
      const t1 = p1!._diagnostics.computeTimeMs;
      
      const p2 = generatePalette(seed, options);
      const t2 = p2!._diagnostics.computeTimeMs;
      
      // Second call should be from cache (same reference)
      expect(p1).toBe(p2);
    });
  });
  
  describe('Contract Status (Quick UI Feedback)', () => {
    it('reports all contract checks', () => {
      const palette = generatePalette('#3B82F6', { theme: 'light' });
      
      expect(palette).not.toBeNull();
      expect(palette!.contract).toBeDefined();
      expect(palette!.contract.subtleAAA).toBe(true);
      expect(palette!.contract.subtleUI3).toBe(true);
      expect(palette!.contract.solidAA).toBe(true);
      expect(palette!.contract.headroomOk).toBe(true);
    });
    
    it('shows pass/fail for each contract', () => {
      const palette = generatePalette('#10B981', { theme: 'light', level: 'AA' });
      
      expect(palette).not.toBeNull();
      // All should pass for a good seed
      expect(palette!.contract.subtleAAA).toBe(true);
      expect(palette!.contract.subtleUI3).toBe(true);
      expect(palette!.contract.solidAA).toBe(true);
    });
  });
  
  describe('Surface Signature', () => {
    it('includes surface signature in diagnostics', () => {
      const palette = generatePalette('#8B5CF6', { theme: 'light' });
      
      expect(palette).not.toBeNull();
      expect(palette!._diagnostics.surfaceSignature).toBeDefined();
      expect(palette!._diagnostics.surfaceSignature).toContain('surf_');
      expect(palette!._diagnostics.surfaceSignature).toContain('light');
    });
    
    it('differs between themes', () => {
      const lightPalette = generatePalette('#FF5733', { theme: 'light' });
      const darkPalette = generatePalette('#FF5733', { theme: 'dark' });
      
      expect(lightPalette!._diagnostics.surfaceSignature).not.toBe(
        darkPalette!._diagnostics.surfaceSignature
      );
    });
  });
  
  describe('SDK Wrapper (getRoleTokens)', () => {
    it('returns CSS custom properties', () => {
      const tokens = getRoleTokens('#3B82F6');
      
      expect(tokens).not.toBeNull();
      expect(tokens!['--role-primary-subtle-bg']).toBeDefined();
      expect(tokens!['--role-primary-subtle-text']).toBeDefined();
      expect(tokens!['--role-primary-solid-bg']).toBeDefined();
      expect(tokens!['--role-primary-solid-text']).toBeDefined();
      expect(tokens!['--role-primary-solid-hover']).toBeDefined();
    });
    
    it('includes vibrant by default', () => {
      const tokens = getRoleTokens('#FF5733');
      
      expect(tokens).not.toBeNull();
      expect(tokens!['--role-primary-vibrant']).toBeDefined();
    });
    
    it('uses deterministic seed by default', () => {
      const t1 = getRoleTokens('#4169E1');
      const t2 = getRoleTokens('#4169E1');
      
      expect(t1!['--role-primary-solid-bg']).toBe(t2!['--role-primary-solid-bg']);
    });
    
    it('allows option overrides', () => {
      const tokens = getRoleTokens('#10B981', { 
        theme: 'dark',
        includeVibrant: false,
      });
      
      expect(tokens).not.toBeNull();
      expect(tokens!['--role-primary-vibrant']).toBeUndefined();
    });
    
    it('normalizes text to hex', () => {
      const tokens = getRoleTokens('#FFFF00'); // Yellow
      
      expect(tokens).not.toBeNull();
      expect(tokens!['--role-primary-solid-text']).toBe('#000000'); // Black for yellow
    });
  });
});
