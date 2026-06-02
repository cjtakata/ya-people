import { useState, useMemo } from 'react'
import PersonRow from './PersonRow.jsx'

const TABS = [
  { key: 'all',         label: 'All',          cls: 'tab-all' },
  { key: 'college',     label: 'College Life',  cls: 'tab-college' },
  { key: 'earlycareer', label: 'Early Career',  cls: 'tab-early' },
  { key: 'youngpro',    label: 'Young Pro',     cls: 'tab-youngpro' },
]

export default function PeopleList({ people, loading, error, selectedId, onSelect }) {
  const [tab, setTab]       = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort]     = useState('name')

  const counts = useMemo(() => ({
    all:         people.length,
    college:     people.filter(p => p.list === 'college').length,
    earlycareer: people.filter(p => p.list === 'earlycareer').length,
    youngpro:    people.filter(p => p.list === 'youngpro').length,
  }), [people])

  const visible = useMemo(() => {
    let list = people.filter(p => {
      if (tab !== 'all' && p.list !== tab) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    if (sort === 'name')    list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'followup') list = [...list].sort((a, b) => {
      if (a.needsFollowup === b.needsFollowup) return a.name.localeCompare(b.name)
      return a.needsFollowup ? -1 : 1
    })
    return list
  }, [people, tab, search, sort])

  return (
    <div className="people-pane">
      <div className="list-toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="search"
            placeholder="Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="list-tabs">
          {TABS.map(t => (
            <span
              key={t.key}
              className={`tab ${t.cls}${tab !== t.key ? ' inactive' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label} <strong>{counts[t.key]}</strong>
            </span>
          ))}
        </div>
      </div>

      <div className="list-meta">
        <span><strong>{visible.length}</strong> people</span>
        <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="followup">Sort: Needs follow-up first</option>
        </select>
      </div>

      <div className="people-list">
        {loading && <div className="empty-state">Loading people from PCO…</div>}
        {error   && <div className="empty-state" style={{ color: 'var(--danger)' }}>{error}</div>}
        {!loading && !error && visible.length === 0 && (
          <div className="empty-state">🔍<p>No people match your search.</p></div>
        )}
        {visible.map(p => (
          <PersonRow
            key={p.id}
            person={p}
            selected={p.id === selectedId}
            onClick={() => onSelect(p.id)}
          />
        ))}
      </div>
    </div>
  )
}
