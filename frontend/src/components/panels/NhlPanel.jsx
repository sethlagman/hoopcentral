import SubPanel from '../SubPanel'
import SectionHeader from '../SectionHeader'
import GameRow from '../GameRow'

export default function NhlPanel({ active, activeSubId }) {
  return (
    <div className={`content-panel${active ? ' active' : ''}`} id="panel-nhl">
      <div className="sport-grid">
        <div>
          <SubPanel id="nhl-players" activeId={activeSubId}>
            <SectionHeader title="NHL Players" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Top Players — 2025–26</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Pos</th>
                    <th>G</th>
                    <th>A</th>
                    <th>Pts</th>
                    <th>+/-</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="rank-muted">1</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏒</div>
                        <div>
                          <div className="pname">Connor McDavid</div>
                          <div className="pteam">Edmonton Oilers</div>
                        </div>
                      </div>
                    </td>
                    <td>EDM</td>
                    <td>C</td>
                    <td>44</td>
                    <td>72</td>
                    <td className="stat-hi">116</td>
                    <td className="trend-up">+34</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">2</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏒</div>
                        <div>
                          <div className="pname">Nathan MacKinnon</div>
                          <div className="pteam">Colorado Avalanche</div>
                        </div>
                      </div>
                    </td>
                    <td>COL</td>
                    <td>C</td>
                    <td>42</td>
                    <td>68</td>
                    <td className="stat-hi">110</td>
                    <td className="trend-up">+28</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">3</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏒</div>
                        <div>
                          <div className="pname">David Pastrnak</div>
                          <div className="pteam">Boston Bruins</div>
                        </div>
                      </div>
                    </td>
                    <td>BOS</td>
                    <td>RW</td>
                    <td>48</td>
                    <td>41</td>
                    <td className="stat-hi">89</td>
                    <td className="trend-up">+21</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nhl-player-stats" activeId={activeSubId}>
            <SectionHeader title="Player Stats" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Points Leaders</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>GP</th>
                    <th>G</th>
                    <th>A</th>
                    <th>Pts</th>
                    <th>PIM</th>
                    <th>SH%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="rank-muted">1</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏒</div>
                        <div>
                          <div className="pname">Connor McDavid</div>
                        </div>
                      </div>
                    </td>
                    <td>62</td>
                    <td>44</td>
                    <td>72</td>
                    <td className="stat-hi">116</td>
                    <td>28</td>
                    <td>18.4%</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">2</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏒</div>
                        <div>
                          <div className="pname">Nathan MacKinnon</div>
                        </div>
                      </div>
                    </td>
                    <td>60</td>
                    <td>42</td>
                    <td>68</td>
                    <td className="stat-hi">110</td>
                    <td>34</td>
                    <td>17.9%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nhl-player-leaders" activeId={activeSubId}>
            <SectionHeader title="Player Leaderboards" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Award Leaders</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Award</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🥇 Points</td>
                    <td>Connor McDavid</td>
                    <td>EDM</td>
                    <td className="stat-hi">116</td>
                  </tr>
                  <tr>
                    <td>🥇 Goals</td>
                    <td>David Pastrnak</td>
                    <td>BOS</td>
                    <td className="stat-hi">48</td>
                  </tr>
                  <tr>
                    <td>🥇 Best GAA</td>
                    <td>Andrei Vasilevskiy</td>
                    <td>TBL</td>
                    <td className="stat-hi">2.11</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nhl-teams" activeId={activeSubId}>
            <SectionHeader title="NHL Teams" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Eastern Conference Standings</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Team</th>
                    <th>GP</th>
                    <th>W</th>
                    <th>L</th>
                    <th>OT</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="seed-badge">1</span>
                    </td>
                    <td>Boston Bruins</td>
                    <td>62</td>
                    <td>42</td>
                    <td>14</td>
                    <td>6</td>
                    <td className="stat-hi">90</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">2</span>
                    </td>
                    <td>Toronto Maple Leafs</td>
                    <td>62</td>
                    <td>38</td>
                    <td>18</td>
                    <td>6</td>
                    <td className="stat-hi">82</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">3</span>
                    </td>
                    <td>Tampa Bay Lightning</td>
                    <td>62</td>
                    <td>36</td>
                    <td>20</td>
                    <td>6</td>
                    <td className="stat-hi">78</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nhl-team-stats" activeId={activeSubId}>
            <SectionHeader title="Team Stats" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Offensive & Defensive Stats</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>GF/G</th>
                    <th>GA/G</th>
                    <th>PP%</th>
                    <th>PK%</th>
                    <th>SOG/G</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Colorado Avalanche</td>
                    <td className="stat-hi">3.82</td>
                    <td>2.91</td>
                    <td>26.4%</td>
                    <td>81.2%</td>
                    <td>34.8</td>
                  </tr>
                  <tr>
                    <td>Boston Bruins</td>
                    <td className="stat-hi">3.61</td>
                    <td>2.44</td>
                    <td>24.8%</td>
                    <td>84.7%</td>
                    <td>32.1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nhl-team-leaders" activeId={activeSubId}>
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
                    <td>Colorado Avalanche</td>
                    <td>Most Goals/Game</td>
                    <td className="stat-hi">3.82</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>Boston Bruins</td>
                    <td>Best Defense (GA/G)</td>
                    <td className="stat-hi">2.44</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>Florida Panthers</td>
                    <td>Best Power Play</td>
                    <td className="stat-hi">28.1%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nhl-scores-tab" activeId={activeSubId}>
            <SectionHeader title="Scores & Schedule" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Today&apos;s Games</div>
              </div>
              <div>
                <GameRow
                  badgeClass="badge-final"
                  badgeText="FINAL"
                  teamRows={[
                    { name: 'Toronto Maple Leafs', score: '3', win: true },
                    { name: 'Montréal Canadiens', score: '1' },
                  ]}
                  info="Final · Scotiabank Arena"
                />
              </div>
            </div>
          </SubPanel>
        </div>

        <div>
          <div className="sidebar-block">
            <div className="sidebar-block-title">NHL News</div>
            <div className="sb-news-row">
              <div className="sb-news-title">McDavid: On Pace for 130-Point Season</div>
              <div className="sb-news-meta">3 hrs ago</div>
            </div>
            <div className="sb-news-row">
              <div className="sb-news-title">Avalanche Lead NHL in Goals After 60 Games</div>
              <div className="sb-news-meta">10 hrs ago</div>
            </div>
            <div className="sb-news-row">
              <div className="sb-news-title">Stanley Cup Playoffs Picture Takes Shape</div>
              <div className="sb-news-meta">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
