import { SPORT_TABS } from '../data/navigation'

export default function SportsNav({ activeSport, onSelect }) {
  return (
    <div className="sports-nav">
      <div className="sports-nav-inner">
        {SPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`sport-tab${activeSport === tab.id ? ' active' : ''}`}
            data-sport={tab.id}
            onClick={() => onSelect(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
