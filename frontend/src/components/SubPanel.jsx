export default function SubPanel({ id, activeId, children }) {
  return (
    <div className={`sub-panel ${activeId === id ? 'active' : ''}`} id={id}>
      {children}
    </div>
  )
}
