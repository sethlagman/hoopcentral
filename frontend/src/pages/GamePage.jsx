import { Link, useParams } from 'react-router-dom'
import { fetchGame } from '../api/hoopcentral.js'
import { ApiState } from '../components/nba/ApiUi.jsx'
import { Crumbs, Logo } from '../components/nba/ui.jsx'
import { formatGameDate, formatTip, gamePresentation, indexTeams, loadTeams } from '../lib/nba.js'
import { useLoad } from '../lib/useLoad.js'

function Side({ teamId, name, tricode, score, showScore, winner, teamsById }) {
  const team = teamsById.get(String(teamId))
  const label = team?.abbreviation || tricode || name
  return (
    <div className={`game-side${winner ? ' win' : ''}`}>
      <Logo src={team?.logo} label={label} className="logo-img lg" />
      <div>
        <Link to={`/teams/${teamId}`} className="page-title">
          {team?.full_name || name || label}
        </Link>
        {showScore ? <div className="game-side-score">{score ?? '—'}</div> : null}
      </div>
    </div>
  )
}

export default function GamePage() {
  const { gameId } = useParams()
  const state = useLoad(gameId, () =>
    Promise.all([fetchGame(gameId), loadTeams()]).then(([game, teams]) => ({
      game,
      teamsById: indexTeams(teams),
    })),
  )
  const game = state.data?.game
  const view = game ? gamePresentation(game) : null

  return (
    <ApiState loading={state.loading} error={state.error} empty={false}>
      {game && view ? (
        <>
          <Crumbs
            items={[
              { label: 'Schedule', to: '/schedule' },
              { label: `${game.away_tricode || 'Away'} at ${game.home_tricode || 'Home'}` },
            ]}
          />
          <p className={`game-card-status ${view.kind}`}>{view.label}</p>
          <div className="game-detail">
            <Side
              teamId={game.away_team}
              name={game.away_team_name}
              tricode={game.away_tricode}
              score={game.away_score}
              showScore={view.showScore}
              winner={view.awayWins}
              teamsById={state.data.teamsById}
            />
            <Side
              teamId={game.home_team}
              name={game.home_team_name}
              tricode={game.home_tricode}
              score={game.home_score}
              showScore={view.showScore}
              winner={view.homeWins}
              teamsById={state.data.teamsById}
            />
          </div>
          <dl className="fact-list">
            <div>
              <dt>Date</dt>
              <dd>{formatGameDate(game.game_date)}</dd>
            </div>
            <div>
              <dt>Tip</dt>
              <dd>{formatTip(game.tip_time_est) || '—'}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{game.status_text || view.label}</dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>{view.place || '—'}</dd>
            </div>
            <div>
              <dt>Season</dt>
              <dd>{game.season}</dd>
            </div>
          </dl>
        </>
      ) : null}
    </ApiState>
  )
}
