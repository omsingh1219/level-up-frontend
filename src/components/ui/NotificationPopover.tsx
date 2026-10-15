import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, AlertTriangle, AlertCircle, ShoppingBag, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { AppNotification } from '@/types';
import {
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/services/notificationService';
import { formatReadableDateTime } from '@/utils/dateUtils';

export const NotificationPopover: React.FC = () => {
  const { profile, gym } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile?.gymId) return;

    // Listen to notifications for this user / gym
    const recipientUid = profile.role === 'MEMBER' ? profile.uid : undefined;
    const unsubscribe = subscribeToNotifications(profile.gymId, recipientUid, (list) => {
      setNotifications(list);
    });

    return () => unsubscribe();
  }, [profile?.gymId, profile?.uid, profile?.role]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile?.gymId) return;
    await markNotificationAsRead(profile.gymId, id);
  };

  const handleMarkAllRead = async () => {
    if (!profile?.gymId) return;
    const recipientUid = profile.role === 'MEMBER' ? profile.uid : undefined;
    await markAllNotificationsAsRead(profile.gymId, recipientUid);
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'MEMBERSHIP_EXPIRING':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'MEMBERSHIP_EXPIRED':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'MEMBERSHIP_RENEWED':
        return <Check className="w-4 h-4 text-emerald-400" />;
      case 'COMPLAINT_CREATED':
      case 'COMPLAINT_UPDATED':
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case 'NEW_PRODUCT':
        return <ShoppingBag className="w-4 h-4 text-purple-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-zinc-950 ring-2 ring-zinc-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">Notifications</h4>
              {unreadCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-zinc-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={(e) => !notif.isRead && handleMarkAsRead(notif.id, e)}
                  className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex gap-3 ${
                    notif.isRead
                      ? 'bg-zinc-900/40 border-zinc-800/40 opacity-70'
                      : 'bg-zinc-800/40 border-zinc-700/60 hover:bg-zinc-800/70'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-zinc-200 truncate">{notif.title}</p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {notif.body}
                    </p>
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      {formatReadableDateTime(notif.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
