import { useState } from 'react'
import { DEFAULT_NBA_SEASON } from '../config/api.js'
import { fetchSeasonSummary } from '../api/hoopcentral.js'
import { ApiState } from '../components/nba/ApiUi.jsx'
import StandingsTable from '../components/nba/StandingsTable.jsx'
import { PageTitle, SeasonForm } from '../components/nba/ui.jsx'
import { indexTeams, loadTeams, partitionConferences } from '../lib/nba.js'
import { useLoad } from '../lib/useLoad.js'

function loadStandings(season) {
  return Promise.all([fetchSeasonSummary(season), loadTeams()]).then(([summary, teams]) => ({
    seasonLabel: summary?.season || season,
    standings: summary?.standings || [],
    teamsById: indexTeams(teams),
  }))
}

export default function StandingsPage() {
  const [season, setSeason] = useState(DEFAULT_NBA_SEASON)
  const [draft, setDraft] = useState(DEFAULT_NBA_SEASON)
  const [sortKey, setSortKey] = useState('wins')
  const state = useLoad(season, () => loadStandings(season))

  const applySeason = (event) => {
    event.preventDefault()
    const next = draft.trim()
    if (next) setSeason(next)
  }

  const data = state.data
  const groups = partitionConferences(data?.standings || [])
  const empty = !state.loading && !state.error && !(data?.standings || []).length

  return (
    <>
      <PageTitle title="Standings">
        <SeasonForm value={draft} onChange={setDraft} onSubmit={applySeason} disabled={state.loading} />
      </PageTitle>
      <p className="hc-muted dash-intro">
        {data?.seasonLabel || season}. Games behind is calculated from wins and losses against the conference leader.
        Playoff clinch status is not stored.
      </p>
      <ApiState loading={state.loading} error={state.error} empty={empty} emptyLabel="No standings for that season.">
        {data ? (
          <div className="stack">
            <StandingsTable
              title="Eastern Conference"
              rows={groups.east}
              teamsById={data.teamsById}
              sortKey={sortKey}
              onSort={setSortKey}
            />
            <StandingsTable
              title="Western Conference"
              rows={groups.west}
              teamsById={data.teamsById}
              sortKey={sortKey}
              onSort={setSortKey}
            />
            <StandingsTable
              title="Other"
              rows={groups.other}
              teamsById={data.teamsById}
              sortKey={sortKey}
              onSort={setSortKey}
            />
          </div>
        ) : null}
      </ApiState>
    </>
  )
}
