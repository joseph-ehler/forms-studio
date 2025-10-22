/**
 * White-Label Runtime API
 * 
 * Applies brand at runtime via data attributes + optional token overrides.
 * No rebuild required - instant brand switching via CSS cascade.
 */

export type BrandId = 'default' | 'acme' | 'techcorp' | 'sunset' | string

export type ThemeMode = 'light' | 'dark' | 'system'

export type TenantType = 'b2c' | 'b2b'

export interface BrandManifest {
  /** Brand identifier */
  id: BrandId
  
  /** Theme preference */
  theme: ThemeMode
  
  /** Tenant type (affects layout widths) */
  tenantType: TenantType
  
  /** Optional per-tenant token overrides */
  tokens?: Record<string, string>
  
  /** Brand assets */
  assets?: {
    logo?: string
    favicon?: string
    socialCard?: string
  }
}

/**
 * Apply brand at runtime
 * 
 * Sets data-brand, data-theme, data-tenant attributes
 * and applies optional per-tenant token overrides.
 * 
 * @example
 * ```typescript
 * applyBrand({
 *   id: 'acme',
 *   theme: 'system',
 *   tenantType: 'b2c',
 *   tokens: {
 *     '--ds-color-primary-bg': '#7c3aed',
 *   },
 *   assets: {
 *     logo: '/brands/acme/logo.svg',
 *   },
 * })
 * ```
 */
export function applyBrand(manifest: BrandManifest): void {
  const root = document.documentElement
  
  // Set brand attribute
  root.setAttribute('data-brand', manifest.id)
  
  // Set tenant type
  root.setAttribute('data-tenant', manifest.tenantType)
  
  // Set theme (compute system preference if needed)
  applyTheme(manifest.theme)
  
  // Apply optional per-tenant token overrides
  if (manifest.tokens) {
    for (const [key, value] of Object.entries(manifest.tokens)) {
      if (key.startsWith('--ds-')) {
        root.style.setProperty(key, value)
      } else {
        console.warn(`[applyBrand] Skipping invalid token: ${key} (must start with --ds-)`)
      }
    }
  }
  
  // Apply assets
  if (manifest.assets) {
    applyAssets(manifest.assets)
  }
  
  // Persist preferences
  persistBrandPreferences(manifest)
}

/**
 * Apply theme with system preference tracking
 */
function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  
  const setTheme = () => {
    if (theme === 'system') {
      root.setAttribute('data-theme', mql.matches ? 'dark' : 'light')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }
  
  setTheme()
  
  // Track system preference changes (if theme is 'system')
  if (theme === 'system') {
    mql.addEventListener('change', setTheme)
  }
}

/**
 * Apply brand assets (favicon, etc.)
 */
function applyAssets(assets: BrandManifest['assets']): void {
  if (!assets) return
  
  // Update favicon
  if (assets.favicon) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    
    link.href = assets.favicon
  }
  
  // Update social card (Open Graph)
  if (assets.socialCard) {
    let meta = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')
    
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('property', 'og:image')
      document.head.appendChild(meta)
    }
    
    meta.content = assets.socialCard
  }
}

/**
 * Persist brand preferences to localStorage
 */
function persistBrandPreferences(manifest: BrandManifest): void {
  try {
    localStorage.setItem('brandPref', manifest.id)
    localStorage.setItem('themePref', manifest.theme)
    localStorage.setItem('tenantPref', manifest.tenantType)
  } catch (err) {
    console.warn('[applyBrand] Failed to persist preferences:', err)
  }
}

/**
 * Load brand preferences from localStorage
 */
export function loadBrandPreferences(): Partial<BrandManifest> | null {
  try {
    const id = localStorage.getItem('brandPref')
    const theme = localStorage.getItem('themePref')
    const tenantType = localStorage.getItem('tenantPref')
    
    if (!id) return null
    
    return {
      id: id as BrandId,
      theme: (theme as ThemeMode) || 'system',
      tenantType: (tenantType as TenantType) || 'b2c',
    }
  } catch (err) {
    console.warn('[loadBrandPreferences] Failed to load:', err)
    return null
  }
}

/**
 * Get current brand from DOM
 */
export function getCurrentBrand(): BrandId {
  return document.documentElement.getAttribute('data-brand') as BrandId || 'default'
}

/**
 * Get current theme from DOM
 */
export function getCurrentTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light'
}

/**
 * Get current tenant type from DOM
 */
export function getCurrentTenant(): TenantType {
  return document.documentElement.getAttribute('data-tenant') as TenantType || 'b2c'
}

/**
 * Pre-paint script to prevent FOUC
 * Call this inline in <head> before any CSS loads
 * 
 * @example
 * ```html
 * <script>
 *   (function() {
 *     var brand = localStorage.getItem('brandPref') || window.__BRAND__ || 'default';
 *     var theme = localStorage.getItem('themePref') || 'system';
 *     var tenant = window.__TENANT__ || 'b2c';
 *     
 *     var root = document.documentElement;
 *     root.setAttribute('data-brand', brand);
 *     root.setAttribute('data-tenant', tenant);
 *     
 *     var dark = theme === 'dark' || (
 *       theme === 'system' && 
 *       matchMedia('(prefers-color-scheme: dark)').matches
 *     );
 *     root.setAttribute('data-theme', dark ? 'dark' : 'light');
 *   })();
 * </script>
 * ```
 */
export const prePaintScript = `
(function() {
  var brand = localStorage.getItem('brandPref') || window.__BRAND__ || 'default';
  var theme = localStorage.getItem('themePref') || 'system';
  var tenant = window.__TENANT__ || 'b2c';
  
  var root = document.documentElement;
  root.setAttribute('data-brand', brand);
  root.setAttribute('data-tenant', tenant);
  
  var dark = theme === 'dark' || (
    theme === 'system' && 
    matchMedia('(prefers-color-scheme: dark)').matches
  );
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
})();
`
