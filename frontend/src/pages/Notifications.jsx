import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { notificationsAPI } from '../services/api.js';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getMy();
      setNotifications(res.data.data?.notifications || []);
      setUnread(res.data.data?.unreadCount || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markRead({ all: true });
      fetchNotifications();
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead({ notificationIds: [id] });
      fetchNotifications();
    } catch {}
  };

  const priorityBadge = (p) => {
    const map = { high: 'badge-red', medium: 'badge-yellow', low: 'badge-gray' };
    return map[p] || 'badge-gray';
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Notifications {unread > 0 && <span className="badge badge-red" style={{ fontSize: 13, marginLeft: 8 }}>{unread} new</span>}</div>
          <div className="page-subtitle">Stay updated on all platform activity</div>
        </div>
        <div className="flex gap-2">
          {unread > 0 && <button className="btn btn-outline" onClick={handleMarkAllRead}>Mark all read</button>}
          {user.role === 'admin' && <button className="btn btn-primary" onClick={() => setShowBroadcast(true)}>📢 Broadcast</button>}
        </div>
      </div>

      {msg && <div className="alert alert-success" onClick={() => setMsg('')}>{msg}</div>}

      {showBroadcast && (
        <BroadcastModal onClose={() => setShowBroadcast(false)} onSent={() => { setShowBroadcast(false); setMsg('Broadcast sent!'); fetchNotifications(); }} />
      )}

      {notifications.length === 0 ? (
        <div className="empty-state card"><div className="empty-icon">🔔</div><p>No notifications yet.</p><small>You're all caught up!</small></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {notifications.map((n) => (
            <div key={n._id} className={`notification-item${!n.isRead ? ' unread' : ''}`}
              onClick={() => !n.isRead && handleMarkRead(n._id)}>
              <div className="notif-icon">
                {n.type === 'announcement' ? '📢' : n.type === 'alert' ? '⚠️' : n.priority === 'high' ? '🔴' : '🔔'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div className="notif-title">{n.title}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <span className={`badge ${priorityBadge(n.priority)}`}>{n.priority}</span>
                    {!n.isRead && <div className="unread-dot" />}
                  </div>
                </div>
                <div className="notif-msg">{n.message}</div>
                <div className="notif-time">{new Date(n.createdAt).toLocaleString()} · {n.senderName}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BroadcastModal({ onClose, onSent }) {
  const [form, setForm] = useState({ title: '', message: '', recipientRole: 'all', type: 'general', priority: 'medium' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await notificationsAPI.broadcast(form);
      onSent();
    } catch (err) {
      setError(err.response?.data?.message || 'Broadcast failed.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">📢 Broadcast Notification</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input className="form-control" type="text" name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea className="form-control" name="message" value={form.message} onChange={handleChange} rows={3} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Recipient', name: 'recipientRole', options: [['all', 'Everyone'], ['student', 'Students'], ['faculty', 'Faculty']] },
              { label: 'Type', name: 'type', options: [['general', 'General'], ['announcement', 'Announcement'], ['alert', 'Alert']] },
              { label: 'Priority', name: 'priority', options: [['low', 'Low'], ['medium', 'Medium'], ['high', 'High']] },
            ].map(({ label, name, options }) => (
              <div className="form-group" key={name}>
                <label>{label}</label>
                <select className="form-control" name={name} value={form[name]} onChange={handleChange}>
                  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Sending…' : 'Send Broadcast'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
