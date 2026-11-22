import { Link } from 'react-router-dom'
import { Logo } from './ui.jsx'
import {
  conferenceName,
  formatGamesBehind,
  formatStreak,
  formatWinRate,
  gamesBehind,
  sortStandings,
  winsLeader,
} from '../../lib/nba.js'

const SORTS = [
  { id: 'wins', label: 'W' },
  { id: 'losses', label: 'L' },
  { id: 'winrate', label: 'PCT' },
]

export default function StandingsTable({ title, rows, teamsById, sortKey, onSort }) {
  const ordered = sortStandings(rows, sortKey)
  const leader = winsLeader(rows)
  if (!ordered.length) return null
  return (
    <div className="table-wrap">
      <div className="table-head">
        <div className="table-head-title">{title}</div>
      </div>
      <div className="table-scroll">
        <table className="sortable">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              {SORTS.map((sort) => (
                <th key={sort.id}>
                  <button type="button" onClick={() => onSort(sort.id)} aria-pressed={sortKey === sort.id}>
                    {sort.label}{sortKey === sort.id ? ' ·' : ''}
                  </button>
                </th>
              ))}
              <th>GB</th>
              <th>Home</th>
              <th>Road</th>
              <th>Conf</th>
              <th>Div</th>
              <th>L10</th>
              <th>Streak</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((row, index) => {
              const team = teamsById?.get(String(row.team))
              const name = row.team_name || team?.full_name || row.team
              return (
                <tr key={row.id ?? `${row.team}-${row.season}`}>
                  <td className="rank-muted">{index + 1}</td>
                  <td>
                    <Link to={`/teams/${row.team}`} className="pcell">
                      <Logo src={team?.logo} label={team?.abbreviation || name} className="logo-img sm" />
                      <span>
                        <span className="pname">{name}</span>
                        <span className="pteam">{conferenceName(row.conference) || row.conference}</span>
                      </span>
                    </Link>
                  </td>
                  <td>{row.wins}</td>
                  <td>{row.losses}</td>
                  <td className="stat-hi">{formatWinRate(row.winrate)}</td>
                  <td>{formatGamesBehind(gamesBehind(row, leader))}</td>
                  <td>{row.home || '—'}</td>
                  <td>{row.road || '—'}</td>
                  <td>{row.conference_record || '—'}</td>
                  <td>{row.division_record || '—'}</td>
                  <td>{row.last10 || '—'}</td>
                  <td>{formatStreak(row.winstreak)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
