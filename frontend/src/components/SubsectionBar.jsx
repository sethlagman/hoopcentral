export default function SubsectionBar({ visible, items, activeId, onSelect }) {
  const show = visible && items?.length
  return (
    <div className={`subsection-bar${show ? ' visible' : ''}`} id="subsection-bar">
      <div className="subsection-bar-inner" id="subsection-btns">
        {show
          ? items.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`subsection-btn${activeId === s.id ? ' active' : ''}`}
                onClick={() => onSelect(s.id)}
              >
                {s.label}
              </button>
            ))
          : null}
      </div>
    </div>
  )
}
