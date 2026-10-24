import React, { useEffect, useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import api from '../../lib/api';
import { formatNotifDate } from '../../lib/utils';

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadNotifications() {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (e) {}
  }

  async function markRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    await api.patch('/notifications/mark-all-read');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        id="notification-bell"
        onClick={() => setOpen(!open)}
        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'relative', transition: 'background 0.2s' }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="animate-pulse-ring" style={{ position: 'absolute', top: -4, right: -4, background: '#D32F2F', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0A2540' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setOpen(false)} />
          <div className="notif-panel" style={{ zIndex: 200 }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#0A2540' }}>Notifications</p>
                {unreadCount > 0 && <p style={{ fontSize: 11, color: '#64748B' }}>{unreadCount} unread</p>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: 11, color: '#0A2540', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Mark all read</button>
                )}
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={14} /></button>
              </div>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No notifications</div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', background: notif.read ? 'white' : '#F8FAFF', transition: 'background 0.2s' }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    {!notif.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D32F2F', marginTop: 5, flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: notif.read ? 400 : 600, color: '#1E293B', lineHeight: 1.4 }}>{notif.title}</p>
                      <p style={{ fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>{notif.body}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{formatNotifDate(notif.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
