import { useState } from 'react'
import SectionHeader from '../SectionHeader'
import SubPanel from '../SubPanel'
import { DEFAULT_NBA_SEASON } from '../../config/api.js'
import {
  fetchPlayer,
  fetchPlayerCareerSummary,
  fetchPlayerStatistics,
  fetchPlayerStatisticsSeason,
  fetchStatisticList,
  fetchTeamRoster,
  fetchTeamStandings,
  fetchTeamStandingsSeason,
} from '../../api/hoopcentral.js'
import { ApiState } from './ApiUi.jsx'

export default function NbaPlayerStatsSection({ activeId }) {
  const visible = activeId === 'nba-player-stats'
  const [playerId, setPlayerId] = useState('')
  const [season, setSeason] = useState(DEFAULT_NBA_SEASON)
  const [teamId, setTeamId] = useState('')

  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [playerLookupDone, setPlayerLookupDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [seasonStats, setSeasonStats] = useState(null)
  const [ssLoading, setSsLoading] = useState(false)
  const [ssErr, setSsErr] = useState(null)
  const [seasonSliceRequested, setSeasonSliceRequested] = useState(false)

  const [career, setCareer] = useState(null)
  const [cLoading, setCLoading] = useState(false)
  const [cErr, setCErr] = useState(null)

  const [roster, setRoster] = useState(null)
  const [rLoading, setRLoading] = useState(false)
  const [rErr, setRErr] = useState(null)

  const [standings, setStandings] = useState(null)
  const [stLoading, setStLoading] = useState(false)
  const [stErr, setStErr] = useState(null)

  const [standingsSeason, setStandingsSeason] = useState(null)
  const [stsLoading, setStsLoading] = useState(false)
  const [stsErr, setStsErr] = useState(null)

  const [bulk, setBulk] = useState(null)
  const [bLoading, setBLoading] = useState(false)
  const [bErr, setBErr] = useState(null)

  const loadPlayer = (e) => {
    e.preventDefault()
    if (!playerId.trim()) return
    setLoading(true)
    setError(null)
    Promise.all([fetchPlayer(playerId.trim()), fetchPlayerStatistics(playerId.trim())])
      .then(([pl, st]) => {
        setProfile(pl)
        setStats(st)
      })
      .catch((err) => setError(err.message || String(err)))
      .finally(() => {
        setLoading(false)
        setPlayerLookupDone(true)
      })
  }

  const loadSeasonSlice = (e) => {
    e.preventDefault()
    if (!playerId.trim()) return
    setSeasonSliceRequested(true)
    setSsLoading(true)
    setSsErr(null)
    fetchPlayerStatisticsSeason(playerId.trim(), season.trim())
      .then(setSeasonStats)
      .catch((err) => setSsErr(err.message || String(err)))
      .finally(() => setSsLoading(false))
  }

  const loadCareer = (e) => {
    e.preventDefault()
    if (!playerId.trim()) return
    setCLoading(true)
    setCErr(null)
    fetchPlayerCareerSummary(playerId.trim())
      .then(setCareer)
      .catch((err) => setCErr(err.message || String(err)))
      .finally(() => setCLoading(false))
  }

  const loadRoster = (e) => {
    e.preventDefault()
    if (!teamId.trim()) return
    setRLoading(true)
    setRErr(null)
    fetchTeamRoster(teamId.trim())
      .then(setRoster)
      .catch((err) => setRErr(err.message || String(err)))
      .finally(() => setRLoading(false))
  }

  const loadTeamStandings = (e) => {
    e.preventDefault()
    if (!teamId.trim()) return
    setStLoading(true)
    setStErr(null)
    fetchTeamStandings(teamId.trim())
      .then(setStandings)
      .catch((err) => setStErr(err.message || String(err)))
      .finally(() => setStLoading(false))
  }

  const loadTeamStandingsSeason = (e) => {
    e.preventDefault()
    if (!teamId.trim()) return
    setStsLoading(true)
    setStsErr(null)
    fetchTeamStandingsSeason(teamId.trim(), season.trim())
      .then(setStandingsSeason)
      .catch((err) => setStsErr(err.message || String(err)))
      .finally(() => setStsLoading(false))
  }

  const loadStatDump = (e) => {
    e.preventDefault()
    setBLoading(true)
    setBErr(null)
    fetchStatisticList()
      .then((rows) => setBulk(Array.isArray(rows) ? rows.slice(0, 80) : rows))
      .catch((err) => setBErr(err.message || String(err)))
      .finally(() => setBLoading(false))
  }

  if (!visible) return null

  return (
    <SubPanel id="nba-player-stats" activeId={activeId}>
      <SectionHeader title="Player & team stats" />

      <div className="table-wrap">
        <div className="table-head">
          <div className="table-head-title">Player lookup</div>
        </div>
        <form className="hc-toolbar" onSubmit={loadPlayer}>
          <input
            className="hc-input"
            placeholder="Player ID"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            aria-label="Player ID"
          />
          <button type="submit" className="hc-btn" disabled={loading}>
            {loading ? 'Loading…' : 'Load'}
          </button>
        </form>
        <ApiState
          loading={loading}
          error={error}
          empty={
            Boolean(playerLookupDone && !loading && !error && !profile)
          }
        >
          {profile ? (
            <div className="hc-card">
              <div className="hc-card-title">{profile.full_name}</div>
              <div className="hc-muted">
                Team ID {profile.team} · {profile.year_start}–{profile.year_end}
              </div>
            </div>
          ) : null}
        </ApiState>
        <ApiState empty={Boolean(Array.isArray(stats) && stats.length === 0)} error={null} loading={false}>
          {stats?.length ? (
            <table>
              <thead>
                <tr>
                  <th>Season</th>
                  <th>PPG</th>
                  <th>RPG</th>
                  <th>APG</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.id}>
                    <td>{s.season}</td>
                    <td className="stat-hi">{s.ppg ?? '—'}</td>
                    <td>{s.rpg ?? '—'}</td>
                    <td>{s.apg ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </ApiState>
      </div>

      <div className="table-wrap" style={{ marginTop: 16 }}>
        <div className="table-head">
          <div className="table-head-title">One season breakdown</div>
        </div>
        <form className="hc-toolbar" onSubmit={loadSeasonSlice}>
          <input
            className="hc-input"
            placeholder="Season (e.g. 2025 or 2025-26)"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          />
          <button type="submit" className="hc-btn" disabled={ssLoading}>
            {ssLoading ? 'Loading…' : 'Load season'}
          </button>
        </form>
        {ssErr ? <div className="hc-api-msg hc-api-err">{ssErr}</div> : null}
        {seasonStats?.length ? (
          <table style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Season</th>
                <th>PPG</th>
                <th>RPG</th>
                <th>APG</th>
              </tr>
            </thead>
            <tbody>
              {seasonStats.map((s) => (
                <tr key={s.id}>
                  <td>{s.season}</td>
                  <td className="stat-hi">{s.ppg ?? '—'}</td>
                  <td>{s.rpg ?? '—'}</td>
                  <td>{s.apg ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          seasonSliceRequested &&
          !ssLoading &&
          !ssErr && <p className="hc-muted" style={{ marginTop: 10 }}>No rows for that season.</p>
        )}
      </div>

      <div className="table-wrap" style={{ marginTop: 16 }}>
        <div className="table-head">
          <div className="table-head-title">Career snapshot</div>
        </div>
        <form className="hc-toolbar" onSubmit={loadCareer}>
          <button type="submit" className="hc-btn" disabled={cLoading || !playerId.trim()}>
            {cLoading ? 'Loading…' : 'Load career summary'}
          </button>
        </form>
        {cErr ? <div className="hc-api-msg hc-api-err">{cErr}</div> : null}
        {career ? (
          <>
            <div className="hc-card">
              <div className="hc-card-row">
                Avg PTS {career.career_summary?.avg_points ?? '—'} · RPG{' '}
                {career.career_summary?.avg_rebounds ?? '—'} · APG{' '}
                {career.career_summary?.avg_assists ?? '—'}
              </div>
              <div className="hc-card-row hc-muted">
                Seasons in breakdown: {career.career_summary?.seasons_count ?? '—'} · Best:{' '}
                {career.career_summary?.best_scoring_season
                  ? `${career.career_summary.best_scoring_season.season}: ${career.career_summary.best_scoring_season.ppg ?? '—'} PPG`
                  : '—'}
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Season</th>
                  <th>PPG</th>
                  <th>RPG</th>
                  <th>APG</th>
                </tr>
              </thead>
              <tbody>
                {(career.season_breakdown || []).map((s) => (
                  <tr key={s.id}>
                    <td>{s.season}</td>
                    <td className="stat-hi">{s.ppg ?? '—'}</td>
                    <td>{s.rpg ?? '—'}</td>
                    <td>{s.apg ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}
      </div>

      <div className="table-wrap" style={{ marginTop: 16 }}>
        <div className="table-head">
          <div className="table-head-title">Roster & team record</div>
        </div>
        <form className="hc-toolbar">
          <input
            className="hc-input"
            placeholder="Team ID"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            aria-label="Team ID"
          />
          <button type="button" className="hc-btn" onClick={loadRoster} disabled={rLoading}>
            {rLoading ? '…' : 'Roster'}
          </button>
          <button type="button" className="hc-btn hc-btn-ghost" onClick={loadTeamStandings} disabled={stLoading}>
            {stLoading ? '…' : 'Full history'}
          </button>
          <button
            type="button"
            className="hc-btn hc-btn-ghost"
            onClick={loadTeamStandingsSeason}
            disabled={stsLoading}
          >
            {stsLoading ? '…' : 'This season'}
          </button>
        </form>
        {rErr ? <div className="hc-api-msg hc-api-err">{rErr}</div> : null}
        {stErr ? <div className="hc-api-msg hc-api-err">{stErr}</div> : null}
        {stsErr ? <div className="hc-api-msg hc-api-err">{stsErr}</div> : null}
        {roster ? (
          <div style={{ marginTop: 12 }}>
            <div className="hc-muted">Roster size: {roster.roster_size}</div>
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {(roster.roster || []).map((p) => (
                  <tr key={p.player_id}>
                    <td>{p.full_name}</td>
                    <td>{p.player_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {standings?.length ? (
          <table style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Season</th>
                <th>W</th>
                <th>L</th>
                <th>PCT</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row) => (
                <tr key={`${row.id}-${row.season}`}>
                  <td>{row.season}</td>
                  <td>{row.wins}</td>
                  <td>{row.losses}</td>
                  <td>{row.winrate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        {standingsSeason?.length ? (
          <table style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Season</th>
                <th>W</th>
                <th>L</th>
              </tr>
            </thead>
            <tbody>
              {standingsSeason.map((row) => (
                <tr key={`${row.id}-${row.season}`}>
                  <td>{row.season}</td>
                  <td>{row.wins}</td>
                  <td>{row.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      <details className="hc-advanced-details" style={{ marginTop: 16 }}>
        <summary className="hc-advanced-summary">League-wide stat sample (bulk index)</summary>
        <div className="table-wrap hc-advanced-inner">
          <p className="hc-muted" style={{ marginBottom: 10 }}>
            Optional: load a wider cross-section than a single-player lookup. It is a heavier request—
            preview only.
          </p>
          <button type="button" className="hc-btn hc-btn-ghost" onClick={loadStatDump} disabled={bLoading}>
            {bLoading ? 'Loading…' : 'Load preview (80 rows)'}
          </button>
          {bErr ? <div className="hc-api-msg hc-api-err">{bErr}</div> : null}
          {bulk?.length ? (
            <table style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Season</th>
                  <th>Player</th>
                  <th>PPG</th>
                </tr>
              </thead>
              <tbody>
                {bulk.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.season}</td>
                    <td>{row.player}</td>
                    <td>{row.ppg ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </details>
    </SubPanel>
  )
}
