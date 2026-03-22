import SubPanel from '../SubPanel'
import SectionHeader from '../SectionHeader'
import GameRow from '../GameRow'

export default function FifaPanel({ active, activeSubId }) {
  return (
    <div className={`content-panel${active ? ' active' : ''}`} id="panel-fifa">
      <div className="sport-grid">
        <div>
          <SubPanel id="fifa-players" activeId={activeSubId}>
            <SectionHeader title="Soccer Players" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Top Players — 2025–26</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Club</th>
                    <th>Pos</th>
                    <th>Goals</th>
                    <th>Assists</th>
                    <th>Apps</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="rank-muted">1</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚽</div>
                        <div>
                          <div className="pname">Erling Haaland</div>
                          <div className="pteam">Manchester City</div>
                        </div>
                      </div>
                    </td>
                    <td>MCI</td>
                    <td>ST</td>
                    <td className="stat-hi">38</td>
                    <td>8</td>
                    <td>36</td>
                    <td>9.3</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">2</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚽</div>
                        <div>
                          <div className="pname">Kylian Mbappé</div>
                          <div className="pteam">Real Madrid</div>
                        </div>
                      </div>
                    </td>
                    <td>RMA</td>
                    <td>FW</td>
                    <td className="stat-hi">31</td>
                    <td>12</td>
                    <td>38</td>
                    <td>9.1</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">3</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚽</div>
                        <div>
                          <div className="pname">Vinicius Jr.</div>
                          <div className="pteam">Real Madrid</div>
                        </div>
                      </div>
                    </td>
                    <td>RMA</td>
                    <td>LW</td>
                    <td className="stat-hi">24</td>
                    <td>19</td>
                    <td>37</td>
                    <td>8.8</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">4</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚽</div>
                        <div>
                          <div className="pname">Bukayo Saka</div>
                          <div className="pteam">Arsenal</div>
                        </div>
                      </div>
                    </td>
                    <td>ARS</td>
                    <td>RW</td>
                    <td className="stat-hi">21</td>
                    <td>17</td>
                    <td>39</td>
                    <td>8.7</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="fifa-player-stats" activeId={activeSubId}>
            <SectionHeader title="Player Stats" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Goal Scoring Stats</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Goals</th>
                    <th>xG</th>
                    <th>Shots</th>
                    <th>Shots/G</th>
                    <th>Conv%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="rank-muted">1</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚽</div>
                        <div>
                          <div className="pname">Erling Haaland</div>
                          <div className="pteam">Man City</div>
                        </div>
                      </div>
                    </td>
                    <td className="stat-hi">38</td>
                    <td>35.1</td>
                    <td>142</td>
                    <td>3.9</td>
                    <td>26.8%</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">2</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚽</div>
                        <div>
                          <div className="pname">Kylian Mbappé</div>
                          <div className="pteam">Real Madrid</div>
                        </div>
                      </div>
                    </td>
                    <td className="stat-hi">31</td>
                    <td>28.4</td>
                    <td>120</td>
                    <td>3.2</td>
                    <td>25.8%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="fifa-player-leaders" activeId={activeSubId}>
            <SectionHeader title="Player Leaderboards" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Award Race</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Award</th>
                    <th>Leader</th>
                    <th>Club</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🥇 Golden Boot</td>
                    <td>Erling Haaland</td>
                    <td>Man City</td>
                    <td className="stat-hi">38 Goals</td>
                  </tr>
                  <tr>
                    <td>🎯 Most Assists</td>
                    <td>Kevin De Bruyne</td>
                    <td>Man City</td>
                    <td className="stat-hi">22</td>
                  </tr>
                  <tr>
                    <td>🧤 Best GK</td>
                    <td>Alisson Becker</td>
                    <td>Liverpool</td>
                    <td className="stat-hi">0.71 GA/G</td>
                  </tr>
                  <tr>
                    <td>⭐ Best Rating</td>
                    <td>Erling Haaland</td>
                    <td>Man City</td>
                    <td className="stat-hi">9.3</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="fifa-teams" activeId={activeSubId}>
            <SectionHeader title="Soccer Teams" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Premier League Table</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Club</th>
                    <th>P</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>GD</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="seed-badge">1</span>
                    </td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚽</div>
                        <div>
                          <div className="pname">Arsenal</div>
                        </div>
                      </div>
                    </td>
                    <td>29</td>
                    <td>20</td>
                    <td>7</td>
                    <td>2</td>
                    <td>+42</td>
                    <td className="stat-hi">67</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">2</span>
                    </td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚽</div>
                        <div>
                          <div className="pname">Manchester City</div>
                        </div>
                      </div>
                    </td>
                    <td>29</td>
                    <td>19</td>
                    <td>6</td>
                    <td>4</td>
                    <td>+38</td>
                    <td className="stat-hi">63</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">3</span>
                    </td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚽</div>
                        <div>
                          <div className="pname">Liverpool</div>
                        </div>
                      </div>
                    </td>
                    <td>29</td>
                    <td>18</td>
                    <td>7</td>
                    <td>4</td>
                    <td>+35</td>
                    <td className="stat-hi">61</td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚽</div>
                        <div>
                          <div className="pname">Chelsea</div>
                        </div>
                      </div>
                    </td>
                    <td>29</td>
                    <td>15</td>
                    <td>8</td>
                    <td>6</td>
                    <td>+18</td>
                    <td className="stat-hi">53</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="fifa-team-stats" activeId={activeSubId}>
            <SectionHeader title="Team Stats & Standings" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Team Performance Metrics</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Club</th>
                    <th>Goals</th>
                    <th>xG</th>
                    <th>Poss%</th>
                    <th>Pass%</th>
                    <th>Clean Sheets</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Manchester City</td>
                    <td className="stat-hi">71</td>
                    <td>65.3</td>
                    <td>63.1%</td>
                    <td>88.2%</td>
                    <td>14</td>
                  </tr>
                  <tr>
                    <td>Arsenal</td>
                    <td className="stat-hi">62</td>
                    <td>58.8</td>
                    <td>58.4%</td>
                    <td>86.7%</td>
                    <td>16</td>
                  </tr>
                  <tr>
                    <td>Liverpool</td>
                    <td className="stat-hi">60</td>
                    <td>55.1</td>
                    <td>55.8%</td>
                    <td>85.3%</td>
                    <td>13</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="fifa-team-leaders" activeId={activeSubId}>
            <SectionHeader title="Team Leaderboards" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Best Teams by Category</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Club</th>
                    <th>Category</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🥇</td>
                    <td>Manchester City</td>
                    <td>Most Goals Scored</td>
                    <td className="stat-hi">71</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>Arsenal</td>
                    <td>Most Clean Sheets</td>
                    <td className="stat-hi">16</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>Man City</td>
                    <td>Highest Possession</td>
                    <td className="stat-hi">63.1%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="fifa-scores-tab" activeId={activeSubId}>
            <SectionHeader title="Scores & Fixtures" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Today&apos;s Matches</div>
              </div>
              <div>
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
            </div>
          </SubPanel>
        </div>

        <div>
          <div className="sidebar-block">
            <div className="sidebar-block-title">Soccer News</div>
            <div className="sb-news-row">
              <div className="sb-news-title">Haaland Named UCL Player of the Month</div>
              <div className="sb-news-meta">4 hrs ago</div>
            </div>
            <div className="sb-news-row">
              <div className="sb-news-title">FIFA World Cup 2026 Group Draw Revealed</div>
              <div className="sb-news-meta">1 day ago</div>
            </div>
            <div className="sb-news-row">
              <div className="sb-news-title">Premier League Title Race: Arsenal vs Man City</div>
              <div className="sb-news-meta">2 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
