const GAMES = [
  { sport: 'NBA', t1: 'BOS', s1: '114', t2: 'NYK', s2: '108', time: 'Q4 2:34', live: true },
  { sport: 'NBA', t1: 'GSW', s1: '101', t2: 'LAL', s2: '99', time: 'Q3 5:12', live: true },
  { sport: 'FIFA', t1: 'MCI', s1: '2', t2: 'ARS', s2: '2', time: "75'", live: true },
  { sport: 'NFL', t1: 'KC', s1: '24', t2: 'DAL', s2: '17', time: 'FINAL', live: false },
  { sport: 'MLB', t1: 'NYY', s1: '4', t2: 'BOS', s2: '3', time: 'BOT 7', live: true },
  { sport: 'NHL', t1: 'TOR', s1: '3', t2: 'MTL', s2: '1', time: 'FINAL', live: false },
  { sport: 'MMA / UFC', t1: 'JONES', s1: 'W', t2: 'MIOCIC', s2: 'L', time: 'R3 KO', live: false },
  {
    sport: 'NBA',
    t1: 'MIL',
    s1: '—',
    t2: 'MIA',
    s2: '—',
    time: '7:30 PM ET',
    live: false,
    upcomingStyle: true,
  },
]

export default function ScoresTicker() {
  return (
    <div className="scores-ticker">
      <div className="scores-ticker-inner">
        {GAMES.map((g, i) => (
          <div key={i} className="score-item">
            <div className="sport-label">{g.sport}</div>
            <div className="team-row">
              <span>{g.t1}</span>
              <span className="score-val">{g.s1}</span>
            </div>
            <div className="team-row">
              <span>{g.t2}</span>
              <span className="score-val">{g.s2}</span>
            </div>
            <div
              className={`game-time${g.live ? ' live' : ''}`}
              style={g.upcomingStyle ? { color: '#0066cc' } : undefined}
            >
              {g.time}
            </div>
          </div>
        ))}
        <button type="button" className="all-scores-btn">
          ALL SCORES
        </button>
      </div>
    </div>
  )
}
