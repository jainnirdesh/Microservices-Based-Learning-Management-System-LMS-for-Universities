import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = {
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { to: '/users', label: 'Users', icon: '◎' },
    { to: '/courses', label: 'Courses', icon: '▤' },
    { to: '/assessments', label: 'Assessments', icon: '✎' },
    { to: '/notifications', label: 'Notifications', icon: '◌' },
    { to: '/analytics', label: 'Analytics', icon: '▲' },
  ],
  faculty: [
    { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { to: '/courses', label: 'My Courses', icon: '▤' },
    { to: '/assessments', label: 'Assessments', icon: '✎' },
    { to: '/notifications', label: 'Notifications', icon: '◌' },
    { to: '/analytics', label: 'Analytics', icon: '▲' },
  ],
  student: [
    { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { to: '/courses', label: 'My Courses', icon: '▤' },
    { to: '/assessments', label: 'Assessments', icon: '✎' },
    { to: '/notifications', label: 'Notifications', icon: '◌' },
  ],
};

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/courses': 'Courses',
  '/assessments': 'Assessments',
  '/notifications': 'Notifications',
  '/analytics': 'Analytics',
};

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = NAV[user?.role] || NAV.student;
  const pageTitle = PAGE_TITLES[location.pathname] || 'UniCore';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const avatarClass = `user-avatar user-avatar-${user?.role || 'student'}`;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎓</div>
          <div>
            <div className="sidebar-logo-text">UniCore</div>
            <div className="sidebar-logo-sub">LMS Platform</div>
          </div>
        </div>

        <nav>
          <div className="sidebar-section-label">Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              <span className="nav-icon" style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user-card">
            <div className={avatarClass}>{getInitials(user?.name)}</div>
            <div style={{ overflow: 'hidden' }}>
              <div className="user-info-name">{user?.name}</div>
              <div className="user-info-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>↩</span> Sign out
          </button>
        </div>
      </aside>

      <div className="top-header">
        <div className="header-breadcrumb">
          UniCore LMS &nbsp;/&nbsp; <span>{pageTitle}</span>
        </div>
        <div className="header-actions">
          <div className={`user-avatar user-avatar-${user?.role || 'student'}`} style={{ width: 34, height: 34, fontSize: 13 }}>
            {getInitials(user?.name)}
          </div>
        </div>
      </div>

      <main className="main-content">{children}</main>
    </div>
  );
}
