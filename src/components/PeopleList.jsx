import { useState, useMemo } from 'react'
import PersonRow from './PersonRow.jsx'
import { LIST_META } from './listMeta.js'

const LIST_OPTIONS = [
  { key: 'all',         label: 'All crews' },
  { key: 'college',     label: 'College Life' },
  { key: 'earlycareer', label: 'Early Career' },
  { key: 'youngpro',    label: 'Young Professionals' },
]

export default function PeopleList({ people, loading, error, selectedId, onSelect }) {
  const [list, setList]         = useState('all')
  const [gender, setGender]     = useState('all')
  const [followup, setFollowup] = useState('all')
  const [search, setSearch]     = useState('')
  const [sort, setSort]         = useState('name')

  const counts = useMemo(() => ({
    all:         people.length,
    college:     people.filter(p => p.list === 'college').length,
    earlycareer: people.filter(p => p.list === 'earlycareer').length,
    youngpro:    people.filter(p => p.list === 'youngpro').length,
  }), [people])

  const visible = useMemo(() => {
    let rows = people.filter(p => {
      if (list !== 'all' && p.list !== list) return false
      if (gender !== 'all' && (p.gender || '').toLowerCase() !== gender) return false
      if (followup === 'needs' && !p.needsFollowup) return false
      if (followup === 'none'  &&  p.needsFollowup) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    if (sort === 'name')     rows = [...rows].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'followup') rows = [...rows].sort((a, b) => {
      if (a.needsFollowup === b.needsFollowup) return a.name.localeCompare(b.name)
      return a.needsFollowup ? -1 : 1
    })
    return rows
  }, [people, list, gender, followup, search, sort])

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
        <div className="filter-row">
          <select className="filter-select" value={list} onChange={e => setList(e.target.value)}>
            {LIST_OPTIONS.map(o => (
              <option key={o.key} value={o.key}>{o.label} ({counts[o.key]})</option>
            ))}
          </select>
          <select className="filter-select" value={gender} onChange={e => setGender(e.target.value)}>
            <option value="all">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select className="filter-select" value={followup} onChange={e => setFollowup(e.target.value)}>
            <option value="all">Any follow-up</option>
            <option value="needs">Needs follow-up</option>
            <option value="none">No follow-up</option>
          </select>
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
          <div className="empty-state">🔍<p>No people match your filters.</p></div>
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
