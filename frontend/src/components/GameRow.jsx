/**
 * Scoreboard row — same structure as .game-row in reference HTML.
 * badgeClass: 'badge-live' | 'badge-final' | 'badge-upcoming'
 */
export default function GameRow({ badgeClass, badgeText, teamRows, info }) {
  return (
    <div className="game-row">
      <span className={`game-badge ${badgeClass}`}>{badgeText}</span>
      <div className="game-teams">
        {teamRows.map((row, i) => (
          <div key={i} className="g-team-row">
            <span>{row.name}</span>
            <span className={`g-score${row.win ? ' win' : ''}`}>{row.score}</span>
          </div>
        ))}
        {info ? <div className="g-info">{info}</div> : null}
      </div>
    </div>
  )
}
