import SubPanel from '../SubPanel'
import SectionHeader from '../SectionHeader'
import GameRow from '../GameRow'

export default function NbaPanel({ active, activeSubId }) {
  return (
    <div className={`content-panel${active ? ' active' : ''}`} id="panel-nba">
      <div className="sport-grid">
        <div>
          <SubPanel id="nba-players" activeId={activeSubId}>
            <SectionHeader title="NBA Players" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">All Players — 2025–26 Season</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Pos</th>
                    <th>PPG</th>
                    <th>RPG</th>
                    <th>APG</th>
                    <th>FG%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="rank-muted">1</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏀</div>
                        <div>
                          <div className="pname">Luka Dončić</div>
                          <div className="pteam">Dallas Mavericks</div>
                        </div>
                      </div>
                    </td>
                    <td>DAL</td>
                    <td>PG</td>
                    <td className="stat-hi">33.2</td>
                    <td>8.6</td>
                    <td>9.4</td>
                    <td>47.3%</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">2</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏀</div>
                        <div>
                          <div className="pname">Giannis Antetokounmpo</div>
                          <div className="pteam">Milwaukee Bucks</div>
                        </div>
                      </div>
                    </td>
                    <td>MIL</td>
                    <td>PF</td>
                    <td className="stat-hi">31.7</td>
                    <td>11.8</td>
                    <td>5.9</td>
                    <td>57.1%</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">3</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏀</div>
                        <div>
                          <div className="pname">Stephen Curry</div>
                          <div className="pteam">Golden State Warriors</div>
                        </div>
                      </div>
                    </td>
                    <td>GSW</td>
                    <td>PG</td>
                    <td className="stat-hi">30.1</td>
                    <td>5.1</td>
                    <td>6.3</td>
                    <td>48.7%</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">4</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏀</div>
                        <div>
                          <div className="pname">LeBron James</div>
                          <div className="pteam">Los Angeles Lakers</div>
                        </div>
                      </div>
                    </td>
                    <td>LAL</td>
                    <td>SF</td>
                    <td className="stat-hi">28.4</td>
                    <td>7.3</td>
                    <td>8.1</td>
                    <td>52.4%</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">5</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏀</div>
                        <div>
                          <div className="pname">Jayson Tatum</div>
                          <div className="pteam">Boston Celtics</div>
                        </div>
                      </div>
                    </td>
                    <td>BOS</td>
                    <td>SF</td>
                    <td className="stat-hi">27.8</td>
                    <td>8.2</td>
                    <td>4.7</td>
                    <td>46.9%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nba-player-stats" activeId={activeSubId}>
            <SectionHeader title="Player Stats" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Scoring Leaders — 2025–26</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>GP</th>
                    <th>MIN</th>
                    <th>PPG</th>
                    <th>FGM</th>
                    <th>3PM</th>
                    <th>FTM</th>
                    <th>+/-</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="rank-muted">1</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏀</div>
                        <div>
                          <div className="pname">Luka Dončić</div>
                          <div className="pteam">Dallas Mavericks</div>
                        </div>
                      </div>
                    </td>
                    <td>58</td>
                    <td>36.2</td>
                    <td className="stat-hi">33.2</td>
                    <td>11.4</td>
                    <td>3.8</td>
                    <td>7.6</td>
                    <td className="trend-up">+7.2</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">2</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏀</div>
                        <div>
                          <div className="pname">Giannis Antetokounmpo</div>
                          <div className="pteam">Milwaukee Bucks</div>
                        </div>
                      </div>
                    </td>
                    <td>61</td>
                    <td>34.8</td>
                    <td className="stat-hi">31.7</td>
                    <td>12.1</td>
                    <td>1.1</td>
                    <td>7.4</td>
                    <td className="trend-up">+9.1</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">3</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏀</div>
                        <div>
                          <div className="pname">Stephen Curry</div>
                          <div className="pteam">Golden State Warriors</div>
                        </div>
                      </div>
                    </td>
                    <td>55</td>
                    <td>33.1</td>
                    <td className="stat-hi">30.1</td>
                    <td>10.1</td>
                    <td>5.2</td>
                    <td>4.7</td>
                    <td className="trend-up">+5.4</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">4</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏀</div>
                        <div>
                          <div className="pname">LeBron James</div>
                          <div className="pteam">Los Angeles Lakers</div>
                        </div>
                      </div>
                    </td>
                    <td>60</td>
                    <td>35.5</td>
                    <td className="stat-hi">28.4</td>
                    <td>10.7</td>
                    <td>2.1</td>
                    <td>5.0</td>
                    <td className="trend-dn">-1.2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nba-player-leaders" activeId={activeSubId}>
            <SectionHeader title="Player Leaderboards" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Top Performers by Category</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Category</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🥇</td>
                    <td>Luka Dončić</td>
                    <td>Scoring</td>
                    <td className="stat-hi">33.2 PPG</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>Nikola Jokić</td>
                    <td>Rebounding</td>
                    <td className="stat-hi">12.8 RPG</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>Tyrese Haliburton</td>
                    <td>Assists</td>
                    <td className="stat-hi">11.3 APG</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>Victor Wembanyama</td>
                    <td>Blocks</td>
                    <td className="stat-hi">3.7 BPG</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>De&apos;Aaron Fox</td>
                    <td>Steals</td>
                    <td className="stat-hi">2.2 SPG</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nba-teams" activeId={activeSubId}>
            <SectionHeader title="NBA Teams" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">All Teams — 2025–26</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Seed</th>
                    <th>Team</th>
                    <th>W</th>
                    <th>L</th>
                    <th>PCT</th>
                    <th>Conf</th>
                    <th>PPG</th>
                    <th>OPP PPG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="seed-badge">1E</span>
                    </td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏀</div>
                        <div>
                          <div className="pname">Boston Celtics</div>
                          <div className="pteam">Eastern Conference</div>
                        </div>
                      </div>
                    </td>
                    <td>52</td>
                    <td>15</td>
                    <td className="stat-hi">.776</td>
                    <td>34-8</td>
                    <td>121.4</td>
                    <td>108.2</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">2E</span>
                    </td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏀</div>
                        <div>
                          <div className="pname">Milwaukee Bucks</div>
                          <div className="pteam">Eastern Conference</div>
                        </div>
                      </div>
                    </td>
                    <td>48</td>
                    <td>19</td>
                    <td className="stat-hi">.716</td>
                    <td>28-14</td>
                    <td>118.7</td>
                    <td>111.1</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">1W</span>
                    </td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏀</div>
                        <div>
                          <div className="pname">Oklahoma City Thunder</div>
                          <div className="pteam">Western Conference</div>
                        </div>
                      </div>
                    </td>
                    <td>54</td>
                    <td>13</td>
                    <td className="stat-hi">.806</td>
                    <td>32-10</td>
                    <td>120.2</td>
                    <td>105.9</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">2W</span>
                    </td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏀</div>
                        <div>
                          <div className="pname">Denver Nuggets</div>
                          <div className="pteam">Western Conference</div>
                        </div>
                      </div>
                    </td>
                    <td>49</td>
                    <td>18</td>
                    <td className="stat-hi">.731</td>
                    <td>30-12</td>
                    <td>116.8</td>
                    <td>109.4</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nba-team-stats" activeId={activeSubId}>
            <SectionHeader title="Team Stats & Standings" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Eastern Conference Standings</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Seed</th>
                    <th>Team</th>
                    <th>W</th>
                    <th>L</th>
                    <th>GB</th>
                    <th>Streak</th>
                    <th>Home</th>
                    <th>Away</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="seed-badge">1</span>
                    </td>
                    <td>Boston Celtics</td>
                    <td>52</td>
                    <td>15</td>
                    <td>—</td>
                    <td className="trend-up">W5</td>
                    <td>28-6</td>
                    <td>24-9</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">2</span>
                    </td>
                    <td>Milwaukee Bucks</td>
                    <td>48</td>
                    <td>19</td>
                    <td>4</td>
                    <td className="trend-up">W3</td>
                    <td>26-7</td>
                    <td>22-12</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">3</span>
                    </td>
                    <td>Cleveland Cavaliers</td>
                    <td>45</td>
                    <td>22</td>
                    <td>7</td>
                    <td className="trend-dn">L2</td>
                    <td>24-9</td>
                    <td>21-13</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">4</span>
                    </td>
                    <td>New York Knicks</td>
                    <td>43</td>
                    <td>24</td>
                    <td>9</td>
                    <td className="trend-up">W1</td>
                    <td>23-10</td>
                    <td>20-14</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">5</span>
                    </td>
                    <td>Philadelphia 76ers</td>
                    <td>40</td>
                    <td>27</td>
                    <td>12</td>
                    <td className="trend-dn">L1</td>
                    <td>22-11</td>
                    <td>18-16</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nba-team-leaders" activeId={activeSubId}>
            <SectionHeader title="Team Leaderboards" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Best Teams by Category</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Team</th>
                    <th>Category</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🥇</td>
                    <td>Boston Celtics</td>
                    <td>Offense (PPG)</td>
                    <td className="stat-hi">121.4</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>Oklahoma City Thunder</td>
                    <td>Defense (OPP PPG)</td>
                    <td className="stat-hi">105.9</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>Boston Celtics</td>
                    <td>3P Made Per Game</td>
                    <td className="stat-hi">16.2</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>Denver Nuggets</td>
                    <td>Assists Per Game</td>
                    <td className="stat-hi">29.4</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nba-scores-tab" activeId={activeSubId}>
            <SectionHeader title="Scores & Schedule" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Today&apos;s Games — March 23, 2026</div>
              </div>
              <div>
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
                    { name: 'GS Warriors', score: '101', win: true },
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
                  info="7:30 PM ET · FTX Arena"
                />
              </div>
            </div>
          </SubPanel>
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
            <div className="sb-news-row">
              <div className="sb-news-title">Curry Breaks His Own 3-Point Record</div>
              <div className="sb-news-meta">2 days ago</div>
            </div>
          </div>
          <div className="sidebar-block">
            <div className="sidebar-block-title">Quick Stats</div>
            <div className="sb-stat-row">
              <span className="sb-stat-label">Scoring Leader</span>
              <span className="sb-stat-val">Dončić 33.2</span>
            </div>
            <div className="sb-stat-row">
              <span className="sb-stat-label">Rebound Leader</span>
              <span className="sb-stat-val">Jokić 12.8</span>
            </div>
            <div className="sb-stat-row">
              <span className="sb-stat-label">Assist Leader</span>
              <span className="sb-stat-val">Haliburton 11.3</span>
            </div>
            <div className="sb-stat-row">
              <span className="sb-stat-label">Block Leader</span>
              <span className="sb-stat-val">Wemby 3.7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
