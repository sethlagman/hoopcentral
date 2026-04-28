import { useEffect, useState } from 'react'
import SectionHeader from '../SectionHeader'
import SubPanel from '../SubPanel'
import { DEFAULT_NBA_SEASON } from '../../config/api.js'
import { fetchSeasonSummary, fetchStandingList } from '../../api/hoopcentral.js'
import { ApiState, HcToolbar } from './ApiUi.jsx'

/* eslint-disable react-hooks/set-state-in-effect -- loading flags before async fetch */

export default function NbaStandingsSection({ activeId }) {
  const visible = activeId === 'nba-team-stats'
  const [season, setSeason] = useState(DEFAULT_NBA_SEASON)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [bulk, setBulk] = useState(null)
  const [bLoading, setBLoading] = useState(false)
  const [bErr, setBErr] = useState(null)

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchSeasonSummary(season.trim())
      .then((r) => {
        if (!cancelled) setData(r)
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
  }, [visible, season])

  const loadBulk = (e) => {
    e.preventDefault()
    if (!window.confirm('Load ALL rows from /standing. May be large.')) return
    setBLoading(true)
    setBErr(null)
    fetchStandingList()
      .then((rows) => setBulk(Array.isArray(rows) ? rows.slice(0, 120) : rows))
      .catch((e) => setBErr(e.message || String(e)))
      .finally(() => setBLoading(false))
  }

  if (!visible) return null

  const standings = data?.standings ?? []

  return (
    <SubPanel id="nba-team-stats" activeId={activeId}>
      <SectionHeader title="Team stats & standings" />
      <div className="table-wrap">
        <div className="table-head">
          <div className="table-head-title">Conference standings snapshot — /season/…/summary</div>
        </div>
        <HcToolbar>
          <input
            className="hc-input"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="Season (2000 or 2000-01)"
          />
        </HcToolbar>
        <ApiState loading={loading} error={error} empty={!loading && !error && standings.length === 0}>
          <p className="hc-muted" style={{ marginBottom: 8 }}>
            Resolved season label: <strong>{data?.season ?? '—'}</strong>
          </p>
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Conf</th>
                <th>W</th>
                <th>L</th>
                <th>PCT</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row) => (
                <tr key={`${row.id}-${row.season}`}>
                  <td>{row.team_name ?? row.team}</td>
                  <td>{row.conference}</td>
                  <td>{row.wins}</td>
                  <td>{row.losses}</td>
                  <td className="stat-hi">{row.winrate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ApiState>
      </div>

      <div className="table-wrap" style={{ marginTop: 16 }}>
        <div className="table-head">
          <div className="table-head-title">Full standings table (sample)</div>
        </div>
        <button type="button" className="hc-btn hc-btn-ghost" onClick={loadBulk} disabled={bLoading}>
          {bLoading ? 'Loading…' : 'Load /standing (first 120)'}
        </button>
        {bErr ? <div className="hc-api-msg hc-api-err">{bErr}</div> : null}
        {bulk?.length ? (
          <table style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Team</th>
                <th>Season</th>
                <th>W</th>
                <th>L</th>
              </tr>
            </thead>
            <tbody>
              {bulk.map((row) => (
                <tr key={row.id}>
                  <td>{row.team_name ?? row.team}</td>
                  <td>{row.season}</td>
                  <td>{row.wins}</td>
                  <td>{row.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </SubPanel>
  )
}
