import SectionHeader from '../SectionHeader'
import ScoreboardWidget from './ScoreboardWidget'

const FEATURED = [
  {
    big: true,
    thumb: '🏀',
    tag: 'NBA',
    title: 'LeBron & Davis Dominate — Lakers Storm Back Into Playoff Picture',
    meta: '2 hours ago',
  },
  {
    thumb: '⚽',
    tag: 'FIFA',
    title: 'Mbappé Hat-Trick Sends Real Madrid to UCL Semi-Finals',
    meta: '5 hours ago',
  },
  {
    thumb: '🏈',
    tag: 'NFL',
    title: 'Mahomes Signs Record Extension: $300M Over 5 Years',
    meta: '8 hours ago',
  },
]

const PLAYERS = [
  {
    thumb: '🏀',
    sport: 'NBA',
    name: 'LeBron James',
    team: 'Los Angeles Lakers · #23',
    stats: [
      { val: '28.4', label: 'PPG' },
      { val: '8.1', label: 'APG' },
      { val: '7.3', label: 'RPG' },
    ],
  },
  {
    thumb: '⚽',
    sport: 'FIFA',
    name: 'Kylian Mbappé',
    team: 'Real Madrid · FW',
    stats: [
      { val: '31', label: 'Goals' },
      { val: '12', label: 'Assists' },
      { val: '9.1', label: 'Rating' },
    ],
  },
  {
    thumb: '🏈',
    sport: 'NFL',
    name: 'Patrick Mahomes',
    team: 'Kansas City Chiefs · QB',
    stats: [
      { val: '4,839', label: 'Pass Yds' },
      { val: '38', label: 'TDs' },
      { val: '7', label: 'INTs' },
    ],
  },
]

const VIDEOS = [
  {
    thumb: '🏀',
    title: 'Curry Drops 51 in Overtime Thriller vs Clippers',
    meta: 'NBA · 2.3M views · 1 day ago',
  },
  {
    thumb: '⚽',
    title: 'Top 10 Goals: UEFA Champions League Week 28',
    meta: 'FIFA · 1.8M views · 12 hrs ago',
  },
  {
    thumb: '🏈',
    title: 'Every TD from the NFL Playoff Weekend',
    meta: 'NFL · 5.1M views · 3 days ago',
  },
  {
    thumb: '🥊',
    title: 'Jones KO Highlights — Full Fight Breakdown',
    meta: 'UFC · 4.4M views · 2 days ago',
  },
]

const MORE_STORIES = [
  { title: 'Celtics Clinch East\'s Top Seed After Knicks Win', meta: 'NBA · 3 hrs ago' },
  { title: 'FIFA World Cup 2026: Full Group Stage Draw Revealed', meta: 'FIFA · 5 hrs ago' },
  { title: 'NFL Free Agency: Top 10 Moves That Shook the League', meta: 'NFL · 1 day ago' },
  { title: 'Ohtani Goes 3-for-4 With Two Home Runs vs Giants', meta: 'MLB · 6 hrs ago' },
  { title: 'Jon Jones Defends Title in Devastating Fashion', meta: 'UFC · 2 days ago' },
  { title: 'Avalanche Lead NHL in Goals After 60 Games', meta: 'NHL · 10 hrs ago' },
]

export default function HomePanel({ active }) {
  return (
    <div className={`content-panel${active ? ' active' : ''}`} id="panel-home">
      <div className="home-grid">
        <div>
          <SectionHeader title="Featured Stories" moreLabel="More Stories" />
          <div className="featured-grid">
            {FEATURED.map((s, i) => (
              <div key={i} className={`story-card${s.big ? ' big' : ''}`}>
                <div className="card-thumb">{s.thumb}</div>
                <div className="card-tag">{s.tag}</div>
                <div className="card-title">{s.title}</div>
                <div className="card-meta">{s.meta}</div>
              </div>
            ))}
          </div>

          <SectionHeader title="Player Spotlights" moreLabel="All Players" />
          <div className="players-grid">
            {PLAYERS.map((p, i) => (
              <div key={i} className="player-card">
                <div className="player-thumb">{p.thumb}</div>
                <div className="player-body">
                  <div className="player-sport-tag">{p.sport}</div>
                  <div className="player-name">{p.name}</div>
                  <div className="player-team">{p.team}</div>
                  <div className="player-stats">
                    {p.stats.map((st) => (
                      <div key={st.label}>
                        <div className="pstat-val">{st.val}</div>
                        <div className="pstat-label">{st.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <SectionHeader title="Trending Videos" moreLabel="More Videos" />
          <div className="videos-grid">
            {VIDEOS.map((v, i) => (
              <div key={i} className="video-card">
                <div className="video-thumb">
                  {v.thumb}
                  <div className="play-btn">▶</div>
                </div>
                <div className="video-title">{v.title}</div>
                <div className="video-meta">{v.meta}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="Live Scores" />
          <ScoreboardWidget />

          <SectionHeader title="More Stories" />
          <div className="more-stories">
            {MORE_STORIES.map((m, i) => (
              <div key={i} className="more-story-row">
                <div>
                  <div className="ms-title">{m.title}</div>
                  <div className="ms-meta">{m.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
