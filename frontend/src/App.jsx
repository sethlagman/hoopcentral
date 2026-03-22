import { useState, useCallback } from 'react'
import './styles/hoopcentral.css'
import { SUBSECTIONS } from './data/navigation'
import ScoresTicker from './components/ScoresTicker'
import SiteHeader from './components/SiteHeader'
import SportsNav from './components/SportsNav'
import SubsectionBar from './components/SubsectionBar'
import SiteFooter from './components/SiteFooter'
import HomePanel from './components/home/HomePanel'
import NbaPanel from './components/panels/NbaPanel'
import FifaPanel from './components/panels/FifaPanel'
import NflPanel from './components/panels/NflPanel'
import MlbPanel from './components/panels/MlbPanel'
import NhlPanel from './components/panels/NhlPanel'
import MmaPanel from './components/panels/MmaPanel'

function buildInitialSubs() {
  const o = {}
  for (const [key, items] of Object.entries(SUBSECTIONS)) {
    if (items.length) o[key] = items[0].id
  }
  return o
}

export default function App() {
  const [sport, setSport] = useState('home')
  const [subBySport, setSubBySport] = useState(buildInitialSubs)

  const subs = SUBSECTIONS[sport] ?? []
  const activeSubId = subs.length ? subBySport[sport] ?? subs[0].id : null

  const handleSelectSub = useCallback(
    (id) => {
      setSubBySport((prev) => ({ ...prev, [sport]: id }))
    },
    [sport],
  )

  return (
    <>
      <ScoresTicker />
      <SiteHeader />
      <SportsNav activeSport={sport} onSelect={setSport} />
      <SubsectionBar
        visible={sport !== 'home'}
        items={subs}
        activeId={activeSubId}
        onSelect={handleSelectSub}
      />
      <div className="main">
        <HomePanel active={sport === 'home'} />
        <NbaPanel active={sport === 'nba'} activeSubId={activeSubId} />
        <FifaPanel active={sport === 'fifa'} activeSubId={activeSubId} />
        <NflPanel active={sport === 'nfl'} activeSubId={activeSubId} />
        <MlbPanel active={sport === 'mlb'} activeSubId={activeSubId} />
        <NhlPanel active={sport === 'nhl'} activeSubId={activeSubId} />
        <MmaPanel active={sport === 'mma'} activeSubId={activeSubId} />
      </div>
      <SiteFooter />
    </>
  )
}
