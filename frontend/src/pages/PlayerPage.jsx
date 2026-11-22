import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DEFAULT_NBA_SEASON } from '../config/api.js'
import { fetchPlayer, fetchPlayerCareerSummary, fetchPlayerStatistics, fetchTeam } from '../api/hoopcentral.js'
import { ApiState } from '../components/nba/ApiUi.jsx'
import { Block, Crumbs, Logo } from '../components/nba/ui.jsx'
import { formatAvg, sortStatsBySeason } from '../lib/nba.js'
import { useLoad } from '../lib/useLoad.js'

function loadPlayer(playerId) {
  return Promise.all([
    fetchPlayer(playerId),
    fetchPlayerStatistics(playerId).catch(() => []),
  ]).then(async ([player, stats]) => {
    let team = null
    if (player.team) {
      try {
        team = await fetchTeam(player.team)
      } catch {
        team = null
      }
    }
    let career = null
    try {
      career = await fetchPlayerCareerSummary(playerId)
    } catch {
      career = null
    }
    return { player, stats: sortStatsBySeason(Array.isArray(stats) ? stats : []), team, career }
  })
}

function seasonRows(payload) {
  const fromCareer = payload.career?.season_breakdown
  if (Array.isArray(fromCareer) && fromCareer.length) return sortStatsBySeason(fromCareer)
  return payload.stats
}

function PlayerView({ payload }) {
  const rows = seasonRows(payload)
  const rowKey = (row) => String(row.id ?? row.season)
  const preferred = rows.find((row) => String(row.season) === DEFAULT_NBA_SEASON) || rows[0]
  const [seasonId, setSeasonId] = useState(preferred ? rowKey(preferred) : '')
  const selected = rows.find((row) => rowKey(row) === seasonId) || rows[0] || null
  const player = payload.player
  const team = payload.team
  const summary = payload.career?.career_summary
  const teamLabel = team?.full_name || player.team_name || '—'

  return (
    <>
      <Crumbs items={[{ label: 'Players', to: '/players' }, { label: player.full_name }]} />
      <div className="profile-head">
        <Logo src={player.headshot} label={player.full_name} className="logo-img lg" />
        <div>
          <h1 className="page-title">{player.full_name}</h1>
          <div className="hc-player-profile-sub">
            {player.team ? <Link to={`/teams/${player.team}`}>{teamLabel}</Link> : teamLabel}
            {player.jersey ? ` · #${player.jersey}` : ''}
            {` · ${player.is_active ? 'Active' : 'Inactive'}`}
            {player.year_start || player.year_end ? ` · ${player.year_start || '—'}–${player.year_end || '—'}` : ''}
          </div>
        </div>
      </div>

      <Block title="Season averages">
        {rows.length ? (
          <>
            <div className="hc-toolbar filter-row">
              <label className="check-label" htmlFor="player-season">
                Season
              </label>
              <select
                id="player-season"
                className="hc-select"
                value={selected ? rowKey(selected) : ''}
                onChange={(event) => setSeasonId(event.target.value)}
              >
                {rows.map((row) => (
                  <option key={rowKey(row)} value={rowKey(row)}>
                    {row.season}
                  </option>
                ))}
              </select>
            </div>
            {selected ? (
              <div className="stat-tiles">
                {[
                  ['PPG', selected.ppg],
                  ['RPG', selected.rpg],
                  ['APG', selected.apg],
                ].map(([label, value]) => (
                  <div key={label} className="stat-tile">
                    <b>{formatAvg(value)}</b>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p className="hc-muted">No season statistics for this player.</p>
        )}
      </Block>

      <Block title="Career averages">
        {summary ? (
          <div className="stat-tiles">
            <div className="stat-tile">
              <b>{formatAvg(summary.avg_points)}</b>
              <span>PPG</span>
            </div>
            <div className="stat-tile">
              <b>{formatAvg(summary.avg_rebounds)}</b>
              <span>RPG</span>
            </div>
            <div className="stat-tile">
              <b>{formatAvg(summary.avg_assists)}</b>
              <span>APG</span>
            </div>
            <div className="stat-tile">
              <b>{summary.seasons_count ?? '—'}</b>
              <span>Seasons</span>
            </div>
          </div>
        ) : (
          <p className="hc-muted">No career summary inside this player’s listed years.</p>
        )}
        {summary?.best_scoring_season ? (
          <p className="hc-muted" style={{ marginTop: 8 }}>
            Best scoring season: {summary.best_scoring_season.season} · {formatAvg(summary.best_scoring_season.ppg)} PPG
          </p>
        ) : null}
      </Block>

      {rows.length ? (
        <Block title="Season log">
          <p className="hc-muted dash-intro">Per-game averages. Only points, rebounds, and assists are stored.</p>
          <div className="table-scroll">
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
                {rows.map((row) => (
                  <tr key={row.id ?? row.season}>
                    <td>{row.season}</td>
                    <td className="stat-hi">{formatAvg(row.ppg)}</td>
                    <td>{formatAvg(row.rpg)}</td>
                    <td>{formatAvg(row.apg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>
      ) : null}
    </>
  )
}

export default function PlayerPage() {
  const { playerId } = useParams()
  const state = useLoad(playerId, () => loadPlayer(playerId))
  return (
    <ApiState loading={state.loading} error={state.error} empty={false}>
      {state.data ? <PlayerView key={playerId} payload={state.data} /> : null}
    </ApiState>
  )
}
