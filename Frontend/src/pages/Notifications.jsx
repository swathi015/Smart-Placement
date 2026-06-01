import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api.js';
import Alert from '../components/Alert.jsx';
import Loader from '../components/Loader.jsx';
import { Bell, Check, Eye } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadNotifications = async () => {
    try {
      const logs = await notificationAPI.getMyNotifications();
      setNotifications(logs);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setError('');
    setSuccess('');
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setSuccess('All notifications marked as read.');
    } catch (err) {
      console.error(err);
      setError('Failed to update notifications.');
    }
  };

  if (loading) return <Loader message="Opening mailbox..." />;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {error && <Alert type="danger" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bell style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '18px', margin: 0 }}>
            Inbox {unreadCount > 0 && <span className="badge badge-danger" style={{ marginLeft: '8px' }}>{unreadCount} New</span>}
          </h2>
        </div>
        
        {unreadCount > 0 && (
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={handleMarkAllRead}>
            <Check size={16} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {notifications.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
            <Bell size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p>Your inbox is empty.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="glass-card" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px',
              background: n.isRead ? 'var(--card-bg)' : 'rgba(139, 92, 246, 0.03)',
              borderLeft: n.isRead ? '1px solid var(--card-border)' : '3px solid var(--primary)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', color: n.isRead ? 'var(--text-primary)' : '#fff' }}>{n.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{n.message}</p>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</span>
              </div>

              {!n.isRead && (
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px', borderRadius: '50%' }}
                  onClick={() => handleMarkRead(n._id)}
                  title="Mark as Read"
                >
                  <Eye size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
