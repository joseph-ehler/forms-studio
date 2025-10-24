/**
 * Vitest Config - Unit Tests
 * 
 * Fast unit tests for hooks, utils, and resolvers.
 * No browser or DOM required.
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // Environment
    environment: 'jsdom', // For React hooks
    
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/components/overlay/device-resolver.ts',
        'src/components/overlay/gesture-adapters.ts',
        'src/hooks/**/*.ts',
        'src/utils/**/*.ts'
      ],
      exclude: [
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.d.ts',
        '**/types.ts'
      ]
    },
    
    // Globals
    globals: true,
    
    // Test files
    include: ['tests/unit/**/*.test.ts'],
    
    // Timeout
    testTimeout: 5000,
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
