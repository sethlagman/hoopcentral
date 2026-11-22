import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_NBA_SEASON } from '../config/api.js'
import { fetchSeasonSummary, fetchTeamList } from '../api/hoopcentral.js'
import { ApiState } from '../components/nba/ApiUi.jsx'
import { Logo, PageTitle, SeasonForm } from '../components/nba/ui.jsx'
import { conferenceName, teamMatches } from '../lib/nba.js'
import { useLoad } from '../lib/useLoad.js'

function loadTeams(season) {
  return Promise.all([fetchTeamList(), fetchSeasonSummary(season)]).then(([teams, summary]) => {
    const byTeam = new Map()
    for (const row of summary?.standings || []) byTeam.set(String(row.team), row)
    return {
      teams: (Array.isArray(teams) ? teams : []).filter((team) => team.full_name?.trim()),
      byTeam,
      seasonLabel: summary?.season || season,
    }
  })
}

export default function TeamsPage() {
  const [season, setSeason] = useState(DEFAULT_NBA_SEASON)
  const [draft, setDraft] = useState(DEFAULT_NBA_SEASON)
  const [query, setQuery] = useState('')
  const [conference, setConference] = useState('all')
  const state = useLoad(season, () => loadTeams(season))

  const applySeason = (event) => {
    event.preventDefault()
    const next = draft.trim()
    if (next) setSeason(next)
  }

  const data = state.data
  const teams = (data?.teams || []).filter((team) => {
    if (!teamMatches(team, query)) return false
    if (conference === 'all') return true
    const row = data.byTeam.get(String(team.team_id))
    return conferenceName(row?.conference) === conference
  })

  return (
    <>
      <PageTitle title="Teams">
        <SeasonForm value={draft} onChange={setDraft} onSubmit={applySeason} disabled={state.loading} />
      </PageTitle>
      <p className="hc-muted dash-intro">
        Conference comes from the {data?.seasonLabel || season} standings. Division names are not in the data.
      </p>
      <div className="hc-toolbar filter-row">
        <input
          className="hc-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, city, or abbreviation"
          aria-label="Search teams"
        />
        <div className="chip-row" role="group" aria-label="Conference">
          {[
            ['all', 'All'],
            ['East', 'East'],
            ['West', 'West'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`chip${conference === id ? ' on' : ''}`}
              aria-pressed={conference === id}
              onClick={() => setConference(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!state.loading && !state.error && teams.length === 0}
        emptyLabel="No teams match that search or conference."
      >
        <div className="card-grid">
          {teams.map((team) => {
            const standing = data.byTeam.get(String(team.team_id))
            const conf = conferenceName(standing?.conference)
            const record = standing ? `${standing.wins}-${standing.losses}` : null
            return (
              <Link key={team.team_id} to={`/teams/${team.team_id}`} className="team-card">
                <Logo src={team.logo} label={team.abbreviation || team.full_name} />
                <span>
                  <span className="pname">{team.full_name}</span>
                  <span className="pteam">
                    {[team.abbreviation, conf, record].filter(Boolean).join(' · ') || team.city || '—'}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </ApiState>
    </>
  )
}
