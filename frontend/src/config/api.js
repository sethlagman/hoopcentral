/**
 * Django mounts the API under `/api/`. If `VITE_API_URL` is only an origin
 * (e.g. `http://localhost:8000`), append `/api` so requests don't 404 at the root.
 */
function resolveApiRoot() {
  const raw = import.meta.env.VITE_API_URL?.trim()
  if (!raw) return '/api'
  const base = raw.replace(/\/$/, '')
  if (base.endsWith('/api')) return base
  return `${base}/api`
}

export const API_ROOT = resolveApiRoot()

/** Must be a format accepted by backend `season_lookup_variants`. */
export const DEFAULT_NBA_SEASON = '2025-26'
