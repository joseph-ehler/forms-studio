/**
 * Cookie shim for Vite dev mode
 * 
 * React Router v7 imports 'cookie' package which is server-only.
 * This shim prevents Vite from choking during dev bundling.
 */

export const parse = () => ({});
export const serialize = () => '';
