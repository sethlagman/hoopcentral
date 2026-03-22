import SubPanel from '../SubPanel'
import SectionHeader from '../SectionHeader'
import GameRow from '../GameRow'

export default function NflPanel({ active, activeSubId }) {
  return (
    <div className={`content-panel${active ? ' active' : ''}`} id="panel-nfl">
      <div className="sport-grid">
        <div>
          <SubPanel id="nfl-players" activeId={activeSubId}>
            <SectionHeader title="NFL Players" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Top Players — 2025 Season</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Pos</th>
                    <th>Yards</th>
                    <th>TDs</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="rank-muted">1</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏈</div>
                        <div>
                          <div className="pname">Patrick Mahomes</div>
                          <div className="pteam">Kansas City Chiefs</div>
                        </div>
                      </div>
                    </td>
                    <td>KC</td>
                    <td>QB</td>
                    <td className="stat-hi">4,839</td>
                    <td>38</td>
                    <td>113.4</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">2</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏈</div>
                        <div>
                          <div className="pname">Jalen Hurts</div>
                          <div className="pteam">Philadelphia Eagles</div>
                        </div>
                      </div>
                    </td>
                    <td>PHI</td>
                    <td>QB</td>
                    <td className="stat-hi">4,211</td>
                    <td>34</td>
                    <td>108.7</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">3</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏈</div>
                        <div>
                          <div className="pname">Tyreek Hill</div>
                          <div className="pteam">Miami Dolphins</div>
                        </div>
                      </div>
                    </td>
                    <td>MIA</td>
                    <td>WR</td>
                    <td className="stat-hi">1,842</td>
                    <td>14</td>
                    <td>—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nfl-player-stats" activeId={activeSubId}>
            <SectionHeader title="Player Stats" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">QB Passing Stats</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>CMP%</th>
                    <th>YDS</th>
                    <th>TD</th>
                    <th>INT</th>
                    <th>RTG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="rank-muted">1</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏈</div>
                        <div>
                          <div className="pname">Patrick Mahomes</div>
                          <div className="pteam">KC Chiefs</div>
                        </div>
                      </div>
                    </td>
                    <td>67.4%</td>
                    <td className="stat-hi">4,839</td>
                    <td>38</td>
                    <td>7</td>
                    <td>113.4</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">2</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🏈</div>
                        <div>
                          <div className="pname">Jalen Hurts</div>
                          <div className="pteam">Philadelphia</div>
                        </div>
                      </div>
                    </td>
                    <td>65.8%</td>
                    <td className="stat-hi">4,211</td>
                    <td>34</td>
                    <td>9</td>
                    <td>108.7</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nfl-player-leaders" activeId={activeSubId}>
            <SectionHeader title="Player Leaderboards" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Category Leaders</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🥇 Passing Yards</td>
                    <td>Patrick Mahomes</td>
                    <td>KC</td>
                    <td className="stat-hi">4,839</td>
                  </tr>
                  <tr>
                    <td>🥇 Rushing Yards</td>
                    <td>Derrick Henry</td>
                    <td>BAL</td>
                    <td className="stat-hi">1,921</td>
                  </tr>
                  <tr>
                    <td>🥇 Receiving Yards</td>
                    <td>Tyreek Hill</td>
                    <td>MIA</td>
                    <td className="stat-hi">1,842</td>
                  </tr>
                  <tr>
                    <td>🥇 Sacks</td>
                    <td>Micah Parsons</td>
                    <td>DAL</td>
                    <td className="stat-hi">17.5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nfl-teams" activeId={activeSubId}>
            <SectionHeader title="NFL Teams" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">AFC Standings — 2025</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Seed</th>
                    <th>Team</th>
                    <th>W</th>
                    <th>L</th>
                    <th>T</th>
                    <th>PCT</th>
                    <th>PF</th>
                    <th>PA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="seed-badge">1</span>
                    </td>
                    <td>Kansas City Chiefs</td>
                    <td>14</td>
                    <td>3</td>
                    <td>0</td>
                    <td className="stat-hi">.824</td>
                    <td>496</td>
                    <td>348</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">2</span>
                    </td>
                    <td>Baltimore Ravens</td>
                    <td>12</td>
                    <td>5</td>
                    <td>0</td>
                    <td className="stat-hi">.706</td>
                    <td>442</td>
                    <td>371</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">3</span>
                    </td>
                    <td>Miami Dolphins</td>
                    <td>11</td>
                    <td>6</td>
                    <td>0</td>
                    <td className="stat-hi">.647</td>
                    <td>420</td>
                    <td>390</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nfl-team-stats" activeId={activeSubId}>
            <SectionHeader title="Team Stats & Standings" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Offensive Team Rankings</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Team</th>
                    <th>PPG</th>
                    <th>YPG</th>
                    <th>Rush YPG</th>
                    <th>Pass YPG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Kansas City Chiefs</td>
                    <td className="stat-hi">29.2</td>
                    <td>385.3</td>
                    <td>128.4</td>
                    <td>256.9</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Miami Dolphins</td>
                    <td className="stat-hi">27.8</td>
                    <td>402.1</td>
                    <td>110.2</td>
                    <td>291.9</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nfl-team-leaders" activeId={activeSubId}>
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
                    <td>Miami Dolphins</td>
                    <td>Most Total Yards</td>
                    <td className="stat-hi">402.1 YPG</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>KC Chiefs</td>
                    <td>Most Points</td>
                    <td className="stat-hi">29.2 PPG</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>SF 49ers</td>
                    <td>Best Defense</td>
                    <td className="stat-hi">16.4 PA/G</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="nfl-scores-tab" activeId={activeSubId}>
            <SectionHeader title="Scores & Schedule" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Latest Results</div>
              </div>
              <div>
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
            </div>
          </SubPanel>
        </div>

        <div>
          <div className="sidebar-block">
            <div className="sidebar-block-title">NFL News</div>
            <div className="sb-news-row">
              <div className="sb-news-title">Chiefs Dynasty: 4 Super Bowls in 6 Years</div>
              <div className="sb-news-meta">2 hrs ago</div>
            </div>
            <div className="sb-news-row">
              <div className="sb-news-title">Mahomes Signs Historic $300M Extension</div>
              <div className="sb-news-meta">8 hrs ago</div>
            </div>
            <div className="sb-news-row">
              <div className="sb-news-title">2026 NFL Draft: Top 10 Prospects Ranked</div>
              <div className="sb-news-meta">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
