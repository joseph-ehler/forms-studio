/**
 * Test Setup - Capacitor Stub
 * 
 * Provides safe Capacitor global for testing.
 * Allows keyboard/haptics code paths to run without errors.
 */

// Stub Capacitor for tests
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Capacitor = {
    isNativePlatform: () => true,
    getPlatform: () => 'ios',
    // Add more stubs as needed
  };
}

// Stub Keyboard plugin
if (typeof globalThis !== 'undefined' && !(globalThis as any).Keyboard) {
  (globalThis as any).Keyboard = {
    addListener: () => ({
      remove: () => {},
    }),
  };
}

// Stub Haptics plugin
if (typeof globalThis !== 'undefined' && !(globalThis as any).Haptics) {
  (globalThis as any).Haptics = {
    impact: () => Promise.resolve(),
  };
}

export {};
