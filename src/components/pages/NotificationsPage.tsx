import React, { useMemo, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button, Card, EmptyState } from '../ui/DesignSystem';
import { formatShortTimestamp } from '../../lib/api';
import type { AppView, PortalNotification } from '../../types';

interface NotificationsPageProps {
  notifications: PortalNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (view: AppView, linkId?: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const visible = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex items-center p-1 bg-white border border-[#E8E4DA] rounded-md self-start">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-[#172B45] text-white' : 'text-[#777777] hover:text-[#252A32]'
            }`}
          >
            All Notices ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#172B45] text-white'
                : 'text-[#777777] hover:text-[#252A32]'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={onMarkAllRead}>
            <CheckCheck className="w-4 h-4 text-[#B99A55]" />
            <span>Mark All as Read</span>
          </Button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-5 h-5" />}
          title={filter === 'unread' ? 'All caught up' : 'No notifications yet'}
          description="Updates regarding your filed reports, ownership claims, and campus matches will appear here."
        />
      ) : (
        <Card padding="none" className="overflow-hidden divide-y divide-[#E8E4DA]">
          {visible.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                !n.read ? 'bg-[#F9F4E8]/35' : 'bg-white'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-semibold text-[#172B45]">{n.title}</h3>
                  {!n.read && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#B99A55]/20 text-[#7D6124] border border-[#E4D4AA] rounded">
                      Unread
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#252A32]/85 mt-1.5 leading-relaxed">{n.message}</p>
                <div className="mt-2 text-xs font-mono text-[#777777]">
                  {formatShortTimestamp(n.createdAt)}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={() => onMarkRead(n.id)}>
                    Mark Read
                  </Button>
                )}
                {n.linkView && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (!n.read) onMarkRead(n.id);
                      onNavigate(n.linkView!, n.linkId);
                    }}
                  >
                    Open Record
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};
