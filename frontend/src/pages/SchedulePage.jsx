import { useState } from 'react'
import { DEFAULT_NBA_SEASON } from '../config/api.js'
import { fetchSchedule } from '../api/hoopcentral.js'
import { ApiState } from '../components/nba/ApiUi.jsx'
import GameCard from '../components/nba/GameCard.jsx'
import { PageTitle, Pager } from '../components/nba/ui.jsx'
import { formatGameDate, indexTeams, loadTeams } from '../lib/nba.js'
import { useLoad } from '../lib/useLoad.js'

const PAGE_SIZE = 20

function groupByDate(games) {
  const groups = []
  for (const game of games) {
    const last = groups[groups.length - 1]
    if (!last || last.date !== game.game_date) groups.push({ date: game.game_date, games: [game] })
    else last.games.push(game)
  }
  return groups
}

export default function SchedulePage() {
  const [season, setSeason] = useState(DEFAULT_NBA_SEASON)
  const [date, setDate] = useState('')
  const [team, setTeam] = useState('')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [draft, setDraft] = useState({ season: DEFAULT_NBA_SEASON, date: '', team: '' })
  const key = JSON.stringify({ season, date, team, order, page })
  const state = useLoad(key, () =>
    Promise.all([
      fetchSchedule({ season, date, team, order, page, pageSize: PAGE_SIZE }),
      loadTeams(),
    ]).then(([schedule, teams]) => ({
      games: schedule?.games || [],
      count: schedule?.count || 0,
      seasonLabel: schedule?.season || season,
      teamsById: indexTeams(teams),
    })),
  )

  const apply = (event) => {
    event.preventDefault()
    setSeason(draft.season.trim() || DEFAULT_NBA_SEASON)
    setDate(draft.date)
    setTeam(draft.team.trim())
    setPage(1)
  }

  const groups = groupByDate(state.data?.games || [])

  return (
    <>
      <PageTitle title="Schedule" />
      <form className="hc-toolbar filter-row" onSubmit={apply}>
        <input
          className="hc-input"
          value={draft.season}
          onChange={(event) => setDraft((current) => ({ ...current, season: event.target.value }))}
          aria-label="Season"
          placeholder="Season (2025-26)"
        />
        <input
          className="hc-input"
          type="date"
          value={draft.date}
          onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
          aria-label="Date"
        />
        <input
          className="hc-input hc-input-narrow"
          value={draft.team}
          onChange={(event) => setDraft((current) => ({ ...current, team: event.target.value }))}
          aria-label="Team"
          placeholder="Team (BOS)"
        />
        <button type="submit" className="hc-btn" disabled={state.loading}>
          Apply
        </button>
        <button
          type="button"
          className="hc-btn hc-btn-ghost"
          onClick={() => {
            setOrder((current) => (current === 'desc' ? 'asc' : 'desc'))
            setPage(1)
          }}
        >
          {order === 'desc' ? 'Latest first' : 'Earliest first'}
        </button>
      </form>
      <p className="hc-muted dash-intro">
        {state.data?.seasonLabel || season}. Status and final score come from the schedule. Postponed games keep the status text from the feed.
      </p>
      <Pager
        page={page}
        count={state.data?.count || 0}
        pageSize={PAGE_SIZE}
        onPage={setPage}
        disabled={state.loading}
      />
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!state.loading && !state.error && groups.length === 0}
        emptyLabel="No games for that season, date, or team."
      >
        {groups.map((group) => (
          <section key={group.date} className="section-block">
            <h2 className="section-label">{formatGameDate(group.date)}</h2>
            <div className="card-grid">
              {group.games.map((game) => (
                <GameCard key={game.game_id} game={game} teamsById={state.data.teamsById} />
              ))}
            </div>
          </section>
        ))}
      </ApiState>
    </>
  )
}
