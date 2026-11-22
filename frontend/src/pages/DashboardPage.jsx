import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_NBA_SEASON } from '../config/api.js'
import {
  fetchSchedule,
  fetchSeasonSummary,
  fetchStatLeaders,
} from '../api/hoopcentral.js'
import { ApiState } from '../components/nba/ApiUi.jsx'
import GameCard from '../components/nba/GameCard.jsx'
import { Block, PageTitle, SeasonForm } from '../components/nba/ui.jsx'
import {
  etDate,
  formatAvg,
  indexTeams,
  loadTeams,
  partitionConferences,
  sortStandings,
} from '../lib/nba.js'
import { useLoad } from '../lib/useLoad.js'

const LEADER_CATEGORIES = [
  { id: 'points_per_game', field: 'ppg', label: 'Points' },
  { id: 'rebounds_per_game', field: 'rpg', label: 'Rebounds' },
  { id: 'assists_per_game', field: 'apg', label: 'Assists' },
]

function loadDashboard(season) {
  const today = etDate(0)
  return Promise.all([
    loadTeams(),
    fetchSeasonSummary(season),
    fetchStatLeaders(season, 'points_per_game', 5),
    fetchStatLeaders(season, 'rebounds_per_game', 5),
    fetchStatLeaders(season, 'assists_per_game', 5),
    fetchSchedule({ season, date: today, pageSize: 20, order: 'asc' }),
    fetchSchedule({ season, from: etDate(1), pageSize: 6, order: 'asc' }),
    fetchSchedule({ season, to: etDate(-1), pageSize: 6, order: 'desc' }),
  ]).then(([teams, summary, ppg, rpg, apg, todayGames, upcoming, recent]) => ({
    teamsById: indexTeams(teams),
    seasonLabel: summary?.season || season,
    standings: summary?.standings || [],
    leaders: { points_per_game: ppg, rebounds_per_game: rpg, assists_per_game: apg },
    todayGames: todayGames?.games || [],
    upcoming: upcoming?.games || [],
    recent: recent?.games || [],
    today,
  }))
}

function GameList({ games, teamsById, empty }) {
  if (!games.length) return <p className="hc-muted">{empty}</p>
  return (
    <div className="card-grid">
      {games.map((game) => (
        <GameCard key={game.game_id} game={game} teamsById={teamsById} />
      ))}
    </div>
  )
}

function StandingPreview({ title, rows, teamsById }) {
  const top = sortStandings(rows, 'wins').slice(0, 8)
  if (!top.length) return null
  return (
    <div className="table-wrap">
      <div className="table-head">
        <div className="table-head-title">{title}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>W</th>
            <th>L</th>
            <th>PCT</th>
          </tr>
        </thead>
        <tbody>
          {top.map((row, index) => {
            const team = teamsById.get(String(row.team))
            return (
              <tr key={row.id ?? row.team}>
                <td className="rank-muted">{index + 1}</td>
                <td>
                  <Link to={`/teams/${row.team}`} className="pname">
                    {team?.abbreviation || row.team_name || row.team}
                  </Link>
                </td>
                <td>{row.wins}</td>
                <td>{row.losses}</td>
                <td>{row.winrate}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function DashboardPage() {
  const [season, setSeason] = useState(DEFAULT_NBA_SEASON)
  const [draft, setDraft] = useState(DEFAULT_NBA_SEASON)
  const state = useLoad(season, () => loadDashboard(season))

  const applySeason = (event) => {
    event.preventDefault()
    const next = draft.trim()
    if (next) setSeason(next)
  }

  const data = state.data

  return (
    <>
      <PageTitle title="NBA">
        <SeasonForm value={draft} onChange={setDraft} onSubmit={applySeason} disabled={state.loading} />
      </PageTitle>
      <p className="hc-muted dash-intro">
        Season {data?.seasonLabel || season}. Times and “today” use Eastern Time.
      </p>
      <ApiState loading={state.loading} error={state.error} empty={false}>
        {data ? (
          <>
            <Block
              title={`Today · ${data.today}`}
              extra={<Link to="/schedule">Full schedule</Link>}
            >
              <GameList
                games={data.todayGames}
                teamsById={data.teamsById}
                empty="No games scheduled today."
              />
            </Block>
            <div className="split">
              <Block title="Upcoming">
                <GameList games={data.upcoming} teamsById={data.teamsById} empty="No upcoming games in this season." />
              </Block>
              <Block title="Recent results">
                <GameList games={data.recent} teamsById={data.teamsById} empty="No completed games before today." />
              </Block>
            </div>
            <Block title="Standings" extra={<Link to="/standings">Full standings</Link>}>
              <div className="split">
                <StandingPreview
                  title="Eastern"
                  rows={partitionConferences(data.standings).east}
                  teamsById={data.teamsById}
                />
                <StandingPreview
                  title="Western"
                  rows={partitionConferences(data.standings).west}
                  teamsById={data.teamsById}
                />
              </div>
              {!data.standings.length ? <p className="hc-muted">No standings for this season.</p> : null}
            </Block>
            <Block title="Leaders" extra={<Link to="/leaders">All leaders</Link>}>
              <div className="leaders-grid">
                {LEADER_CATEGORIES.map((category) => {
                  const rows = data.leaders[category.id] || []
                  return (
                    <div key={category.id} className="table-wrap">
                      <div className="table-head">
                        <div className="table-head-title">{category.label} / game</div>
                      </div>
                      {rows.length ? (
                        <table>
                          <tbody>
                            {rows.map((row, index) => (
                              <tr key={row.id ?? row.player}>
                                <td className="rank-muted">{index + 1}</td>
                                <td>
                                  <Link to={`/players/${row.player}`} className="pname">
                                    {row.player_name || row.player}
                                  </Link>
                                </td>
                                <td className="stat-hi">{formatAvg(row[category.field])}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="hc-muted">No leaders for this season.</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </Block>
          </>
        ) : null}
      </ApiState>
    </>
  )
}
