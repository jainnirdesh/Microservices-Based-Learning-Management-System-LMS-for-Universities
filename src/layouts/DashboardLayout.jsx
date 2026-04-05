import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children, navItems, role, userName }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { profile, signOut } = useAuth();

  const effectiveName = profile?.full_name || userName;
  const effectiveRole = profile?.role || role;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 flex flex-col border-r border-gray-200 bg-white transition-all duration-200 ${
          collapsed ? 'w-14' : 'w-56'
        }`}
      >
        {/* Brand */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center flex-shrink-0">
                <Icon name="Layers" size={12} className="text-white" strokeWidth={2.2} />
              </div>
              <span className="text-sm font-semibold text-gray-900 tracking-tight">UniCore</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center mx-auto">
              <Icon name="Layers" size={12} className="text-white" strokeWidth={2.2} />
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Icon name="ChevronRight" size={14} />
            </button>
          )}
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-2">
            <span className="tag bg-primary-50 text-primary-700 uppercase tracking-wider font-semibold" style={{fontSize:'10px'}}>
              {String(effectiveRole || '').replace('_', ' ')}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${active ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon name={item.icon} size={16} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className={`p-3 border-t border-gray-100 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-primary-700">
                  {effectiveName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{effectiveName}</p>
                <p className="text-xs text-gray-400 capitalize">{String(effectiveRole || '').replace('_', ' ')}</p>
              </div>
              <button onClick={handleSignOut} type="button" title="Sign out">
                <Icon name="LogOut" size={14} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          ) : (
            <button onClick={() => setCollapsed(false)} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <Icon name="Menu" size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              {navItems.find(n => location.pathname === n.path || location.pathname.startsWith(n.path + '/'))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              All systems operational
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
