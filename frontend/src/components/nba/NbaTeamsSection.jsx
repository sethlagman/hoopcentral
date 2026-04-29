import { useEffect, useState } from 'react'
import SectionHeader from '../SectionHeader'
import SubPanel from '../SubPanel'
import { DEFAULT_NBA_SEASON } from '../../config/api.js'
import { fetchTeam, fetchTeamList, fetchTeamRosterSeason } from '../../api/hoopcentral.js'
import { ApiState, HcToolbar } from './ApiUi.jsx'

/* eslint-disable react-hooks/set-state-in-effect -- loading flags before async fetch */

function TeamLogoAvatar({ logoUrl }) {
  return (
    <div className="pavatar">
      {logoUrl ? <img src={logoUrl} alt="" className="pavatar-img" loading="lazy" /> : '🏀'}
    </div>
  )
}

function PlayerRowAvatar({ headshot }) {
  return (
    <div className="pavatar">
      {headshot ? <img src={headshot} alt="" className="pavatar-img" loading="lazy" /> : '🏀'}
    </div>
  )
}

export default function NbaTeamsSection({ activeId }) {
  const visible = activeId === 'nba-teams'
  const [teams, setTeams] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [profileTeamId, setProfileTeamId] = useState(null)
  const [profileTeam, setProfileTeam] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileErr, setProfileErr] = useState(null)

  const [seasonInput, setSeasonInput] = useState(DEFAULT_NBA_SEASON)
  const [appliedSeason, setAppliedSeason] = useState(DEFAULT_NBA_SEASON)

  const [rosterData, setRosterData] = useState(null)
  const [rosterLoading, setRosterLoading] = useState(false)
  const [rosterErr, setRosterErr] = useState(null)

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    setLoading(true)
    fetchTeamList()
      .then((t) => {
        if (!cancelled) setTeams(t)
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
  }, [visible])

  useEffect(() => {
    if (!visible) setProfileTeamId(null)
  }, [visible])

  useEffect(() => {
    if (profileTeamId) {
      setSeasonInput(DEFAULT_NBA_SEASON)
      setAppliedSeason(DEFAULT_NBA_SEASON)
    }
  }, [profileTeamId])

  useEffect(() => {
    if (!visible || !profileTeamId) {
      setProfileTeam(null)
      setProfileErr(null)
      setProfileLoading(false)
      return
    }
    let cancelled = false
    setProfileLoading(true)
    setProfileErr(null)
    setProfileTeam(null)
    fetchTeam(profileTeamId)
      .then((t) => {
        if (!cancelled) setProfileTeam(t)
      })
      .catch((e) => {
        if (!cancelled) setProfileErr(e.message || String(e))
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [visible, profileTeamId])

  useEffect(() => {
    if (!visible || !profileTeamId) {
      setRosterData(null)
      setRosterErr(null)
      setRosterLoading(false)
      return
    }
    let cancelled = false
    setRosterLoading(true)
    setRosterErr(null)
    setRosterData(null)
    fetchTeamRosterSeason(profileTeamId, appliedSeason)
      .then((d) => {
        if (!cancelled) setRosterData(d)
      })
      .catch((e) => {
        if (!cancelled) setRosterErr(e.message || String(e))
      })
      .finally(() => {
        if (!cancelled) setRosterLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [visible, profileTeamId, appliedSeason])

  const applySeason = (e) => {
    e.preventDefault()
    const s = seasonInput.trim()
    if (!s) return
    setAppliedSeason(s)
  }

  const list = Array.isArray(teams)
    ? teams.filter((t) => Boolean(t.full_name?.trim()))
    : []

  const rosterRows = rosterData?.roster ?? []

  const profileTitle =
    profileTeam?.full_name ??
    (profileTeamId ? (profileLoading ? 'Loading…' : 'Team profile') : 'Teams')

  return (
    <SubPanel id="nba-teams" activeId={activeId}>
      <SectionHeader title={profileTitle} />

      {profileTeamId ? (
        <>
          <div className="table-wrap hc-player-profile-shell">
            <div className="table-head">
              <HcToolbar>
                <button
                  type="button"
                  className="hc-btn hc-btn-ghost"
                  onClick={() => setProfileTeamId(null)}
                >
                  ← Back to teams
                </button>
              </HcToolbar>
            </div>

            <ApiState loading={profileLoading} error={profileErr} empty={false}>
              {profileTeam ? (
                <div className="hc-card hc-player-profile-card">
                  <div className="hc-player-profile">
                    <div className="hc-player-profile-photo">
                      {profileTeam.logo ? (
                        <img src={profileTeam.logo} alt="" loading="lazy" />
                      ) : (
                        <span className="hc-player-profile-placeholder">🏀</span>
                      )}
                    </div>
                    <div className="hc-player-profile-meta">
                      <div className="hc-player-profile-name">{profileTeam.full_name}</div>
                      <div className="hc-player-profile-sub">
                        {[profileTeam.city, profileTeam.state].filter(Boolean).join(', ') ||
                          '—'}
                        {profileTeam.abbreviation ? ` · ${profileTeam.abbreviation}` : ''}
                        {profileTeam.year_founded != null
                          ? ` · Est. ${profileTeam.year_founded}`
                          : ''}
                      </div>
                      {profileTeam.nickname ? (
                        <div className="hc-player-profile-sub hc-muted">{profileTeam.nickname}</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </ApiState>

            <div className="table-wrap" style={{ marginTop: 16 }}>
              <div className="table-head">
                <div className="table-head-title">Season roster</div>
              </div>
              <form className="hc-toolbar" onSubmit={applySeason}>
                <input
                  className="hc-input"
                  placeholder="Season (e.g. 2025 or 2025-26)"
                  value={seasonInput}
                  onChange={(e) => setSeasonInput(e.target.value)}
                  aria-label="NBA season for roster"
                />
                <button type="submit" className="hc-btn" disabled={rosterLoading}>
                  {rosterLoading ? 'Loading…' : 'Load roster'}
                </button>
              </form>
              {rosterErr ? <div className="hc-api-msg hc-api-err">{rosterErr}</div> : null}
              {!rosterLoading && !rosterErr && rosterData ? (
                <>
                  <p className="hc-muted" style={{ marginTop: 10 }}>
                    Showing roster for season <strong>{rosterData.season}</strong> ·{' '}
                    {rosterData.roster_size ?? rosterRows.length} players
                  </p>
                  {rosterData.roster_scope === 'active_only' ? (
                    <p className="hc-muted" style={{ marginTop: 6, fontSize: 12 }}>
                      Includes only players marked active — waived or inactive players are omitted even when
                      listed career years still cover this season.
                    </p>
                  ) : rosterData.roster_scope === 'career_years' ? (
                    <p className="hc-muted" style={{ marginTop: 6, fontSize: 12 }}>
                      Players whose listed career years overlap this league season (historical view).
                    </p>
                  ) : null}
                </>
              ) : null}
              {rosterLoading ? (
                <div className="hc-api-msg" style={{ marginTop: 10 }}>
                  Loading roster…
                </div>
              ) : null}
              {!rosterLoading && !rosterErr && rosterRows.length ? (
                <table style={{ marginTop: 12 }}>
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>ID</th>
                      <th>Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rosterRows.map((p) => (
                      <tr key={p.player_id}>
                        <td>
                          <div className="pcell">
                            <PlayerRowAvatar headshot={p.headshot} />
                            <div>
                              <div className="pname">{p.full_name}</div>
                              <div className="pteam">
                                {p.jersey != null && p.jersey !== ''
                                  ? `#${p.jersey}`
                                  : '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{p.player_id}</td>
                        <td>{p.is_active ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
              {!rosterLoading && !rosterErr && rosterData && rosterRows.length === 0 ? (
                <p className="hc-muted" style={{ marginTop: 10 }}>
                  {rosterData.roster_scope === 'active_only'
                    ? 'No active players with statistics for this season yet.'
                    : 'No players on this roster with statistics for that season yet.'}
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <div className="table-wrap">
          <div className="table-head">
            <div className="table-head-title">Every franchise</div>
          </div>
          <ApiState loading={loading} error={error} empty={!loading && !error && list.length === 0}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Team</th>
                  <th>Abbr</th>
                  <th>City</th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.team_id}>
                    <td className="rank-muted">{t.team_id}</td>
                    <td>
                      <button
                        type="button"
                        className="pcell pcell-trigger"
                        aria-label={`Open team profile for ${t.full_name}`}
                        onClick={() => setProfileTeamId(t.team_id)}
                      >
                        <TeamLogoAvatar logoUrl={t.logo} />
                        <div>
                          <div className="pname">{t.full_name}</div>
                          <div className="pteam">{t.nickname}</div>
                        </div>
                      </button>
                    </td>
                    <td>{t.abbreviation}</td>
                    <td>{t.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ApiState>
        </div>
      )}
    </SubPanel>
  )
}
