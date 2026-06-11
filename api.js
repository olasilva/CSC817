// API base helper for pages.
// Usage: import { API_BASE } from './api.js' (not used currently)
export const API_BASE = (() => {
  // Prefer relative calls so Vercel/production works.
  return '/api';
})();

