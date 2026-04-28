import { useEffect, useState } from 'react'
import SectionHeader from '../SectionHeader'
import SubPanel from '../SubPanel'
import { fetchPlayerList, fetchPlayerSearch } from '../../api/hoopcentral.js'
import { ApiState, HcToolbar } from './ApiUi.jsx'

/* eslint-disable react-hooks/set-state-in-effect -- loading flags before async fetch */

export default function NbaPlayersSection({ activeId }) {
  const visible = activeId === 'nba-players'
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [sqName, setSqName] = useState('')
  const [sqTeam, setSqTeam] = useState('')
  const [searchRows, setSearchRows] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchPlayerList(page, 20)
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
  }, [visible, page])

  const runSearch = (e) => {
    e.preventDefault()
    setSearchLoading(true)
    setSearchError(null)
    fetchPlayerSearch({ name: sqName, team: sqTeam })
      .then(setSearchRows)
      .catch((err) => setSearchError(err.message || String(err)))
      .finally(() => setSearchLoading(false))
  }

  const results = data?.results ?? []
  const count = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(count / 20))
  const hasNext = Boolean(data?.next)
  const hasPrev = Boolean(data?.previous)

  return (
    <SubPanel id="nba-players" activeId={activeId}>
      <SectionHeader title="NBA Players" />
      <div className="table-wrap">
        <div className="table-head">
          <div className="table-head-title">Search & directory (live API)</div>
        </div>
        <form className="hc-toolbar" onSubmit={runSearch}>
          <input
            className="hc-input"
            placeholder="Name"
            value={sqName}
            onChange={(e) => setSqName(e.target.value)}
            aria-label="Search by name"
          />
          <input
            className="hc-input"
            placeholder="Team"
            value={sqTeam}
            onChange={(e) => setSqTeam(e.target.value)}
            aria-label="Search by team"
          />
          <button type="submit" className="hc-btn" disabled={searchLoading}>
            {searchLoading ? 'Searching…' : 'Search'}
          </button>
        </form>
        {searchError ? <div className="hc-api-msg hc-api-err">{searchError}</div> : null}
        {searchRows ? (
          <div style={{ marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Player</th>
                  <th>Team ID</th>
                  <th>Years</th>
                </tr>
              </thead>
              <tbody>
                {searchRows.slice(0, 50).map((p) => (
                  <tr key={p.player_id}>
                    <td className="rank-muted">{p.player_id}</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏀</div>
                        <div>
                          <div className="pname">{p.full_name}</div>
                          <div className="pteam">
                            {p.first_name} {p.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{p.team}</td>
                    <td>
                      {p.year_start}–{p.year_end}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {searchRows.length > 50 ? (
              <p className="hc-muted">Showing first 50 of {searchRows.length} matches.</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="table-wrap" style={{ marginTop: 16 }}>
        <div className="table-head">
          <div className="table-head-title">Paginated roster — API /player</div>
          <HcToolbar>
            <span className="hc-toolbar-meta">
              Page {page} of {totalPages} · {count} players
            </span>
            <button
              type="button"
              className="hc-btn hc-btn-ghost"
              disabled={!hasPrev || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              type="button"
              className="hc-btn hc-btn-ghost"
              disabled={!hasNext || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </HcToolbar>
        </div>
        <ApiState loading={loading} error={error} empty={!loading && !error && results.length === 0}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Team ID</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {results.map((p, i) => (
                <tr key={p.player_id}>
                  <td className="rank-muted">{(page - 1) * 20 + i + 1}</td>
                  <td>
                    <div className="pcell">
                      <div className="pavatar">🏀</div>
                      <div>
                        <div className="pname">{p.full_name}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.team}</td>
                  <td>{p.is_active ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ApiState>
      </div>
    </SubPanel>
  )
}
