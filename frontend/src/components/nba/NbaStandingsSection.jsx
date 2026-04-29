import { useEffect, useState } from 'react'
import SectionHeader from '../SectionHeader'
import SubPanel from '../SubPanel'
import { DEFAULT_NBA_SEASON } from '../../config/api.js'
import { fetchSeasonSummary, fetchStandingList, BULK_INDEX_PAGE_SIZE } from '../../api/hoopcentral.js'
import { ApiState, HcToolbar } from './ApiUi.jsx'

/* eslint-disable react-hooks/set-state-in-effect -- loading flags before async fetch */

export default function NbaStandingsSection({ activeId }) {
  const visible = activeId === 'nba-team-stats'
  const [season, setSeason] = useState(DEFAULT_NBA_SEASON)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [standingBulk, setStandingBulk] = useState(null)
  const [standingBulkPage, setStandingBulkPage] = useState(1)
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

  const fetchStandingBulkPage = (page) => {
    setBLoading(true)
    setBErr(null)
    fetchStandingList(page, BULK_INDEX_PAGE_SIZE)
      .then((data) => {
        setStandingBulk(data)
        setStandingBulkPage(page)
      })
      .catch((e) => setBErr(e.message || String(e)))
      .finally(() => setBLoading(false))
  }

  const standingBulkRows = standingBulk?.results ?? []
  const standingBulkTotal = standingBulk?.count ?? 0
  const standingBulkTotalPages = Math.max(1, Math.ceil(standingBulkTotal / BULK_INDEX_PAGE_SIZE))
  const standingBulkHasNext = Boolean(standingBulk?.next)
  const standingBulkHasPrev = Boolean(standingBulk?.previous)

  if (!visible) return null

  const standings = data?.standings ?? []

  return (
    <SubPanel id="nba-team-stats" activeId={activeId}>
      <SectionHeader title="Standings" />
      <div className="table-wrap">
        <div className="table-head">
          <div className="table-head-title">Conference standings</div>
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

      <details className="hc-advanced-details" style={{ marginTop: 16 }}>
        <summary className="hc-advanced-summary">League Standings Snapshot</summary>
        <div className="table-wrap hc-advanced-inner">
          <p className="hc-muted" style={{ marginBottom: 10 }}>
            League-wide standings index, paginated like the player directory (default{' '}
            {BULK_INDEX_PAGE_SIZE} rows per request). Heavier than the conference table above on first
            load.
          </p>
          <button
            type="button"
            className="hc-btn hc-btn-ghost"
            onClick={() => fetchStandingBulkPage(1)}
            disabled={bLoading}
          >
            {bLoading ? 'Loading…' : standingBulk ? 'Reload page 1' : 'Load snapshot'}
          </button>
          {bErr ? <div className="hc-api-msg hc-api-err">{bErr}</div> : null}
          {standingBulk ? (
            <>
              <HcToolbar>
                <span className="hc-toolbar-meta">
                  Page {standingBulkPage} of {standingBulkTotalPages} · {standingBulkTotal} rows
                </span>
                <button
                  type="button"
                  className="hc-btn hc-btn-ghost"
                  disabled={bLoading || !standingBulkHasPrev}
                  onClick={() => fetchStandingBulkPage(standingBulkPage - 1)}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="hc-btn hc-btn-ghost"
                  disabled={bLoading || !standingBulkHasNext}
                  onClick={() => fetchStandingBulkPage(standingBulkPage + 1)}
                >
                  Next
                </button>
              </HcToolbar>
              {standingBulkRows.length ? (
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
                    {standingBulkRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.team_name ?? row.team}</td>
                        <td>{row.season}</td>
                        <td>{row.wins}</td>
                        <td>{row.losses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="hc-muted" style={{ marginTop: 10 }}>
                  No standing rows on this page.
                </p>
              )}
            </>
          ) : null}
        </div>
      </details>
    </SubPanel>
  )
}
