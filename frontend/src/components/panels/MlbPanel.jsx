import SubPanel from '../SubPanel'
import SectionHeader from '../SectionHeader'
import GameRow from '../GameRow'

export default function MlbPanel({ active, activeSubId }) {
  return (
    <div className={`content-panel${active ? ' active' : ''}`} id="panel-mlb">
      <div className="sport-grid">
        <div>
          <SubPanel id="mlb-players" activeId={activeSubId}>
            <SectionHeader title="MLB Players" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Top Players — 2026 Season</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Pos</th>
                    <th>AVG</th>
                    <th>HR</th>
                    <th>RBI</th>
                    <th>OPS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="rank-muted">1</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚾</div>
                        <div>
                          <div className="pname">Shohei Ohtani</div>
                          <div className="pteam">LA Dodgers</div>
                        </div>
                      </div>
                    </td>
                    <td>LAD</td>
                    <td>DH/P</td>
                    <td className="stat-hi">.312</td>
                    <td>44</td>
                    <td>112</td>
                    <td>1.074</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">2</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚾</div>
                        <div>
                          <div className="pname">Aaron Judge</div>
                          <div className="pteam">New York Yankees</div>
                        </div>
                      </div>
                    </td>
                    <td>NYY</td>
                    <td>RF</td>
                    <td className="stat-hi">.295</td>
                    <td>58</td>
                    <td>128</td>
                    <td>1.049</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">3</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚾</div>
                        <div>
                          <div className="pname">Ronald Acuña Jr.</div>
                          <div className="pteam">Atlanta Braves</div>
                        </div>
                      </div>
                    </td>
                    <td>ATL</td>
                    <td>RF</td>
                    <td className="stat-hi">.328</td>
                    <td>32</td>
                    <td>94</td>
                    <td>0.981</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="mlb-player-stats" activeId={activeSubId}>
            <SectionHeader title="Player Stats" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Batting Leaders</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>G</th>
                    <th>AB</th>
                    <th>H</th>
                    <th>HR</th>
                    <th>RBI</th>
                    <th>AVG</th>
                    <th>SLG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="rank-muted">1</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚾</div>
                        <div>
                          <div className="pname">Ronald Acuña Jr.</div>
                        </div>
                      </div>
                    </td>
                    <td>84</td>
                    <td>310</td>
                    <td>102</td>
                    <td>32</td>
                    <td>94</td>
                    <td className="stat-hi">.328</td>
                    <td>.601</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">2</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">⚾</div>
                        <div>
                          <div className="pname">Shohei Ohtani</div>
                        </div>
                      </div>
                    </td>
                    <td>82</td>
                    <td>294</td>
                    <td>91</td>
                    <td>44</td>
                    <td>112</td>
                    <td className="stat-hi">.312</td>
                    <td>.652</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="mlb-player-leaders" activeId={activeSubId}>
            <SectionHeader title="Player Leaderboards" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Award Race Leaders</div>
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
                    <td>🥇 Home Runs</td>
                    <td>Aaron Judge</td>
                    <td>NYY</td>
                    <td className="stat-hi">58</td>
                  </tr>
                  <tr>
                    <td>🥇 Batting Avg</td>
                    <td>Ronald Acuña Jr.</td>
                    <td>ATL</td>
                    <td className="stat-hi">.328</td>
                  </tr>
                  <tr>
                    <td>🥇 ERA</td>
                    <td>Spencer Strider</td>
                    <td>ATL</td>
                    <td className="stat-hi">1.87</td>
                  </tr>
                  <tr>
                    <td>🥇 Strikeouts</td>
                    <td>Gerrit Cole</td>
                    <td>NYY</td>
                    <td className="stat-hi">248</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="mlb-teams" activeId={activeSubId}>
            <SectionHeader title="MLB Teams" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">AL East Standings</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Team</th>
                    <th>W</th>
                    <th>L</th>
                    <th>PCT</th>
                    <th>GB</th>
                    <th>Streak</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="seed-badge">1</span>
                    </td>
                    <td>New York Yankees</td>
                    <td>52</td>
                    <td>32</td>
                    <td className="stat-hi">.619</td>
                    <td>—</td>
                    <td className="trend-up">W4</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">2</span>
                    </td>
                    <td>Boston Red Sox</td>
                    <td>46</td>
                    <td>38</td>
                    <td className="stat-hi">.548</td>
                    <td>6.0</td>
                    <td className="trend-dn">L1</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Tampa Bay Rays</td>
                    <td>44</td>
                    <td>40</td>
                    <td className="stat-hi">.524</td>
                    <td>8.0</td>
                    <td className="trend-up">W2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="mlb-team-stats" activeId={activeSubId}>
            <SectionHeader title="Team Stats" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Offensive Stats by Team</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>R/G</th>
                    <th>HR</th>
                    <th>AVG</th>
                    <th>OBP</th>
                    <th>SLG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>NY Yankees</td>
                    <td className="stat-hi">5.8</td>
                    <td>142</td>
                    <td>.271</td>
                    <td>.348</td>
                    <td>.492</td>
                  </tr>
                  <tr>
                    <td>Atlanta Braves</td>
                    <td className="stat-hi">5.6</td>
                    <td>128</td>
                    <td>.274</td>
                    <td>.352</td>
                    <td>.481</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="mlb-team-leaders" activeId={activeSubId}>
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
                    <td>NY Yankees</td>
                    <td>Most Runs/Game</td>
                    <td className="stat-hi">5.8</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>LA Dodgers</td>
                    <td>Best Team ERA</td>
                    <td className="stat-hi">3.12</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>Houston Astros</td>
                    <td>Best Fielding %</td>
                    <td className="stat-hi">.989</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="mlb-scores-tab" activeId={activeSubId}>
            <SectionHeader title="Scores & Schedule" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Today&apos;s Games</div>
              </div>
              <div>
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
            </div>
          </SubPanel>
        </div>

        <div>
          <div className="sidebar-block">
            <div className="sidebar-block-title">MLB News</div>
            <div className="sb-news-row">
              <div className="sb-news-title">Ohtani Goes 3-for-4 With Two Homers</div>
              <div className="sb-news-meta">6 hrs ago</div>
            </div>
            <div className="sb-news-row">
              <div className="sb-news-title">Judge on Pace to Break HR Record Again</div>
              <div className="sb-news-meta">1 day ago</div>
            </div>
            <div className="sb-news-row">
              <div className="sb-news-title">World Series Preview: Yankees vs Dodgers?</div>
              <div className="sb-news-meta">2 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
