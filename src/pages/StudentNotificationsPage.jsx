import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { studentNotifications } from '../data/mockData';

export function StudentNotifications() {
  const [notifications, setNotifications] = useState(studentNotifications);
  const [filter, setFilter] = useState('all');

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const displayNotifications =
    filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const getIconForType = (type) => {
    switch (type) {
      case 'grade':
        return 'Award';
      case 'deadline':
        return 'AlertCircle';
      case 'announcement':
        return 'Bell';
      default:
        return 'Bell';
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case 'grade':
        return 'bg-green-50 border-green-100 text-green-600';
      case 'deadline':
        return 'bg-red-50 border-red-100 text-red-600';
      case 'announcement':
        return 'bg-blue-50 border-blue-100 text-blue-600';
      default:
        return 'bg-gray-50 border-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated with important events</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Mark all as read
        </button>
      </div>

      <div className="flex gap-2">
        {['all', 'unread'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg transition ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? `All (${notifications.length})` : `Unread (${notifications.filter(n => !n.read).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {displayNotifications.length > 0 ? (
          displayNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition ${
                notification.read ? 'bg-white border-gray-100' : `border-2 ${getColorForType(notification.type)}`
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    notification.read ? 'bg-gray-100 text-gray-400' : getColorForType(notification.type)
                  }`}
                >
                  <Icon name={getIconForType(notification.type)} size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-semibold ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm mt-1 ${notification.read ? 'text-gray-400' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-auto flex-shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-gray-400 hover:text-gray-600 transition p-1"
                      title="Mark as read"
                    >
                      <Icon name="Check" size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-gray-400 hover:text-red-600 transition p-1"
                    title="Delete"
                  >
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Icon name="Bell" size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
