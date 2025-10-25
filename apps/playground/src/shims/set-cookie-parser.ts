/**
 * Set-Cookie-Parser shim for Vite dev mode
 * 
 * React Router v7 imports 'set-cookie-parser' which is server-only.
 * This shim prevents Vite from choking during dev bundling.
 */

export const parse = () => [];
export const parseString = () => ({});
export const splitCookiesString = (str: string) => [str];
