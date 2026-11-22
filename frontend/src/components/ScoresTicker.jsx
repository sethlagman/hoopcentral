import { Link } from 'react-router-dom'
import { DEFAULT_NBA_SEASON } from '../config/api.js'
import { fetchSchedule } from '../api/hoopcentral.js'
import { etDate, gamePresentation } from '../lib/nba.js'
import { useLoad } from '../lib/useLoad.js'

function loadTicker() {
  const today = etDate(0)
  return fetchSchedule({ season: DEFAULT_NBA_SEASON, date: today, pageSize: 15, order: 'asc' }).then((day) => {
    if (day?.games?.length) return day.games
    return fetchSchedule({
      season: DEFAULT_NBA_SEASON,
      to: today,
      pageSize: 12,
      order: 'desc',
    }).then((recent) => recent?.games || [])
  })
}

export default function ScoresTicker() {
  const state = useLoad(etDate(0), loadTicker)
  const games = state.data || []

  return (
    <div className="scores-ticker">
      <div className="scores-ticker-inner">
        {state.loading ? <div className="score-item">Loading scores</div> : null}
        {state.error ? <div className="score-item">Scores unavailable</div> : null}
        {!state.loading && !state.error && games.length === 0 ? (
          <div className="score-item">No games on the schedule</div>
        ) : null}
        {games.map((game) => {
          const view = gamePresentation(game)
          const awayScore = view.showScore ? game.away_score ?? '' : ''
          const homeScore = view.showScore ? game.home_score ?? '' : ''
          return (
            <Link key={game.game_id} to={`/games/${game.game_id}`} className="score-item">
              <div className="sport-label">NBA</div>
              <div className="team-row">
                <span>{game.away_tricode || 'Away'}</span>
                <span className="score-val">{awayScore}</span>
              </div>
              <div className="team-row">
                <span>{game.home_tricode || 'Home'}</span>
                <span className="score-val">{homeScore}</span>
              </div>
              <div className={`game-time${view.kind === 'live' ? ' live' : ''}`}>{view.label}</div>
            </Link>
          )
        })}
        <Link to="/schedule" className="all-scores-btn">
          All scores
        </Link>
      </div>
    </div>
  )
}
