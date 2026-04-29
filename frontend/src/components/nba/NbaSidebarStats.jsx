import { useEffect, useState } from 'react'
import { DEFAULT_NBA_SEASON } from '../../config/api.js'
import { fetchStatLeaders } from '../../api/hoopcentral.js'

/* eslint-disable react-hooks/set-state-in-effect -- loading flags before async fetch */

function chip(row, statKey, suffix) {
  if (!row) return '—'
  const v = row[statKey]
  const val = v != null ? Number(v).toFixed(1) : '—'
  return `${val} ${suffix}`
}

export default function NbaSidebarStats({ active }) {
  const [ppg, setPpg] = useState(null)
  const [rpg, setRpg] = useState(null)
  const [apg, setApg] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!active) return
    let cancelled = false
    setErr(null)
    Promise.all([
      fetchStatLeaders(DEFAULT_NBA_SEASON, 'points_per_game', 1),
      fetchStatLeaders(DEFAULT_NBA_SEASON, 'rebounds_per_game', 1),
      fetchStatLeaders(DEFAULT_NBA_SEASON, 'assists_per_game', 1),
    ])
      .then(([a, b, c]) => {
        if (!cancelled) {
          setPpg(a?.[0] ?? null)
          setRpg(b?.[0] ?? null)
          setApg(c?.[0] ?? null)
        }
      })
      .catch((e) => {
        if (!cancelled) setErr(String(e.message || e))
      })
    return () => {
      cancelled = true
    }
  }, [active])

  if (!active) return null

  return (
    <div className="sidebar-block">
      <div className="sidebar-block-title">Leader snapshot</div>
      {err ? (
        <div className="hc-api-msg hc-api-err" style={{ fontSize: 11 }}>
          {err}
        </div>
      ) : null}
      <div className="sb-stat-row">
        <span className="sb-stat-label">PPG leader</span>
        <span className="sb-stat-val">{chip(ppg, 'ppg', 'PPG')}</span>
      </div>
      <div className="sb-stat-row">
        <span className="sb-stat-label">RPG leader</span>
        <span className="sb-stat-val">{chip(rpg, 'rpg', 'RPG')}</span>
      </div>
      <div className="sb-stat-row">
        <span className="sb-stat-label">APG leader</span>
        <span className="sb-stat-val">{chip(apg, 'apg', 'APG')}</span>
      </div>
    </div>
  )
}
