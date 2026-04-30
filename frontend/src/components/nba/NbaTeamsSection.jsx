import { useEffect, useState } from 'react'
import SectionHeader from '../SectionHeader'
import SubPanel from '../SubPanel'
import { DEFAULT_NBA_SEASON } from '../../config/api.js'
import {
  fetchTeam,
  fetchTeamCurrentRoster,
  fetchTeamList,
  fetchTeamRosterSeason,
} from '../../api/hoopcentral.js'
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
  const [rosterMode, setRosterMode] = useState('season')

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
      setRosterMode('season')
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
    const req =
      rosterMode === 'current'
        ? fetchTeamCurrentRoster(profileTeamId)
        : fetchTeamRosterSeason(profileTeamId, appliedSeason)
    req
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
  }, [visible, profileTeamId, rosterMode, appliedSeason])

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
          <div className="table-wrap">
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
                <div className="table-head-title">Roster</div>
              </div>
              <div className="hc-toolbar" role="group" aria-label="Roster type">
                <button
                  type="button"
                  className={`hc-btn${rosterMode === 'season' ? '' : ' hc-btn-ghost'}`}
                  onClick={() => setRosterMode('season')}
                >
                  By season
                </button>
                <button
                  type="button"
                  className={`hc-btn${rosterMode === 'current' ? '' : ' hc-btn-ghost'}`}
                  onClick={() => setRosterMode('current')}
                >
                  Current roster (active only)
                </button>
              </div>
              {rosterMode === 'season' ? (
                <>
                  <p className="hc-api-msg hc-muted" style={{ marginBottom: 8 }}>
                    Everyone who has a <strong>stat line for that season</strong> for this franchise
                    (including waived / inactive). Not the same as today&apos;s active roster.
                  </p>
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
                </>
              ) : (
                <p className="hc-api-msg hc-muted" style={{ marginBottom: 8 }}>
                  Uses the league season from the API (your backend <code>SEASON</code>). Only
                  players with <strong>is_active</strong> in the latest import.
                  {rosterData?.season ? ` Season: ${rosterData.season}.` : ''}
                </p>
              )}
              {rosterErr ? <div className="hc-api-msg hc-api-err">{rosterErr}</div> : null}
              {!rosterLoading && !rosterErr && rosterRows.length ? (
                <table>
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
