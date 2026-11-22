import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_NBA_SEASON } from '../config/api.js'
import { fetchStatLeaders } from '../api/hoopcentral.js'
import { ApiState } from '../components/nba/ApiUi.jsx'
import { PageTitle, SeasonForm } from '../components/nba/ui.jsx'
import { formatAvg } from '../lib/nba.js'
import { useLoad } from '../lib/useLoad.js'

const CATEGORIES = [
  { id: 'points_per_game', field: 'ppg', label: 'Points per game' },
  { id: 'rebounds_per_game', field: 'rpg', label: 'Rebounds per game' },
  { id: 'assists_per_game', field: 'apg', label: 'Assists per game' },
]

export default function LeadersPage() {
  const [season, setSeason] = useState(DEFAULT_NBA_SEASON)
  const [draft, setDraft] = useState(DEFAULT_NBA_SEASON)
  const [category, setCategory] = useState(CATEGORIES[0].id)
  const selected = CATEGORIES.find((item) => item.id === category) || CATEGORIES[0]
  const state = useLoad(`${season}|${category}`, () => fetchStatLeaders(season, category, 25))
  const rows = Array.isArray(state.data) ? state.data : []

  const applySeason = (event) => {
    event.preventDefault()
    const next = draft.trim()
    if (next) setSeason(next)
  }

  return (
    <>
      <PageTitle title="Leaders">
        <SeasonForm value={draft} onChange={setDraft} onSubmit={applySeason} disabled={state.loading} />
      </PageTitle>
      <div className="hc-toolbar filter-row">
        <label className="check-label" htmlFor="leader-category">
          Category
        </label>
        <select
          id="leader-category"
          className="hc-select"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <p className="hc-muted dash-intro">
        Ranked {selected.label.toLowerCase()} for {season}. Steals, blocks, and shooting percentages are not stored.
      </p>
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!state.loading && !state.error && rows.length === 0}
        emptyLabel="No leaders for that season."
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Team</th>
                <th>{selected.field.toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id ?? row.player}>
                  <td className="rank-muted">{index + 1}</td>
                  <td>
                    <Link to={`/players/${row.player}`} className="pname">
                      {row.player_name || row.player}
                    </Link>
                  </td>
                  <td>
                    {row.club_id || row.team ? (
                      <Link to={`/teams/${row.club_id || row.team}`}>
                        {row.team_abbreviation || row.team_name || row.club_id || row.team}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="stat-hi">{formatAvg(row[selected.field])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ApiState>
    </>
  )
}
