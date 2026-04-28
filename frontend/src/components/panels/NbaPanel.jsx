import NbaSidebarStats from '../nba/NbaSidebarStats.jsx'
import NbaPlayersSection from '../nba/NbaPlayersSection.jsx'
import NbaPlayerStatsSection from '../nba/NbaPlayerStatsSection.jsx'
import NbaLeadersSection from '../nba/NbaLeadersSection.jsx'
import NbaTeamsSection from '../nba/NbaTeamsSection.jsx'
import NbaStandingsSection from '../nba/NbaStandingsSection.jsx'
import NbaTeamCompareSection from '../nba/NbaTeamCompareSection.jsx'
import NbaScoresSection from '../nba/NbaScoresSection.jsx'

export default function NbaPanel({ active, activeSubId }) {
  return (
    <div className={`content-panel${active ? ' active' : ''}`} id="panel-nba">
      <div className="sport-grid">
        <div>
          <NbaPlayersSection activeId={activeSubId} />
          <NbaPlayerStatsSection activeId={activeSubId} />
          <NbaLeadersSection activeId={activeSubId} />
          <NbaTeamsSection activeId={activeSubId} />
          <NbaStandingsSection activeId={activeSubId} />
          <NbaTeamCompareSection activeId={activeSubId} />
          <NbaScoresSection activeId={activeSubId} />
        </div>

        <div>
          <div className="sidebar-block">
            <div className="sidebar-block-title">NBA News</div>
            <div className="sb-news-row">
              <div className="sb-news-title">Celtics Eye Record-Tying 18th Championship</div>
              <div className="sb-news-meta">3 hrs ago</div>
            </div>
            <div className="sb-news-row">
              <div className="sb-news-title">Wembanyama Named to All-NBA First Team</div>
              <div className="sb-news-meta">6 hrs ago</div>
            </div>
            <div className="sb-news-row">
              <div className="sb-news-title">Trade Deadline Recap: 12 Deals That Shook the League</div>
              <div className="sb-news-meta">1 day ago</div>
            </div>
          </div>
          <NbaSidebarStats active={active} />
        </div>
      </div>
    </div>
  )
}
