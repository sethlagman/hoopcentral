import { useEffect, useState } from 'react'
import SectionHeader from '../SectionHeader'
import SubPanel from '../SubPanel'
import GameRow from '../GameRow'
import { DEFAULT_NBA_SEASON } from '../../config/api.js'
import { fetchSchedule } from '../../api/hoopcentral.js'
import { ApiState, HcToolbar } from './ApiUi.jsx'

function badgeFor(game) {
  const text = String(game.status_text || '')
  if (game.status === 3 || /^final/i.test(text)) {
    return { badgeClass: 'badge-final', badgeText: 'Final' }
  }
  if (game.status === 2) {
    return { badgeClass: 'badge-live', badgeText: text || 'Live' }
  }
  return { badgeClass: 'badge-upcoming', badgeText: game.tip_time_est || text || 'Upcoming' }
}

function rowFor(game) {
  const final = game.status === 3 || /^final/i.test(String(game.status_text || ''))
  const homeWins = final && (game.home_score ?? 0) > (game.away_score ?? 0)
  const awayWins = final && (game.away_score ?? 0) > (game.home_score ?? 0)
  const score = (value) => (final || game.status === 2 ? String(value ?? '') : '')
  const place = [game.arena_name, game.arena_city].filter(Boolean).join(', ')
  return {
    ...badgeFor(game),
    teamRows: [
      { name: game.away_team_name || game.away_tricode, score: score(game.away_score), win: awayWins },
      { name: game.home_team_name || game.home_tricode, score: score(game.home_score), win: homeWins },
    ],
    info: place || game.status_text || null,
  }
}

function groupByDate(games) {
  const groups = []
  for (const game of games) {
    const last = groups[groups.length - 1]
    if (!last || last.date !== game.game_date) {
      groups.push({ date: game.game_date, games: [game] })
    } else {
      last.games.push(game)
    }
  }
  return groups
}

export default function NbaScoresSection({ activeId }) {
  const visible = activeId === 'nba-scores-tab'
  const [season, setSeason] = useState(DEFAULT_NBA_SEASON)
  const [date, setDate] = useState('')
  const [team, setTeam] = useState('')
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchSchedule({ season, date, team, limit: date ? 30 : 40 })
      .then((payload) => {
        if (!cancelled) setGames(payload?.games ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [visible, season, date, team])

  if (!visible) return null

  const groups = groupByDate(games)

  return (
    <SubPanel id="nba-scores-tab" activeId={activeId}>
      <SectionHeader title="Scores & schedule" />
      <div className="table-wrap">
        <div className="table-head">
          <div className="table-head-title">Season schedule</div>
        </div>
        <HcToolbar>
          <input
            className="hc-input"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="Season (2025-26)"
          />
          <input
            className="hc-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            className="hc-input hc-input-narrow"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="Team (CLE)"
          />
        </HcToolbar>
        <ApiState
          loading={loading}
          error={error}
          empty={!loading && !error && games.length === 0}
          emptyLabel="No games for that season, date, or team."
        >
          {groups.map((group) => (
            <div key={group.date}>
              <div className="table-head">
                <div className="table-head-title">{group.date}</div>
              </div>
              {group.games.map((game) => (
                <GameRow key={game.game_id} {...rowFor(game)} />
              ))}
            </div>
          ))}
        </ApiState>
      </div>
    </SubPanel>
  )
}
