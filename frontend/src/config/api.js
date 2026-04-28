/**
 * Django serves REST under `/api/` (hoopcentral.urls: path('api/', include('core.urls'))).
 * If `VITE_API_URL` is only the origin (e.g. `http://localhost:8000`), we append `/api` so
 * requests hit `/api/player`, not `/player` on the server root (which 404s).
 */
function resolveApiRoot() {
  const raw = import.meta.env.VITE_API_URL?.trim()
  if (!raw) return '/api'
  const base = raw.replace(/\/$/, '')
  if (base.endsWith('/api')) return base
  return `${base}/api`
}

export const API_ROOT = resolveApiRoot()

/** Default season key for NBA API calls (matches backend _season_lookup_variants). */
export const DEFAULT_NBA_SEASON = '2025-26'
