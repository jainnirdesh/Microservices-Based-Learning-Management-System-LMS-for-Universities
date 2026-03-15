const { createCollectionStore } = require('../../../shared/supabaseDocumentStore');

const store = createCollectionStore('notifications', {
  recipientRole: 'all',
  senderId: 'system',
  senderName: 'UniCore System',
  metadata: {},
  isRead: false,
  readAt: null,
  priority: 'medium',
});

const withId = (item) => (item ? { _id: item.id, ...item } : null);

module.exports = {
  async createNotification(data) {
    return withId(await store.create(data));
  },

  async listNotifications(query = {}, options = {}) {
    return (await store.list(query, options)).map(withId);
  },

  async countNotifications(query = {}) {
    return store.count(query);
  },

  async updateNotifications(query = {}, updates = {}) {
    return store.updateMany(query, updates);
  },

  async deleteNotification(id) {
    return withId(await store.delete(id));
  },
};