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
          <div className="table-head-title">Tonight & upcoming</div>
        </div>
        <p className="hc-muted" style={{ padding: '12px 16px' }}>
          Game feeds are not wired yet. When live scores arrive, finals and previews will slot in here
          alongside tickers elsewhere on this page.
        </p>
      </div>
    </SubPanel>
  )
}
