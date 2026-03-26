import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { usersAPI } from '../services/api.js';

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll({ page, limit: 20, search, role: roleFilter });
      setUsers(res.data.data?.users || []);
      setPagination(res.data.data?.pagination || { total: 0, page: 1 });
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await usersAPI.delete(id);
      setMsg({ type: 'success', text: 'User deleted.' });
      fetchUsers();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Delete failed.' });
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await usersAPI.update(u._id, { isActive: !u.isActive });
      setMsg({ type: 'success', text: `User ${u.isActive ? 'deactivated' : 'activated'}.` });
      fetchUsers();
    } catch {}
  };

  if (user.role !== 'admin') return (
    <div className="card empty-state"><div className="empty-icon">🔒</div><p>Access denied</p><small>This page is for administrators only</small></div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">User Management</div>
          <div className="page-subtitle">Manage all platform users and their roles</div>
        </div>
        <span className="badge badge-indigo" style={{ fontSize: 13, padding: '5px 14px' }}>{pagination.total} users</span>
      </div>

      {msg.text && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} onClick={() => setMsg({ type: '', text: '' })}>{msg.text}</div>}

      <div className="flex gap-2" style={{ marginBottom: 20 }}>
        <input
          className="form-control" type="text" placeholder="Search by name or email…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <select className="form-control" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-page" style={{ height: 300 }}>
          <div className="spinner" />
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">👥</div><p>No users found.</p><small>Try adjusting your search filters</small></div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className={`user-avatar user-avatar-${u.role}`}
                        style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
                        {(u.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <strong>{u.name}</strong>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-red' : u.role === 'faculty' ? 'badge-blue' : 'badge-green'}`} style={{ textTransform: 'capitalize' }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="text-muted">{u.department || '—'}</td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-gray'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="text-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => handleToggleActive(u)}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      {u._id !== user._id && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
