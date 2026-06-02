const LOGO = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#0a0a0a"/>
    <text x="100" y="148" fontFamily="Georgia,'Times New Roman',serif" fontSize="108"
      fontWeight="bold" fill="#f2ede4" textAnchor="middle" letterSpacing="-2">ya</text>
  </svg>
)

export default function AppHeader({ user, onLogout, listCount }) {
  const initials = (user.global_name || user.username || '?')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="app-logo">{LOGO}</div>
        <div>
          <div className="app-title">YA People</div>
          <div className="app-subtitle">Planning Center · {listCount} people</div>
        </div>
      </div>
      <div className="header-right">
        <div className="user-chip">
          <div className="user-avatar">
            {user.avatar
              ? <img src={user.avatar} alt={initials} />
              : initials}
          </div>
          <span className="user-name">{user.global_name || user.username}</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>Sign out</button>
      </div>
    </header>
  )
}
