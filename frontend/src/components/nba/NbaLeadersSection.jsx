import { useEffect, useState } from 'react'
import SectionHeader from '../SectionHeader'
import SubPanel from '../SubPanel'
import { DEFAULT_NBA_SEASON } from '../../config/api.js'
import { fetchStatLeaders } from '../../api/hoopcentral.js'
import { ApiState, HcToolbar } from './ApiUi.jsx'

/* eslint-disable react-hooks/set-state-in-effect -- loading flags before async fetch */

const CATEGORIES = [
  { id: 'points_per_game', label: 'Points / game' },
  { id: 'assists_per_game', label: 'Assists / game' },
  { id: 'rebounds_per_game', label: 'Rebounds / game' },
]

export default function NbaLeadersSection({ activeId }) {
  const visible = activeId === 'nba-player-leaders'
  const [season, setSeason] = useState(DEFAULT_NBA_SEASON)
  const [cat, setCat] = useState('points_per_game')
  const [limit, setLimit] = useState(15)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchStatLeaders(season.trim(), cat, limit)
      .then((r) => {
        if (!cancelled) setRows(Array.isArray(r) ? r : [])
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [visible, season, cat, limit])

  if (!visible) return null

  const statKey = cat === 'points_per_game' ? 'ppg' : cat === 'assists_per_game' ? 'apg' : 'rpg'
  const statLabel = statKey.toUpperCase()

  return (
    <SubPanel id="nba-player-leaders" activeId={activeId}>
      <SectionHeader title="Leaderboards" />
      <div className="table-wrap">
        <div className="table-head">
          <div className="table-head-title">Stat leaders</div>
        </div>
        <HcToolbar>
          <input
            className="hc-input"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="Season"
            aria-label="Season"
          />
          <select
            className="hc-select"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            aria-label="Category"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            className="hc-input hc-input-narrow"
            type="number"
            min={1}
            max={100}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) || 10)}
            aria-label="Limit"
          />
        </HcToolbar>
        <ApiState
          loading={loading}
          error={error}
          empty={!loading && !error && rows.length === 0}
        >
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player #</th>
                <th>Season</th>
                <th>{statLabel}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td className="rank-muted">{i + 1}</td>
                  <td>{r.player}</td>
                  <td>{r.season}</td>
                  <td className="stat-hi">{r[statKey] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ApiState>
      </div>
    </SubPanel>
  )
}
