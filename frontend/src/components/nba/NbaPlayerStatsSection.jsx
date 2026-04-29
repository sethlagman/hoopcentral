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
  fetchTeamCurrentRoster,
  fetchTeamStandings,
  fetchTeamStandingsSeason,
  BULK_INDEX_PAGE_SIZE,
} from '../../api/hoopcentral.js'
import { ApiState, HcToolbar } from './ApiUi.jsx'

/** Career stat average display (single decimal place). */
function formatAvgOneDecimal(v) {
  if (v === null || v === undefined || v === '') return '—'
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(1) : '—'
}

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

  const [historicalRoster, setHistoricalRoster] = useState(null)
  const [historicalRLoading, setHistoricalRLoading] = useState(false)
  const [historicalRErr, setHistoricalRErr] = useState(null)

  const [currentRoster, setCurrentRoster] = useState(null)
  const [currentRLoading, setCurrentRLoading] = useState(false)
  const [currentRErr, setCurrentRErr] = useState(null)

  const [standings, setStandings] = useState(null)
  const [stLoading, setStLoading] = useState(false)
  const [stErr, setStErr] = useState(null)

  const [standingsSeason, setStandingsSeason] = useState(null)
  const [stsLoading, setStsLoading] = useState(false)
  const [stsErr, setStsErr] = useState(null)
  /** Roster / standings sub-panels shown one at a time */
  const [teamPanel, setTeamPanel] = useState(null) // 'historicalRoster' | 'currentRoster' | 'fullStandings' | 'seasonStandings'

  const [bulk, setBulk] = useState(null)
  const [bulkPage, setBulkPage] = useState(1)
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

  const loadHistoricalRoster = (e) => {
    e.preventDefault()
    if (!teamId.trim()) return
    setTeamPanel('historicalRoster')
    setHistoricalRLoading(true)
    setHistoricalRErr(null)
    fetchTeamRoster(teamId.trim())
      .then(setHistoricalRoster)
      .catch((err) => setHistoricalRErr(err.message || String(err)))
      .finally(() => setHistoricalRLoading(false))
  }

  const loadCurrentRoster = (e) => {
    e.preventDefault()
    if (!teamId.trim()) return
    setTeamPanel('currentRoster')
    setCurrentRLoading(true)
    setCurrentRErr(null)
    fetchTeamCurrentRoster(teamId.trim())
      .then(setCurrentRoster)
      .catch((err) => setCurrentRErr(err.message || String(err)))
      .finally(() => setCurrentRLoading(false))
  }

  const loadTeamStandings = (e) => {
    e.preventDefault()
    if (!teamId.trim()) return
    setTeamPanel('fullStandings')
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
    setTeamPanel('seasonStandings')
    setStsLoading(true)
    setStsErr(null)
    fetchTeamStandingsSeason(teamId.trim(), season.trim())
      .then(setStandingsSeason)
      .catch((err) => setStsErr(err.message || String(err)))
      .finally(() => setStsLoading(false))
  }

  const fetchStatisticBulkPage = (page) => {
    setBLoading(true)
    setBErr(null)
    fetchStatisticList(page, BULK_INDEX_PAGE_SIZE)
      .then((data) => {
        setBulk(data)
        setBulkPage(page)
      })
      .catch((err) => setBErr(err.message || String(err)))
      .finally(() => setBLoading(false))
  }

  const statBulkRows = bulk?.results ?? []
  const statBulkTotal = bulk?.count ?? 0
  const statBulkTotalPages = Math.max(1, Math.ceil(statBulkTotal / BULK_INDEX_PAGE_SIZE))
  const statBulkHasNext = Boolean(bulk?.next)
  const statBulkHasPrev = Boolean(bulk?.previous)

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
                Avg PTS {formatAvgOneDecimal(career.career_summary?.avg_points)} · RPG{' '}
                {formatAvgOneDecimal(career.career_summary?.avg_rebounds)} · APG{' '}
                {formatAvgOneDecimal(career.career_summary?.avg_assists)}
              </div>
              <div className="hc-card-row hc-muted">
                Seasons in breakdown: {career.career_summary?.seasons_count ?? '—'} · Best:{' '}
                {career.career_summary?.best_scoring_season
                  ? `${career.career_summary.best_scoring_season.season}: ${formatAvgOneDecimal(career.career_summary.best_scoring_season.ppg)} PPG`
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
                    <td className="stat-hi">{formatAvgOneDecimal(s.ppg)}</td>
                    <td>{formatAvgOneDecimal(s.rpg)}</td>
                    <td>{formatAvgOneDecimal(s.apg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}
      </div>

      <div className="table-wrap">
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
          <button
            type="button"
            className={
              teamPanel === null || teamPanel === 'historicalRoster'
                ? 'hc-btn'
                : 'hc-btn hc-btn-ghost'
            }
            aria-pressed={teamPanel === null || teamPanel === 'historicalRoster'}
            onClick={loadHistoricalRoster}
            disabled={historicalRLoading}
          >
            {historicalRLoading ? '…' : 'Historical roster'}
          </button>
          <button
            type="button"
            className={teamPanel === 'currentRoster' ? 'hc-btn' : 'hc-btn hc-btn-ghost'}
            aria-pressed={teamPanel === 'currentRoster'}
            onClick={loadCurrentRoster}
            disabled={currentRLoading}
          >
            {currentRLoading ? '…' : 'Current roster'}
          </button>
          <button
            type="button"
            className={teamPanel === 'fullStandings' ? 'hc-btn' : 'hc-btn hc-btn-ghost'}
            aria-pressed={teamPanel === 'fullStandings'}
            onClick={loadTeamStandings}
            disabled={stLoading}
          >
            {stLoading ? '…' : 'Full history'}
          </button>
          <button
            type="button"
            className={teamPanel === 'seasonStandings' ? 'hc-btn' : 'hc-btn hc-btn-ghost'}
            aria-pressed={teamPanel === 'seasonStandings'}
            onClick={loadTeamStandingsSeason}
            disabled={stsLoading}
          >
            {stsLoading ? '…' : 'This season'}
          </button>
        </form>
        {historicalRErr && teamPanel === 'historicalRoster' ? (
          <div className="hc-api-msg hc-api-err">{historicalRErr}</div>
        ) : null}
        {currentRErr && teamPanel === 'currentRoster' ? (
          <div className="hc-api-msg hc-api-err">{currentRErr}</div>
        ) : null}
        {stErr && teamPanel === 'fullStandings' ? (
          <div className="hc-api-msg hc-api-err">{stErr}</div>
        ) : null}
        {stsErr && teamPanel === 'seasonStandings' ? (
          <div className="hc-api-msg hc-api-err">{stsErr}</div>
        ) : null}

        {teamPanel === 'historicalRoster' ? (
          <>
            {historicalRLoading ? <div className="hc-api-msg">Loading…</div> : null}
            {!historicalRLoading && !historicalRErr && historicalRoster ? (
              <div>
                <div className="hc-muted">
                  Roster size: {historicalRoster.roster_size ?? '—'}
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(historicalRoster.roster || []).map((p) => (
                      <tr key={p.player_id}>
                        <td>{p.full_name}</td>
                        <td>{p.player_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </>
        ) : null}

        {teamPanel === 'currentRoster' ? (
          <>
            {currentRLoading ? <div className="hc-api-msg">Loading…</div> : null}
            {!currentRLoading && !currentRErr && currentRoster ? (
              <div>
                {currentRoster.season == null ? (
                  <p className="hc-muted">
                    No league season data yet—can’t resolve a current roster season.
                  </p>
                ) : (
                  <>
                    <div className="hc-muted">
                      Latest season: {currentRoster.season} · {currentRoster.roster_size ?? 0} players
                    </div>
                    {(currentRoster.roster || []).length ? (
                      <table>
                        <thead>
                          <tr>
                            <th>Player</th>
                            <th>ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(currentRoster.roster || []).map((p) => (
                            <tr key={p.player_id}>
                              <td>{p.full_name}</td>
                              <td>{p.player_id}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="hc-muted">
                        No players on this roster with statistics for that season yet.
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </>
        ) : null}

        {teamPanel === 'fullStandings' ? (
          <>
            {stLoading ? <div className="hc-api-msg">Loading…</div> : null}
            {!stLoading && !stErr && standings?.length ? (
              <table>
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
            {!stLoading && !stErr && Array.isArray(standings) && standings.length === 0 ? (
              <p className="hc-muted">No standings rows for this team.</p>
            ) : null}
          </>
        ) : null}

        {teamPanel === 'seasonStandings' ? (
          <>
            {stsLoading ? <div className="hc-api-msg">Loading…</div> : null}
            {!stsLoading && !stsErr && standingsSeason?.length ? (
              <table>
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
            {!stsLoading && !stsErr && Array.isArray(standingsSeason) && standingsSeason.length === 0 ? (
              <p className="hc-muted">No standings rows for this team and season.</p>
            ) : null}
          </>
        ) : null}
      </div>

      <details className="hc-advanced-details" style={{ marginTop: 16 }}>
        <summary className="hc-advanced-summary">League Statistics Snapshot</summary>
        <div className="table-wrap hc-advanced-inner">
          <p className="hc-muted" style={{ marginBottom: 10 }}>
            Loads one page of league stat rows at a time. Pagination matches the player directory (page
            and page size; default {BULK_INDEX_PAGE_SIZE} rows per request).
          </p>
          <button
            type="button"
            className="hc-btn hc-btn-ghost"
            onClick={() => fetchStatisticBulkPage(1)}
            disabled={bLoading}
          >
            {bLoading ? 'Loading…' : bulk ? 'Reload page 1' : 'Load preview'}
          </button>
          {bErr ? <div className="hc-api-msg hc-api-err">{bErr}</div> : null}
          {bulk ? (
            <>
              <HcToolbar>
                <span className="hc-toolbar-meta">
                  Page {bulkPage} of {statBulkTotalPages} · {statBulkTotal} rows
                </span>
                <button
                  type="button"
                  className="hc-btn hc-btn-ghost"
                  disabled={bLoading || !statBulkHasPrev}
                  onClick={() => fetchStatisticBulkPage(bulkPage - 1)}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="hc-btn hc-btn-ghost"
                  disabled={bLoading || !statBulkHasNext}
                  onClick={() => fetchStatisticBulkPage(bulkPage + 1)}
                >
                  Next
                </button>
              </HcToolbar>
              {statBulkRows.length ? (
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
                    {statBulkRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.season}</td>
                        <td>{row.player}</td>
                        <td>{row.ppg ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="hc-muted" style={{ marginTop: 10 }}>
                  No statistic rows match this slice.
                </p>
              )}
            </>
          ) : null}
        </div>
      </details>
    </SubPanel>
  )
}
