import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPlayerList } from '../api/hoopcentral.js'
import { ApiState } from '../components/nba/ApiUi.jsx'
import { Logo, PageTitle, Pager } from '../components/nba/ui.jsx'
import { loadTeams } from '../lib/nba.js'
import { useLoad } from '../lib/useLoad.js'

const PAGE_SIZE = 24

export default function PlayersPage() {
  const [page, setPage] = useState(1)
  const [name, setName] = useState('')
  const [team, setTeam] = useState('')
  const [activeOnly, setActiveOnly] = useState(true)
  const [draftName, setDraftName] = useState('')
  const [draftTeam, setDraftTeam] = useState('')
  const teamsState = useLoad('teams', () => loadTeams())
  const key = JSON.stringify({ page, name, team, activeOnly })
  const state = useLoad(key, () =>
    fetchPlayerList({
      page,
      pageSize: PAGE_SIZE,
      name,
      team,
      active: activeOnly ? true : undefined,
    }),
  )

  const apply = (event) => {
    event.preventDefault()
    setName(draftName.trim())
    setTeam(draftTeam.trim())
    setPage(1)
  }

  const results = state.data?.results || []
  const teams = Array.isArray(teamsState.data) ? teamsState.data : []

  return (
    <>
      <PageTitle title="Players" />
      <p className="hc-muted dash-intro">
        Name, team, and jersey. Position, height, and weight are not in the player records.
      </p>
      <form className="hc-toolbar filter-row" onSubmit={apply}>
        <input
          className="hc-input"
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          placeholder="Player name"
          aria-label="Player name"
        />
        <select
          className="hc-select"
          value={draftTeam}
          onChange={(event) => setDraftTeam(event.target.value)}
          aria-label="Team"
        >
          <option value="">All teams</option>
          {teams.map((item) => (
            <option key={item.team_id} value={item.abbreviation || item.team_id}>
              {item.full_name}
            </option>
          ))}
        </select>
        <label className="check-label">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(event) => {
              setActiveOnly(event.target.checked)
              setPage(1)
            }}
          />
          Active roster
        </label>
        <button type="submit" className="hc-btn" disabled={state.loading}>
          Search
        </button>
      </form>
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
        empty={!state.loading && !state.error && results.length === 0}
        emptyLabel="No players match that search."
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Team</th>
                <th>Jersey</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((player) => (
                <tr key={player.player_id}>
                  <td>
                    <Link to={`/players/${player.player_id}`} className="pcell">
                      <Logo src={player.headshot} label={player.full_name} className="logo-img sm" />
                      <span className="pname">{player.full_name}</span>
                    </Link>
                  </td>
                  <td>
                    {player.team ? (
                      <Link to={`/teams/${player.team}`}>{player.team_name || player.team}</Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{player.jersey ? `#${player.jersey}` : '—'}</td>
                  <td>{player.is_active ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ApiState>
    </>
  )
}
