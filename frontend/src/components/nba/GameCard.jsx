import { Link } from 'react-router-dom'
import { Logo } from './ui.jsx'
import { formatGameDate, formatTip, gamePresentation } from '../../lib/nba.js'

function TeamLine({ team, fallback, score, winner, loser }) {
  const name = team?.abbreviation || fallback || '—'
  return (
    <div className={`matchup-line${winner ? ' win' : ''}${loser ? ' lose' : ''}`}>
      <span className="matchup-id">
        <Logo src={team?.logo} label={name} className="logo-img sm" />
        <span>{team?.full_name || fallback || name}</span>
      </span>
      {score != null && score !== '' ? <span>{score}</span> : <span />}
    </div>
  )
}

export default function GameCard({ game, teamsById }) {
  const view = gamePresentation(game)
  const away = teamsById?.get(String(game.away_team))
  const home = teamsById?.get(String(game.home_team))
  const meta = [formatGameDate(game.game_date), view.kind === 'final' ? null : formatTip(game.tip_time_est), view.place]
    .filter(Boolean)
    .join(' · ')
  return (
    <Link to={`/games/${game.game_id}`} className="game-card">
      <div className={`game-card-status ${view.kind}`}>{view.label}</div>
      <TeamLine
        team={away}
        fallback={game.away_team_name || game.away_tricode}
        score={view.showScore ? game.away_score : null}
        winner={view.awayWins}
        loser={view.showScore && view.homeWins && !view.awayWins}
      />
      <TeamLine
        team={home}
        fallback={game.home_team_name || game.home_tricode}
        score={view.showScore ? game.home_score : null}
        winner={view.homeWins}
        loser={view.showScore && view.awayWins && !view.homeWins}
      />
      {meta ? <div className="hc-muted">{meta}</div> : null}
    </Link>
  )
}
