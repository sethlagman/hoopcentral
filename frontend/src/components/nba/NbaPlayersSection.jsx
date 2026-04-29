import { useEffect, useMemo, useState } from 'react'
import SectionHeader from '../SectionHeader'
import SubPanel from '../SubPanel'
import {
  fetchPlayer,
  fetchPlayerList,
  fetchPlayerSearch,
  fetchPlayerStatistics,
  fetchTeam,
} from '../../api/hoopcentral.js'
import { ApiState, HcToolbar } from './ApiUi.jsx'

/** League start calendar year for a stored season label (matches backend ``season_utils.season_start_year``). */
function seasonStartYear(season) {
  if (season == null || season === '') return null
  const s = String(season).trim()
  const dash = s.indexOf('-')
  if (dash !== -1) {
    const head = s.slice(0, dash).trim()
    return /^\d+$/.test(head) ? parseInt(head, 10) : null
  }
  if (/^\d{4,}$/.test(s)) return parseInt(s.slice(0, 4), 10)
  return null
}

function parseCareerYear(v) {
  if (v == null || String(v).trim() === '') return null
  const n = parseInt(String(v).trim(), 10)
  return Number.isFinite(n) ? n : null
}

/** Rows whose season league-year falls in ``[year_start, year_end]``; sorted latest season first. */
function statsWithinCareerYearsSorted(stats, yearStart, yearEnd) {
  const ymin = parseCareerYear(yearStart)
  const ymax = parseCareerYear(yearEnd)
  const restrict = ymin != null || ymax != null

  let rows = [...(stats ?? [])]
  if (restrict) {
    rows = rows.filter((row) => {
      const y = seasonStartYear(row.season)
      if (y == null) return false
      if (ymin != null && y < ymin) return false
      if (ymax != null && y > ymax) return false
      return true
    })
  }

  rows.sort((a, b) => {
    const ya = seasonStartYear(a.season)
    const yb = seasonStartYear(b.season)
    if (ya != null && yb != null && ya !== yb) return yb - ya
    if (ya != null && yb == null) return -1
    if (ya == null && yb != null) return 1
    return String(b.season ?? '').localeCompare(String(a.season ?? ''), undefined, { numeric: true })
  })

  return rows
}

function PlayerAvatar({ headshot }) {
  return (
    <div className="pavatar">
      {headshot ? <img src={headshot} alt="" className="pavatar-img" loading="lazy" /> : '🏀'}
    </div>
  )
}

