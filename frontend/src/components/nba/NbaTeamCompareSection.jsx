import { useMemo, useState } from 'react'
import SectionHeader from '../SectionHeader'
import SubPanel from '../SubPanel'
import { DEFAULT_NBA_SEASON } from '../../config/api.js'
import { fetchSeasonSummary, fetchTeamCompare } from '../../api/hoopcentral.js'

export default function NbaTeamCompareSection({ activeId }) {
  const visible = activeId === 'nba-team-leaders'
  const [season, setSeason] = useState(DEFAULT_NBA_SEASON)
  const [tid1, setTid1] = useState('')
  const [tid2, setTid2] = useState('')
  const [cmp, setCmp] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [board, setBoard] = useState(null)
  const [bLoading, setBLoading] = useState(false)
  const [bErr, setBErr] = useState(null)

  const loadCompare = (e) => {
    e.preventDefault()
    if (!tid1.trim() || !tid2.trim()) return
    setLoading(true)
    setError(null)
    fetchTeamCompare(tid1.trim(), tid2.trim(), season.trim())
      .then(setCmp)
      .catch((err) => setError(err.message || String(err)))
      .finally(() => setLoading(false))
  }

  const loadBoard = (e) => {
    e.preventDefault()
    setBLoading(true)
    setBErr(null)
    fetchSeasonSummary(season.trim())
      .then((d) => setBoard(d?.standings ?? []))
      .catch((err) => setBErr(err.message || String(err)))
      .finally(() => setBLoading(false))
  }

  const topByWins = useMemo(() => {
    if (!board?.length) return []
    return [...board].sort((a, b) => (b.wins ?? 0) - (a.wins ?? 0)).slice(0, 8)
  }, [board])

  if (!visible) return null

  return (
    <SubPanel id="nba-team-leaders" activeId={activeId}>
      <SectionHeader title="Team matchups & ranks" />
      <div className="table-wrap">
        <div className="table-head">
          <div className="table-head-title">Head-to-head</div>
        </div>
        <form className="hc-toolbar" onSubmit={loadCompare}>
          <input
            className="hc-input hc-input-narrow"
            placeholder="Team A ID"
            value={tid1}
            onChange={(e) => setTid1(e.target.value)}
          />
          <input
            className="hc-input hc-input-narrow"
            placeholder="Team B ID"
            value={tid2}
            onChange={(e) => setTid2(e.target.value)}
          />
          <input
            className="hc-input"
            placeholder="Season"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          />
          <button type="submit" className="hc-btn" disabled={loading}>
            {loading ? 'Loading…' : 'Compare'}
          </button>
        </form>
        {error ? <div className="hc-api-msg hc-api-err">{error}</div> : null}
        {cmp ? (
          <div className="hc-compare-grid" style={{ marginTop: 14 }}>
            {['team_1', 'team_2'].map((k) => {
              const row = cmp[k]
              return (
                <div key={k} className="hc-card">
                  <div className="hc-card-title">{row.team_name ?? row.team}</div>
                  <div className="hc-muted">{row.season}</div>
                  <table>
                    <tbody>
                      <tr>
                        <td>W-L</td>
                        <td>
                          {row.wins}-{row.losses}
                        </td>
                      </tr>
                      <tr>
                        <td>PCT</td>
                        <td className="stat-hi">{row.winrate}</td>
                      </tr>
                      <tr>
                        <td>Conf rec</td>
                        <td>{row.conference_record}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>

      <div className="table-wrap" style={{ marginTop: 16 }}>
        <div className="table-head">
          <div className="table-head-title">Top of the standings</div>
        </div>
        <form className="hc-toolbar" onSubmit={loadBoard}>
          <input
            className="hc-input"
            placeholder="Season"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          />
          <button type="submit" className="hc-btn hc-btn-ghost" disabled={bLoading}>
            {bLoading ? 'Loading…' : 'Load leaderboard'}
          </button>
        </form>
        {bErr ? <div className="hc-api-msg hc-api-err">{bErr}</div> : null}
        {bLoading ? <div className="hc-api-msg">Loading…</div> : null}
        {!bLoading && board !== null ? (
          topByWins.length ? (
            <table style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>W</th>
                  <th>L</th>
                  <th>PCT</th>
                </tr>
              </thead>
              <tbody>
                {topByWins.map((row, i) => (
                  <tr key={row.id}>
                    <td>{i + 1}</td>
                    <td>{row.team_name ?? row.team}</td>
                    <td>{row.wins}</td>
                    <td>{row.losses}</td>
                    <td className="stat-hi">{row.winrate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="hc-muted" style={{ padding: '12px 16px' }}>
              No standings returned for that season.
            </p>
          )
        ) : null}
      </div>
    </SubPanel>
  )
}
