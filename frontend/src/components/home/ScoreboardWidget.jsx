import { useState } from 'react'
import GameRow from '../GameRow'

const TABS = [
  { id: 'nba', label: 'NBA' },
  { id: 'fifa', label: 'FIFA' },
  { id: 'nfl', label: 'NFL' },
  { id: 'mlb', label: 'MLB' },
]

export default function ScoreboardWidget() {
  const [tab, setTab] = useState('nba')

  return (
    <div className="scoreboard-widget">
      <div className="sb-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`sb-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'nba' && (
        <div id="sb-nba">
          <GameRow
            badgeClass="badge-live"
            badgeText="LIVE"
            teamRows={[
              { name: 'Boston Celtics', score: '114', win: true },
              { name: 'NY Knicks', score: '108' },
            ]}
            info="Q4 2:34 · TD Garden"
          />
          <GameRow
            badgeClass="badge-live"
            badgeText="LIVE"
            teamRows={[
              { name: 'Golden State Warriors', score: '101', win: true },
              { name: 'LA Lakers', score: '99' },
            ]}
            info="Q3 5:12 · Chase Center"
          />
          <GameRow
            badgeClass="badge-final"
            badgeText="FINAL"
            teamRows={[
              { name: 'Denver Nuggets', score: '118', win: true },
              { name: 'OKC Thunder', score: '112' },
            ]}
            info="Final · Ball Arena"
          />
          <GameRow
            badgeClass="badge-upcoming"
            badgeText="7:30"
            teamRows={[
              { name: 'Milwaukee Bucks', score: '—' },
              { name: 'Miami Heat', score: '—' },
            ]}
            info="7:30 PM ET"
          />
        </div>
      )}
      {tab === 'fifa' && (
        <div id="sb-fifa">
          <GameRow
            badgeClass="badge-live"
            badgeText="LIVE"
            teamRows={[
              { name: 'Man City', score: '2' },
              { name: 'Arsenal', score: '2' },
            ]}
            info="75' · Etihad Stadium"
          />
          <GameRow
            badgeClass="badge-final"
            badgeText="FINAL"
            teamRows={[
              { name: 'Real Madrid', score: '3', win: true },
              { name: 'Barcelona', score: '1' },
            ]}
            info="Final · Bernabéu"
          />
        </div>
      )}
      {tab === 'nfl' && (
        <div id="sb-nfl">
          <GameRow
            badgeClass="badge-final"
            badgeText="FINAL"
            teamRows={[
              { name: 'Kansas City Chiefs', score: '24', win: true },
              { name: 'Dallas Cowboys', score: '17' },
            ]}
            info="Final · Arrowhead"
          />
          <GameRow
            badgeClass="badge-final"
            badgeText="FINAL"
            teamRows={[
              { name: 'SF 49ers', score: '31', win: true },
              { name: 'Philadelphia Eagles', score: '28' },
            ]}
            info="Final OT"
          />
        </div>
      )}
      {tab === 'mlb' && (
        <div id="sb-mlb">
          <GameRow
            badgeClass="badge-live"
            badgeText="LIVE"
            teamRows={[
              { name: 'NY Yankees', score: '4', win: true },
              { name: 'Boston Red Sox', score: '3' },
            ]}
            info="Bot 7th · Yankee Stadium"
          />
        </div>
      )}
    </div>
  )
}
