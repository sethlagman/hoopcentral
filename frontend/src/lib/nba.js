import { fetchTeamList } from '../api/hoopcentral.js'

let teamsPromise = null

export function loadTeams() {
  if (!teamsPromise) {
    teamsPromise = fetchTeamList().catch((error) => {
      teamsPromise = null
      throw error
    })
  }
  return teamsPromise
}

export function indexTeams(teams) {
  const byId = new Map()
  for (const team of teams || []) byId.set(String(team.team_id), team)
  return byId
}

export function etDate(offsetDays = 0) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const year = Number(parts.find((part) => part.type === 'year').value)
  const month = Number(parts.find((part) => part.type === 'month').value)
  const day = Number(parts.find((part) => part.type === 'day').value)
  const utc = new Date(Date.UTC(year, month - 1, day + offsetDays))
  const mm = String(utc.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(utc.getUTCDate()).padStart(2, '0')
  return `${utc.getUTCFullYear()}-${mm}-${dd}`
}

export function formatGameDate(iso) {
  if (!iso) return ''
  const [year, month, day] = String(iso).split('-').map(Number)
  if (!year || !month || !day) return String(iso)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/** NBA sends tip time as a dummy-date ISO string. The clock is Eastern, not UTC. */
export function formatTip(value) {
  const text = String(value || '').trim()
  const match = text.match(/T(\d{2}):(\d{2})/)
  if (!match) return text
  let hour = Number(match[1])
  const suffix = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12
  return `${hour}:${match[2]} ${suffix} ET`
}

export function formatAvg(value) {
  if (value == null || value === '') return '—'
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(1) : '—'
}

export function formatWinRate(value) {
  if (value == null || value === '') return '—'
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  return number.toFixed(3).replace(/^0/, '')
}

export function conferenceName(value) {
  const name = String(value || '').trim().toLowerCase()
  if (name === 'east' || name === 'eastern') return 'East'
  if (name === 'west' || name === 'western') return 'West'
  return ''
}

export function partitionConferences(rows) {
  const east = []
  const west = []
  const other = []
  for (const row of rows || []) {
    const name = conferenceName(row.conference)
    if (name === 'East') east.push(row)
    else if (name === 'West') west.push(row)
    else other.push(row)
  }
  return { east, west, other }
}

export function sortStandings(rows, key = 'wins') {
  const copy = [...(rows || [])]
  copy.sort((a, b) => {
    if (key === 'winrate') {
      const diff = Number(b.winrate) - Number(a.winrate)
      if (diff) return diff
    } else if (key === 'losses') {
      const diff = Number(a.losses) - Number(b.losses)
      if (diff) return diff
    }
    const wins = Number(b.wins) - Number(a.wins)
    if (wins) return wins
    return Number(a.losses) - Number(b.losses)
  })
  return copy
}

export function winsLeader(rows) {
  return sortStandings(rows, 'wins')[0] || null
}

export function gamesBehind(row, leader) {
  if (!row || !leader) return 0
  if (String(row.team) === String(leader.team) && row.season === leader.season) return 0
  const gap = ((Number(leader.wins) - Number(row.wins)) + (Number(row.losses) - Number(leader.losses))) / 2
  return Math.round(gap * 10) / 10
}

export function formatGamesBehind(value) {
  if (!value) return '—'
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function formatStreak(value) {
  const text = String(value ?? '').trim()
  if (!text) return '—'
  if (/^-?\d+$/.test(text)) {
    const count = Number(text)
    if (!count) return '—'
    return count > 0 ? `W${count}` : `L${Math.abs(count)}`
  }
  return text
}

export function gamePresentation(game) {
  const text = String(game?.status_text || '')
  const final = game?.status === 3 || /^final/i.test(text)
  const live = game?.status === 2 && !final
  const showScore = final || live
  const homeScore = Number(game?.home_score ?? 0)
  const awayScore = Number(game?.away_score ?? 0)
  let kind = 'upcoming'
  let label = formatTip(game?.tip_time_est) || text || 'Scheduled'
  if (final) {
    kind = 'final'
    label = text || 'Final'
  } else if (live) {
    kind = 'live'
    label = text || 'Live'
  } else if (/postpon|cancel|suspend/i.test(text)) {
    label = text
  }
  return {
    kind,
    label,
    showScore,
    homeWins: showScore && homeScore > awayScore,
    awayWins: showScore && awayScore > homeScore,
    place: [game?.arena_name, game?.arena_city].filter(Boolean).join(', '),
  }
}

export function seasonStartYear(season) {
  const text = String(season || '').trim()
  const head = text.split('-')[0]
  return /^\d{4}$/.test(head) ? Number(head) : null
}

export function sortStatsBySeason(rows) {
  return [...(rows || [])].sort((a, b) => {
    const ay = seasonStartYear(a.season)
    const by = seasonStartYear(b.season)
    if (ay != null && by != null && ay !== by) return by - ay
    return String(b.season || '').localeCompare(String(a.season || ''), undefined, { numeric: true })
  })
}

export function teamMatches(team, query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return [team.full_name, team.nickname, team.abbreviation, team.city, team.state]
    .some((value) => String(value || '').toLowerCase().includes(needle))
}
