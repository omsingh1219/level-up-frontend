import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, AlertTriangle, AlertCircle, ShoppingBag, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge, Card } from '@/components/ui/Badge';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications
} from '@/services/notificationService';
import { formatReadableDateTime } from '@/utils/dateUtils';
import type { AppNotification } from '@/types';

export const NotificationsPage: React.FC = () => {
  const { gym, profile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const gymId = gym?.gymId || profile?.gymId || '';

  useEffect(() => {
    if (!gymId) return;
    setLoading(true);
    const unsubscribe = subscribeToNotifications(gymId, undefined, (list) => {
      setNotifications(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gymId]);

  const handleMarkAsRead = async (id: string) => {
    if (!gymId) return;
    await markNotificationAsRead(gymId, id);
  };

  const handleMarkAll = async () => {
    if (!gymId) return;
    await markAllNotificationsAsRead(gymId);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Notification Center
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time feed of membership expiries, renewals, problem tickets, and system alerts
          </p>
        </div>

        {unreadCount > 0 && (
          <Button size="sm" variant="secondary" onClick={handleMarkAll} icon={<Check className="w-4 h-4" />}>
            Mark All as Read
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-zinc-500 py-12 text-center">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <Bell className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
          <p className="text-sm font-semibold text-white">No notifications</p>
          <p className="text-xs text-zinc-400 mt-1">You're completely caught up with gym activity.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
              className={`flex items-start gap-4 transition-all ${
                notif.isRead ? 'opacity-70 bg-zinc-900/40' : 'bg-zinc-900 border-zinc-700/80 shadow-md'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-zinc-800 text-emerald-400 shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-white">{notif.title}</h3>
                  <span className="text-[11px] text-zinc-500 shrink-0">
                    {formatReadableDateTime(notif.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{notif.body}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="zinc">{notif.channel}</Badge>
                  <span className="text-[10px] text-zinc-500">{notif.type}</span>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notif.id);
                  }}
                  className="p-1 rounded text-zinc-500 hover:text-emerald-400 cursor-pointer"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