export default function NbaPlayersSection({ activeId }) {
  const visible = activeId === 'nba-players'
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [sqName, setSqName] = useState('')
  const [sqTeam, setSqTeam] = useState('')
  const [searchRows, setSearchRows] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)

  const [profilePlayerId, setProfilePlayerId] = useState(null)
  const [profilePlayer, setProfilePlayer] = useState(null)
  const [profileStats, setProfileStats] = useState(null)
  const [profileTeam, setProfileTeam] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchPlayerList(page, 20)
      .then((r) => {
        if (!cancelled) setData(r)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [visible, page])

  useEffect(() => {
    if (!visible) setProfilePlayerId(null)
  }, [visible])

  useEffect(() => {
    if (!visible || !profilePlayerId) {
      setProfilePlayer(null)
      setProfileStats(null)
      setProfileTeam(null)
      setProfileError(null)
      setProfileLoading(false)
      return
    }
    let cancelled = false
    setProfileLoading(true)
    setProfileError(null)
    setProfilePlayer(null)
    setProfileStats(null)
    setProfileTeam(null)

    ;(async () => {
      try {
        const [player, stats] = await Promise.all([
          fetchPlayer(profilePlayerId),
          fetchPlayerStatistics(profilePlayerId),
        ])
        if (cancelled) return
        setProfilePlayer(player)
        setProfileStats(stats)
        let team = null
        try {
          team = await fetchTeam(player.team)
        } catch {
          team = null
        }
        if (cancelled) return
        setProfileTeam(team)
      } catch (e) {
        if (!cancelled) setProfileError(e.message || String(e))
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [visible, profilePlayerId])

  const runSearch = (e) => {
    e.preventDefault()
    setSearchLoading(true)
    setSearchError(null)
    fetchPlayerSearch({ name: sqName, team: sqTeam })
      .then(setSearchRows)
      .catch((err) => setSearchError(err.message || String(err)))
      .finally(() => setSearchLoading(false))
  }

  const results = data?.results ?? []
  const count = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(count / 20))
  const hasNext = Boolean(data?.next)
  const hasPrev = Boolean(data?.previous)

  const profileTitle =
    profilePlayer?.full_name ??
    (profilePlayerId ? (profileLoading ? 'Loading…' : 'Player profile') : 'NBA roster')

  const teamLabelPrimary =
    profileTeam?.full_name ||
    profilePlayer?.team_name ||
    (profilePlayer?.team ? `Team ${profilePlayer.team}` : null)

  const teamMetaParts = []
  if (profileTeam?.nickname) teamMetaParts.push(profileTeam.nickname)
  if (profileTeam?.abbreviation) teamMetaParts.push(profileTeam.abbreviation)
  const teamMetaLine = teamMetaParts.length ? teamMetaParts.join(' · ') : null

  const profileStatsDisplay = useMemo(() => {
    if (!profilePlayer || profileStats == null) return []
    return statsWithinCareerYearsSorted(profileStats, profilePlayer.year_start, profilePlayer.year_end)
  }, [profilePlayer, profileStats])

  return (
    <SubPanel id="nba-players" activeId={activeId}>
      <SectionHeader title={profileTitle} />

      {profilePlayerId ? (
        <>
          <div className="table-wrap">
            <div className="table-head">
              <HcToolbar>
                <button
                  type="button"
                  className="hc-btn hc-btn-ghost"
                  onClick={() => setProfilePlayerId(null)}
                >
                  ← Back to roster
                </button>
              </HcToolbar>
            </div>

            <ApiState loading={profileLoading} error={profileError} empty={false}>
              {profilePlayer ? (
                <>
                  <div className="hc-card hc-player-profile-card">
                    <div className="hc-player-profile">
                      <div className="hc-player-profile-photo">
                        {profilePlayer.headshot ? (
                          <img
                            src={profilePlayer.headshot}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          <span className="hc-player-profile-placeholder">🏀</span>
                        )}
                      </div>
                      <div className="hc-player-profile-meta">
                        <div className="hc-player-profile-name">{profilePlayer.full_name}</div>
                        <div className="hc-player-profile-sub">
                          Player ID {profilePlayer.player_id}
                          {profilePlayer.jersey != null && profilePlayer.jersey !== ''
                            ? ` · #${profilePlayer.jersey}`
                            : ''}{' '}
                          · {profilePlayer.is_active ? 'Active' : 'Inactive'} · Career{' '}
                          {profilePlayer.year_start}–{profilePlayer.year_end}
                        </div>
                        <div className="hc-player-profile-sub hc-player-profile-team">
                          <span className="hc-muted">Team · </span>
                          <strong>{teamLabelPrimary ?? '—'}</strong>
                          {profilePlayer.team ? (
                            <span className="hc-muted"> ({profilePlayer.team})</span>
                          ) : null}
                          {teamMetaLine ? (
                            <span className="hc-muted"> · {teamMetaLine}</span>
                          ) : null}
                          {profileTeam?.city ? (
                            <span className="hc-muted">
                              {' '}
                              · {profileTeam.city}
                              {profileTeam.state ? `, ${profileTeam.state}` : ''}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="table-head" style={{ marginTop: 4 }}>
                    <div className="table-head-title">Season statistics</div>
                  </div>
                  {profileStatsDisplay.length ? (
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
                        {profileStatsDisplay.map((s) => (
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
                </>
              ) : null}
            </ApiState>
          </div>
        </>
      ) : (
        <>
          <div className="table-wrap">
            <div className="table-head">
              <div className="table-head-title">Find a player</div>
            </div>
            <form className="hc-toolbar" onSubmit={runSearch}>
              <input
                className="hc-input"
                placeholder="Name"
                value={sqName}
                onChange={(e) => setSqName(e.target.value)}
                aria-label="Search by name"
              />
              <input
                className="hc-input"
                placeholder="Team"
                value={sqTeam}
                onChange={(e) => setSqTeam(e.target.value)}
                aria-label="Search by team"
              />
              <button type="submit" className="hc-btn" disabled={searchLoading}>
                {searchLoading ? 'Searching…' : 'Search'}
              </button>
            </form>
            {searchError ? <div className="hc-api-msg hc-api-err">{searchError}</div> : null}
            {searchRows ? (
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Player</th>
                      <th>Team ID</th>
                      <th>Years</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchRows.slice(0, 50).map((p) => (
                      <tr key={p.player_id}>
                        <td className="rank-muted">{p.player_id}</td>
                        <td>
                          <button
                            type="button"
                            className="pcell pcell-trigger"
                            aria-label={`View profile for ${p.full_name}`}
                            onClick={() => setProfilePlayerId(p.player_id)}
                          >
                            <PlayerAvatar headshot={p.headshot} />
                            <div>
                              <div className="pname">{p.full_name}</div>
                              <div className="pteam">{p.team_name}</div>
                            </div>
                          </button>
                        </td>
                        <td>{p.team}</td>
                        <td>
                          {p.year_start}–{p.year_end}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {searchRows.length > 50 ? (
                  <p className="hc-muted">Showing first 50 of {searchRows.length} matches.</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="table-wrap" style={{ marginTop: 16 }}>
            <div className="table-head">
              <div className="table-head-title">Full directory</div>
              <HcToolbar>
                <span className="hc-toolbar-meta">
                  Page {page} of {totalPages} · {count} players
                </span>
                <button
                  type="button"
                  className="hc-btn hc-btn-ghost"
                  disabled={!hasPrev || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="hc-btn hc-btn-ghost"
                  disabled={!hasNext || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </HcToolbar>
            </div>
            <ApiState loading={loading} error={error} empty={!loading && !error && results.length === 0}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Team ID</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((p, i) => (
                    <tr key={p.player_id}>
                      <td className="rank-muted">{(page - 1) * 20 + i + 1}</td>
                      <td>
                        <button
                          type="button"
                          className="pcell pcell-trigger"
                          aria-label={`View profile for ${p.full_name}`}
                          onClick={() => setProfilePlayerId(p.player_id)}
                        >
                          <PlayerAvatar headshot={p.headshot} />
                          <div>
                            <div className="pname">{p.full_name}</div>
                            <div className="pteam">{p.team_name}</div>
                          </div>
                        </button>
                      </td>
                      <td>{p.team}</td>
                      <td>{p.is_active ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ApiState>
          </div>
        </>
      )}
    </SubPanel>
  )
}
