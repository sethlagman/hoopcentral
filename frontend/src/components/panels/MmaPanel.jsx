import SubPanel from '../SubPanel'
import SectionHeader from '../SectionHeader'
import GameRow from '../GameRow'

export default function MmaPanel({ active, activeSubId }) {
  return (
    <div className={`content-panel${active ? ' active' : ''}`} id="panel-mma">
      <div className="sport-grid">
        <div>
          <SubPanel id="mma-players" activeId={activeSubId}>
            <SectionHeader title="Fighters" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">UFC Champions & Top Contenders</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fighter</th>
                    <th>Division</th>
                    <th>Record</th>
                    <th>Status</th>
                    <th>Last Fight</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="rank-muted">1</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🥊</div>
                        <div>
                          <div className="pname">Jon Jones</div>
                          <div className="pteam">Heavyweight</div>
                        </div>
                      </div>
                    </td>
                    <td>HW</td>
                    <td className="stat-hi">27-1</td>
                    <td>🏆 Champion</td>
                    <td className="trend-up">W (KO)</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">2</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🥊</div>
                        <div>
                          <div className="pname">Islam Makhachev</div>
                          <div className="pteam">Lightweight</div>
                        </div>
                      </div>
                    </td>
                    <td>LW</td>
                    <td className="stat-hi">26-1</td>
                    <td>🏆 Champion</td>
                    <td className="trend-up">W (Sub)</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">3</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🥊</div>
                        <div>
                          <div className="pname">Alex Pereira</div>
                          <div className="pteam">Light Heavyweight</div>
                        </div>
                      </div>
                    </td>
                    <td>LHW</td>
                    <td className="stat-hi">11-2</td>
                    <td>🏆 Champion</td>
                    <td className="trend-up">W (KO)</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">4</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🥊</div>
                        <div>
                          <div className="pname">Leon Edwards</div>
                          <div className="pteam">Welterweight</div>
                        </div>
                      </div>
                    </td>
                    <td>WW</td>
                    <td className="stat-hi">22-4</td>
                    <td>#1 Contender</td>
                    <td className="trend-up">W (Dec)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="mma-player-stats" activeId={activeSubId}>
            <SectionHeader title="Fighter Stats" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Performance Stats</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fighter</th>
                    <th>SLpM</th>
                    <th>Str. Acc</th>
                    <th>TD Avg</th>
                    <th>Sub Avg</th>
                    <th>KO%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="rank-muted">1</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🥊</div>
                        <div>
                          <div className="pname">Alex Pereira</div>
                        </div>
                      </div>
                    </td>
                    <td className="stat-hi">5.42</td>
                    <td>62.1%</td>
                    <td>0.4</td>
                    <td>0.2</td>
                    <td>72.7%</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">2</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🥊</div>
                        <div>
                          <div className="pname">Jon Jones</div>
                        </div>
                      </div>
                    </td>
                    <td className="stat-hi">4.30</td>
                    <td>58.4%</td>
                    <td>2.8</td>
                    <td>1.2</td>
                    <td>48.1%</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">3</td>
                    <td>
                      <div className="pcell">
                        <div className="pavatar">🥊</div>
                        <div>
                          <div className="pname">Islam Makhachev</div>
                        </div>
                      </div>
                    </td>
                    <td className="stat-hi">3.81</td>
                    <td>54.8%</td>
                    <td>4.2</td>
                    <td>2.1</td>
                    <td>23.1%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="mma-player-leaders" activeId={activeSubId}>
            <SectionHeader title="Fighter Leaderboards" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Pound-for-Pound Rankings</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>P4P Rank</th>
                    <th>Fighter</th>
                    <th>Division</th>
                    <th>Record</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="seed-badge">1</span>
                    </td>
                    <td>Jon Jones</td>
                    <td>Heavyweight</td>
                    <td className="stat-hi">27-1</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">2</span>
                    </td>
                    <td>Islam Makhachev</td>
                    <td>Lightweight</td>
                    <td className="stat-hi">26-1</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">3</span>
                    </td>
                    <td>Alex Pereira</td>
                    <td>Light Heavyweight</td>
                    <td className="stat-hi">11-2</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="seed-badge">4</span>
                    </td>
                    <td>Leon Edwards</td>
                    <td>Welterweight</td>
                    <td className="stat-hi">22-4</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="mma-teams" activeId={activeSubId}>
            <SectionHeader title="Gyms / Camps" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Top Training Camps</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Gym</th>
                    <th>Champions</th>
                    <th>Active Fighters</th>
                    <th>Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="rank-muted">1</td>
                    <td>City Kickboxing</td>
                    <td>1</td>
                    <td>12</td>
                    <td className="stat-hi">78.2%</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">2</td>
                    <td>American Kickboxing Academy</td>
                    <td>2</td>
                    <td>28</td>
                    <td className="stat-hi">74.3%</td>
                  </tr>
                  <tr>
                    <td className="rank-muted">3</td>
                    <td>American Top Team (ATT)</td>
                    <td>1</td>
                    <td>34</td>
                    <td className="stat-hi">71.8%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="mma-team-stats" activeId={activeSubId}>
            <SectionHeader title="Gym Stats" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Camp Performance Metrics</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Gym</th>
                    <th>Wins</th>
                    <th>KO%</th>
                    <th>Sub%</th>
                    <th>Dec%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>City Kickboxing</td>
                    <td>24</td>
                    <td className="stat-hi">58%</td>
                    <td>21%</td>
                    <td>21%</td>
                  </tr>
                  <tr>
                    <td>AKA</td>
                    <td>48</td>
                    <td>41%</td>
                    <td className="stat-hi">34%</td>
                    <td>25%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="mma-team-leaders" activeId={activeSubId}>
            <SectionHeader title="Gym Leaderboards" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Best Camps by Category</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Gym</th>
                    <th>Category</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🥇</td>
                    <td>City Kickboxing</td>
                    <td>Highest Win Rate</td>
                    <td className="stat-hi">78.2%</td>
                  </tr>
                  <tr>
                    <td>🥇</td>
                    <td>AKA</td>
                    <td>Most Active Fighters</td>
                    <td className="stat-hi">34</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubPanel>

          <SubPanel id="mma-scores-tab" activeId={activeSubId}>
            <SectionHeader title="Events & Results" />
            <div className="table-wrap">
              <div className="table-head">
                <div className="table-head-title">Recent & Upcoming UFC Events</div>
              </div>
              <div>
                <GameRow
                  badgeClass="badge-final"
                  badgeText="FINAL"
                  teamRows={[
                    { name: 'Jon Jones', score: 'W', win: true },
                    { name: 'Stipe Miocic', score: 'L' },
                  ]}
                  info="R3 KO · UFC 313 · T-Mobile Arena"
                />
                <GameRow
                  badgeClass="badge-upcoming"
                  badgeText="APR 5"
                  teamRows={[
                    { name: 'Islam Makhachev', score: '—' },
                    { name: 'Dustin Poirier', score: '—' },
                  ]}
                  info="UFC 314 · LW Title · Apr 5"
                />
              </div>
            </div>
          </SubPanel>
        </div>

        <div>
          <div className="sidebar-block">
            <div className="sidebar-block-title">MMA / UFC News</div>
            <div className="sb-news-row">
              <div className="sb-news-title">Jones KO Highlight Breaks UFC View Record</div>
              <div className="sb-news-meta">2 days ago</div>
            </div>
            <div className="sb-news-row">
              <div className="sb-news-title">UFC 314 Card Set: Makhachev vs Poirier</div>
              <div className="sb-news-meta">1 day ago</div>
            </div>
            <div className="sb-news-row">
              <div className="sb-news-title">Pereira Eyes Heavyweight Title Shot</div>
              <div className="sb-news-meta">3 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
