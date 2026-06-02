import { useState, useEffect } from 'react'
import LoginScreen from './components/LoginScreen.jsx'
import AppHeader from './components/AppHeader.jsx'
import PeopleList from './components/PeopleList.jsx'
import DetailPanel from './components/DetailPanel.jsx'

export default function App() {
  const [user, setUser]           = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setUser(data); setAuthLoading(false) })
      .catch(() => setAuthLoading(false))
  }, [])

  if (authLoading) return <div className="loading-screen">Loading…</div>
  if (!user) return <LoginScreen />

  return <AuthenticatedApp user={user} onLogout={() => setUser(null)} />
}

function AuthenticatedApp({ user, onLogout }) {
  const [people, setPeople]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [selectedId, setSelectedId]   = useState(null)

  useEffect(() => {
    fetch('/api/people')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setPeople(data); setLoading(false) })
      .catch(() => { setError('Failed to load people from PCO.'); setLoading(false) })
  }, [])

  const selectedPerson = people.find(p => p.id === selectedId) ?? null

  async function handleSave(id, body) {
    const res = await fetch(`/api/person/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('Save failed')
    const updated = await res.json()
    setPeople(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
    return updated
  }

  async function handleLogout() {
    await fetch('/api/auth/logout')
    onLogout()
  }

  return (
    <div className="app-screen">
      <AppHeader user={user} onLogout={handleLogout} listCount={people.length} />
      <div className="app-body">
        <PeopleList
          people={people}
          loading={loading}
          error={error}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <DetailPanel
          person={selectedPerson}
          onClose={() => setSelectedId(null)}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
