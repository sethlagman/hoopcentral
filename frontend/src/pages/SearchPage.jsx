import { Link, useSearchParams } from 'react-router-dom'
import { fetchPlayerList } from '../api/hoopcentral.js'
import { ApiState } from '../components/nba/ApiUi.jsx'
import { Logo, PageTitle } from '../components/nba/ui.jsx'
import { loadTeams, teamMatches } from '../lib/nba.js'
import { useLoad } from '../lib/useLoad.js'

export default function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('q') || ''
  const state = useLoad(query, async () => {
    const text = query.trim()
    if (!text) return { players: [], teams: [], skipped: true }
    const [players, teams] = await Promise.all([
      fetchPlayerList({ name: text, page: 1, pageSize: 20 }),
      loadTeams(),
    ])
    return {
      players: players?.results || [],
      playerCount: players?.count || 0,
      teams: (Array.isArray(teams) ? teams : []).filter((team) => teamMatches(team, text)),
      skipped: false,
    }
  })

  const data = state.data

  return (
    <>
      <PageTitle title={query.trim() ? `Search · ${query.trim()}` : 'Search'} />
      {!query.trim() ? <p className="hc-muted">Search for a player or team.</p> : null}
      <ApiState loading={state.loading && Boolean(query.trim())} error={state.error} empty={false}>
        {data && !data.skipped ? (
          <>
            <section className="section-block">
              <h2 className="section-label">Teams</h2>
              {data.teams.length ? (
                <div className="card-grid">
                  {data.teams.map((team) => (
                    <Link key={team.team_id} to={`/teams/${team.team_id}`} className="team-card">
                      <Logo src={team.logo} label={team.abbreviation || team.full_name} />
                      <span>
                        <span className="pname">{team.full_name}</span>
                        <span className="pteam">{team.abbreviation}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="hc-muted">No teams match.</p>
              )}
            </section>
            <section className="section-block">
              <h2 className="section-label">Players</h2>
              {data.players.length ? (
                <table>
                  <tbody>
                    {data.players.map((player) => (
                      <tr key={player.player_id}>
                        <td>
                          <Link to={`/players/${player.player_id}`} className="pcell">
                            <Logo src={player.headshot} label={player.full_name} className="logo-img sm" />
                            <span>
                              <span className="pname">{player.full_name}</span>
                              <span className="pteam">{player.team_name || '—'}</span>
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="hc-muted">No players match.</p>
              )}
              {data.playerCount > data.players.length ? (
                <p className="hc-muted">
                  Showing {data.players.length} of {data.playerCount}.{' '}
                  <Link to={`/players`}>Open the player directory</Link> for the full list.
                </p>
              ) : null}
            </section>
          </>
        ) : null}
      </ApiState>
    </>
  )
}
