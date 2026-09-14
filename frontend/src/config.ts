/**
 * Frontend Configuration & API Client Base
 *
 * In local development, calls default to relative '/api' (proxied by Vite).
 * On Vercel, set VITE_API_URL=https://your-railway-api.up.railway.app
 */
export const API_BASE = (import.meta as any).env?.VITE_API_URL
  ? ((import.meta as any).env.VITE_API_URL as string).replace(/\/$/, '')
  : '';

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}
