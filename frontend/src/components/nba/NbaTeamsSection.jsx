import { useEffect, useState } from 'react'
import SectionHeader from '../SectionHeader'
import SubPanel from '../SubPanel'
import { fetchTeam, fetchTeamList } from '../../api/hoopcentral.js'
import { ApiState } from './ApiUi.jsx'

/* eslint-disable react-hooks/set-state-in-effect -- loading flags before async fetch */

export default function NbaTeamsSection({ activeId }) {
  const visible = activeId === 'nba-teams'
  const [teams, setTeams] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [detailId, setDetailId] = useState('')
  const [team, setTeam] = useState(null)
  const [dLoading, setDLoading] = useState(false)
  const [dErr, setDErr] = useState(null)

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

  const loadDetail = (e) => {
    e.preventDefault()
    if (!detailId.trim()) return
    setDLoading(true)
    setDErr(null)
    fetchTeam(detailId.trim())
      .then(setTeam)
      .catch((e) => setDErr(e.message || String(e)))
      .finally(() => setDLoading(false))
  }

  if (!visible) return null

  const list = Array.isArray(teams)
    ? teams.filter((t) => Boolean(t.full_name?.trim()))
    : []

  return (
    <SubPanel id="nba-teams" activeId={activeId}>
      <SectionHeader title="Teams" />
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
                    <div className="pcell">
                      <div className="pavatar">🏀</div>
                      <div>
                        <div className="pname">{t.full_name}</div>
                        <div className="pteam">{t.nickname}</div>
                      </div>
                    </div>
                  </td>
                  <td>{t.abbreviation}</td>
                  <td>{t.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ApiState>
      </div>

      <div className="table-wrap" style={{ marginTop: 16 }}>
        <div className="table-head">
          <div className="table-head-title">Team profile</div>
        </div>
        <form className="hc-toolbar" onSubmit={loadDetail}>
          <input
            className="hc-input"
            placeholder="Team ID"
            value={detailId}
            onChange={(e) => setDetailId(e.target.value)}
          />
          <button type="submit" className="hc-btn" disabled={dLoading}>
            {dLoading ? '…' : 'Load'}
          </button>
        </form>
        {dErr ? <div className="hc-api-msg hc-api-err">{dErr}</div> : null}
        {team ? (
          <div className="hc-card" style={{ marginTop: 12 }}>
            <div className="hc-card-title">{team.full_name}</div>
            <div className="hc-muted">
              {team.city} · {team.abbreviation} · Est. {team.year_founded ?? '—'}
            </div>
          </div>
        ) : null}
      </div>
    </SubPanel>
  )
}
