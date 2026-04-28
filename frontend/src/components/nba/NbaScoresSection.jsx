import SectionHeader from '../SectionHeader'
import SubPanel from '../SubPanel'

export default function NbaScoresSection({ activeId }) {
  const visible = activeId === 'nba-scores-tab'
  if (!visible) return null

  return (
    <SubPanel id="nba-scores-tab" activeId={activeId}>
      <SectionHeader title="Scores & schedule" />
      <div className="table-wrap">
        <div className="table-head">
          <div className="table-head-title">Live scores feed</div>
        </div>
        <p className="hc-muted">
          There is no game schedule endpoint in the current REST API yet. Use the ticker and cards
          above as UI placeholders — wire this panel when a schedule/games route is available.
        </p>
      </div>
    </SubPanel>
  )
}
