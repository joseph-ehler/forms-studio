/**
 * Pre-Merge Sanity Check
 * Run this before merging PR #1
 */

import { describe, it, expect } from 'vitest';
import { getRoleTokens, generatePalette } from '../palette-generator';

const DEMO_SEEDS = [
  { name: 'Pale Lemon', hex: '#FFF9C4' },
  { name: 'Corporate Navy', hex: '#002B5C' },
  { name: 'Electric Magenta', hex: '#FF00FF' },
  { name: 'Forest Green', hex: '#2D5016' },
];

describe('Pre-Merge Sanity Check', () => {
  
  describe('SDK Wrapper - All Demo Seeds', () => {
    DEMO_SEEDS.forEach(({ name, hex }) => {
      it(`${name} (${hex}) - Light: all contracts pass`, () => {
        const palette = generatePalette(hex, { theme: 'light' });
        
        expect(palette).not.toBeNull();
        expect(palette!.contract.solidAA).toBe(true);
        expect(palette!.contract.subtleAAA).toBe(true);
        expect(palette!.contract.subtleUI3).toBe(true);
        expect(palette!.contract.headroomOk).toBe(true);
      });
      
      it(`${name} (${hex}) - Dark: all contracts pass`, () => {
        const palette = generatePalette(hex, { theme: 'dark' });
        
        expect(palette).not.toBeNull();
        expect(palette!.contract.solidAA).toBe(true);
        expect(palette!.contract.subtleAAA).toBe(true);
        expect(palette!.contract.subtleUI3).toBe(true);
        expect(palette!.contract.headroomOk).toBe(true);
      });
    });
  });
  
  describe('Surface Signature Differs Across Themes', () => {
    DEMO_SEEDS.forEach(({ name, hex }) => {
      it(`${name} (${hex}) - surfaceSignature differs light vs dark`, () => {
        const light = generatePalette(hex, { theme: 'light' });
        const dark = generatePalette(hex, { theme: 'dark' });
        
        expect(light!._diagnostics.surfaceSignature).not.toBe(
          dark!._diagnostics.surfaceSignature
        );
        expect(light!._diagnostics.surfaceSignature).toContain('light');
        expect(dark!._diagnostics.surfaceSignature).toContain('dark');
      });
    });
  });
  
  describe('SDK Returns Normalized Tokens', () => {
    it('Yellow returns #000000 for solid text (not "black")', () => {
      const tokens = getRoleTokens('#FFFF00');
      
      expect(tokens).not.toBeNull();
      expect(tokens!['--role-primary-solid-text']).toBe('#000000');
    });
    
    it('Blue returns #FFFFFF for solid text (not "white")', () => {
      const tokens = getRoleTokens('#3B82F6');
      
      expect(tokens).not.toBeNull();
      expect(tokens!['--role-primary-solid-text']).toBe('#FFFFFF');
    });
  });
  
  describe('All Demo Seeds Work in SDK', () => {
    DEMO_SEEDS.forEach(({ name, hex }) => {
      it(`${name} (${hex}) - returns valid tokens`, () => {
        const tokens = getRoleTokens(hex);
        
        expect(tokens).not.toBeNull();
        expect(tokens!['--role-primary-subtle-bg']).toMatch(/^#[0-9A-F]{6}$/i);
        expect(tokens!['--role-primary-subtle-text']).toMatch(/^#[0-9A-F]{6}$/i);
        expect(tokens!['--role-primary-solid-bg']).toMatch(/^#[0-9A-F]{6}$/i);
        expect(tokens!['--role-primary-solid-text']).toMatch(/^#[0-9A-F]{6}$/i);
        expect(tokens!['--role-primary-solid-hover']).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });
});
