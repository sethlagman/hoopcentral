import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DEFAULT_NBA_SEASON } from '../config/api.js'
import {
  fetchSchedule,
  fetchSeasonSummary,
  fetchTeam,
  fetchTeamRosterSeason,
  fetchTeamStandingsSeason,
} from '../api/hoopcentral.js'
import { ApiState } from '../components/nba/ApiUi.jsx'
import GameCard from '../components/nba/GameCard.jsx'
import { Block, Crumbs, Logo, PageTitle, SeasonForm } from '../components/nba/ui.jsx'
import {
  conferenceName,
  etDate,
  formatStreak,
  formatWinRate,
  indexTeams,
  loadTeams,
  sortStandings,
} from '../lib/nba.js'
import { useLoad } from '../lib/useLoad.js'

function loadTeam(teamId, season) {
  return Promise.all([
    fetchTeam(teamId),
    fetchTeamStandingsSeason(teamId, season),
    fetchTeamRosterSeason(teamId, season),
    fetchSeasonSummary(season),
    loadTeams(),
    fetchSchedule({ season, team: teamId, from: etDate(0), order: 'asc', pageSize: 5 }),
    fetchSchedule({ season, team: teamId, to: etDate(-1), order: 'desc', pageSize: 5 }),
  ]).then(([team, standings, roster, summary, teams, upcoming, recent]) => {
    const rows = Array.isArray(standings) ? standings : []
    const record = rows[0] || null
    const all = summary?.standings || []
    const name = conferenceName(record?.conference)
    const peers = sortStandings(
      all.filter((row) => conferenceName(row.conference) === name),
      'wins',
    )
    const rank = peers.findIndex((row) => String(row.team) === String(teamId))
    return {
      team,
      record,
      roster: roster?.roster || [],
      rosterSeason: roster?.season || season,
      rank: rank >= 0 ? rank + 1 : null,
      field: peers.length,
      conference: name || record?.conference || '',
      teamsById: indexTeams(teams),
      upcoming: upcoming?.games || [],
      recent: recent?.games || [],
    }
  })
}

function RecordTiles({ record, rank, field, conference }) {
  if (!record) return <p className="hc-muted">No standings row for this season.</p>
  const tiles = [
    ['W-L', `${record.wins}-${record.losses}`],
    ['PCT', formatWinRate(record.winrate)],
    ['Conf', conference && rank ? `${conference} ${rank} of ${field}` : conference || '—'],
    ['Home', record.home || '—'],
    ['Road', record.road || '—'],
    ['Conf rec', record.conference_record || '—'],
    ['Div rec', record.division_record || '—'],
    ['L10', record.last10 || '—'],
    ['Streak', formatStreak(record.winstreak)],
  ]
  return (
    <div className="stat-tiles">
      {tiles.map(([label, value]) => (
        <div key={label} className="stat-tile">
          <b>{value}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

export default function TeamPage() {
  const { teamId } = useParams()
  const [season, setSeason] = useState(DEFAULT_NBA_SEASON)
  const [draft, setDraft] = useState(DEFAULT_NBA_SEASON)
  const state = useLoad(`${teamId}|${season}`, () => loadTeam(teamId, season))

  const applySeason = (event) => {
    event.preventDefault()
    const next = draft.trim()
    if (next) setSeason(next)
  }

  const data = state.data
  const team = data?.team

  return (
    <>
      <Crumbs items={[{ label: 'Teams', to: '/teams' }, { label: team?.full_name || 'Team' }]} />
      <PageTitle title={team?.full_name || 'Team'}>
        <SeasonForm value={draft} onChange={setDraft} onSubmit={applySeason} disabled={state.loading} />
      </PageTitle>
      <ApiState loading={state.loading} error={state.error} empty={false}>
        {data && team ? (
          <>
            <div className="profile-head">
              <Logo src={team.logo} label={team.abbreviation || team.full_name} className="logo-img lg" />
              <div>
                <div className="hc-player-profile-sub">
                  {[team.city, team.state].filter(Boolean).join(', ') || '—'}
                  {team.abbreviation ? ` · ${team.abbreviation}` : ''}
                  {team.nickname ? ` · ${team.nickname}` : ''}
                  {team.year_founded != null ? ` · Est. ${team.year_founded}` : ''}
                </div>
              </div>
            </div>
            <Block title={`${season} record`}>
              <RecordTiles
                record={data.record}
                rank={data.rank}
                field={data.field}
                conference={data.conference}
              />
            </Block>
            <Block title={`Roster · ${data.rosterSeason}`}>
              {data.roster.length ? (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Jersey</th>
                        <th>Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.roster.map((player) => (
                        <tr key={player.player_id}>
                          <td>
                            <Link to={`/players/${player.player_id}`} className="pcell">
                              <Logo src={player.headshot} label={player.full_name} className="logo-img sm" />
                              <span className="pname">{player.full_name}</span>
                            </Link>
                          </td>
                          <td>{player.jersey ? `#${player.jersey}` : '—'}</td>
                          <td>{player.is_active ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="hc-muted">No players with a stat line for this franchise and season.</p>
              )}
            </Block>
            <div className="split">
              <Block title="Upcoming">
                {data.upcoming.length ? (
                  <div className="card-grid one-col">
                    {data.upcoming.map((game) => (
                      <GameCard key={game.game_id} game={game} teamsById={data.teamsById} />
                    ))}
                  </div>
                ) : (
                  <p className="hc-muted">No upcoming games.</p>
                )}
              </Block>
              <Block title="Recent results">
                {data.recent.length ? (
                  <div className="card-grid one-col">
                    {data.recent.map((game) => (
                      <GameCard key={game.game_id} game={game} teamsById={data.teamsById} />
                    ))}
                  </div>
                ) : (
                  <p className="hc-muted">No earlier games this season.</p>
                )}
              </Block>
            </div>
          </>
        ) : null}
      </ApiState>
    </>
  )
}
