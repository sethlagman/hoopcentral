import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_NBA_SEASON } from '../config/api.js'
import { fetchStatisticList } from '../api/hoopcentral.js'
import { ApiState } from '../components/nba/ApiUi.jsx'
import { PageTitle, Pager, SeasonForm } from '../components/nba/ui.jsx'
import { formatAvg } from '../lib/nba.js'
import { useLoad } from '../lib/useLoad.js'

const PAGE_SIZE = 25

const COLUMNS = [
  { id: 'player', label: 'Player' },
  { id: 'ppg', label: 'PPG' },
  { id: 'rpg', label: 'RPG' },
  { id: 'apg', label: 'APG' },
]

export default function StatsPage() {
  const [season, setSeason] = useState(DEFAULT_NBA_SEASON)
  const [draft, setDraft] = useState(DEFAULT_NBA_SEASON)
  const [ordering, setOrdering] = useState('-ppg')
  const [page, setPage] = useState(1)
  const key = JSON.stringify({ season, ordering, page })
  const state = useLoad(key, () => fetchStatisticList({ season, ordering, page, pageSize: PAGE_SIZE }))

  const applySeason = (event) => {
    event.preventDefault()
    const next = draft.trim()
    if (!next) return
    setSeason(next)
    setPage(1)
  }

  const toggleSort = (id) => {
    setOrdering((current) => (current === `-${id}` ? id : `-${id}`))
    setPage(1)
  }

  const rows = state.data?.results || []

  return (
    <>
      <PageTitle title="Statistics">
        <SeasonForm value={draft} onChange={setDraft} onSubmit={applySeason} disabled={state.loading} />
      </PageTitle>
      <p className="hc-muted dash-intro">
        Per-game averages for {season}. The stat lines store points, rebounds, and assists only, not season totals.
      </p>
      <Pager
        page={page}
        count={state.data?.count || 0}
        pageSize={PAGE_SIZE}
        onPage={setPage}
        disabled={state.loading}
      />
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!state.loading && !state.error && rows.length === 0}
        emptyLabel="No statistics for that season."
      >
        <div className="table-scroll">
          <table className="sortable">
            <thead>
              <tr>
                <th>#</th>
                {COLUMNS.map((column) => (
                  <th key={column.id}>
                    <button type="button" onClick={() => toggleSort(column.id)} aria-pressed={ordering.replace('-', '') === column.id}>
                      {column.label}
                      {ordering === `-${column.id}` ? ' ↓' : ''}
                      {ordering === column.id ? ' ↑' : ''}
                    </button>
                  </th>
                ))}
                <th>Team</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="rank-muted">{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td>
                    <Link to={`/players/${row.player}`} className="pname">
                      {row.player_name || row.player}
                    </Link>
                  </td>
                  <td className="stat-hi">{formatAvg(row.ppg)}</td>
                  <td>{formatAvg(row.rpg)}</td>
                  <td>{formatAvg(row.apg)}</td>
                  <td>
                    {row.club_id || row.team ? (
                      <Link to={`/teams/${row.club_id || row.team}`}>
                        {row.team_abbreviation || row.team_name || row.club_id || row.team}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ApiState>
    </>
  )
}
