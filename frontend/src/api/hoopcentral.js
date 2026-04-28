import { API_ROOT } from '../config/api.js'

async function apiJson(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_ROOT}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    ...options,
    headers: { Accept: 'application/json', ...options.headers },
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const j = await res.json()
      detail = j.detail || j.error || j.message || JSON.stringify(j)
    } catch {
      /* ignore */
    }
    throw new Error(detail || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  const ct = res.headers.get('content-type')
  if (ct && ct.includes('application/json')) return res.json()
  return res.text()
}

/** Paginated list: { count, next, previous, results } */
export function fetchPlayerList(page = 1, pageSize = 20) {
  const q = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
  return apiJson(`/player?${q}`)
}

export function fetchPlayer(playerId) {
  return apiJson(`/player/${encodeURIComponent(playerId)}`)
}

export function fetchPlayerSearch({ name, team } = {}) {
  const q = new URLSearchParams()
  if (name?.trim()) q.set('name', name.trim())
  if (team?.trim()) q.set('team', team.trim())
  const qs = q.toString()
  return apiJson(qs ? `/player/search/?${qs}` : '/player/search/')
}

export function fetchTeamList() {
  return apiJson('/team')
}

export function fetchTeam(teamId) {
  return apiJson(`/team/${encodeURIComponent(teamId)}`)
}

export function fetchTeamRoster(teamId) {
  return apiJson(`/team/${encodeURIComponent(teamId)}/roster`)
}

export function fetchStandingList() {
  return apiJson('/standing')
}

export function fetchTeamStandings(teamId) {
  return apiJson(`/standing/${encodeURIComponent(teamId)}`)
}

export function fetchTeamStandingsSeason(teamId, season) {
  return apiJson(`/standing/${encodeURIComponent(teamId)}/${encodeURIComponent(season)}`)
}

export function fetchStatisticList() {
  return apiJson('/statistic')
}

export function fetchPlayerStatistics(playerId) {
  return apiJson(`/statistic/${encodeURIComponent(playerId)}`)
}

export function fetchPlayerStatisticsSeason(playerId, season) {
  return apiJson(`/statistic/${encodeURIComponent(playerId)}/${encodeURIComponent(season)}`)
}

export function fetchStatLeaders(season, statCategory, limit = 10) {
  const q = new URLSearchParams({ limit: String(limit) })
  return apiJson(
    `/leaders/${encodeURIComponent(season)}/${encodeURIComponent(statCategory)}?${q}`,
  )
}

export function fetchTeamCompare(teamId1, teamId2, season) {
  return apiJson(
    `/team/compare/${encodeURIComponent(teamId1)}/${encodeURIComponent(teamId2)}/${encodeURIComponent(season)}`,
  )
}

export function fetchPlayerCareerSummary(playerId) {
  return apiJson(`/player/${encodeURIComponent(playerId)}/career-summary`)
}

export function fetchSeasonSummary(season) {
  return apiJson(`/season/${encodeURIComponent(season)}/summary`)
}
