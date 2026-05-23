import { Fragment, useEffect, useState } from 'react';
import { Bell, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { Avatar } from '../ui';
import { cn } from '../../assets/utils';
import api, { unwrap } from '../../lib/api';
import { notifSocket } from '../../lib/socket';
import { timeAgo } from '../../lib/format';

export const TopBar = ({ breadcrumbs = [] }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    notifSocket.connect();
    notifSocket.emit('subscribe', { userId: user._id || user.id });
    const addNotification = (notification) => setNotifications((prev) => [notification, ...prev]);
    notifSocket.on('notification:new', addNotification);
    return () => notifSocket.off('notification:new', addNotification);
  }, [user]);

  const openPanel = async () => {
    setIsOpen((prev) => !prev);
    const data = unwrap(await api.get('/notifications'));
    setNotifications(data.notifications || []);
  };

  const markRead = async (notification) => {
    await api.put(`/notifications/${notification._id || notification.id}/read`);
    setNotifications((prev) => prev.map((item) => (item._id || item.id) === (notification._id || notification.id) ? { ...item, read: true } : item));
    if (notification.link) window.location.href = notification.link;
  };

  const unread = notifications.filter((notification) => !notification.read).length;

  return (
    <header className="surface h-14 sticky top-0 z-30 flex items-center justify-between px-6 border-b">
      <div className="flex items-center gap-3">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-xs text-gray-500 font-medium">
          <span className="hover:text-primary cursor-pointer">DevCollab</span>
          {breadcrumbs.map((crumb, idx) => (
            <Fragment key={idx}>
              <ChevronRight size={14} className="mx-1" />
              <span className={cn(idx === breadcrumbs.length - 1 ? "text-gray-100 dark:text-gray-100 light:text-gray-900" : "hover:text-primary cursor-pointer")}>
                {crumb}
              </span>
            </Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-black/5 dark:bg-white/5 border dark:border-dark-border light:border-light-border px-9 py-1.5 rounded-md text-sm outline-none focus:ring-1 focus:ring-primary w-64 transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <button onClick={openPanel} className="relative text-gray-500 hover:text-primary transition-colors">
            <Bell size={20} />
            {unread > 0 && <span className="absolute -top-2 -right-2 min-w-4 h-4 bg-danger rounded-full border-2 border-dark-surface text-[9px] text-white flex items-center justify-center">{unread}</span>}
          </button>
          {isOpen && (
            <div className="absolute right-20 top-12 w-80 surface rounded-xl border shadow-2xl p-3 space-y-2 z-50">
              <div className="flex items-center justify-between"><h3 className="font-bold text-sm">Notifications</h3><button className="text-[10px] text-primary" onClick={() => api.put('/notifications/read-all').then(() => setNotifications((prev) => prev.map((item) => ({ ...item, read: true }))))}>Mark all read</button></div>
              {notifications.length === 0 && <p className="text-xs text-gray-500 p-3">No notifications yet.</p>}
              {notifications.map((notification) => (
                <button key={notification._id || notification.id} onClick={() => markRead(notification)} className={cn("w-full text-left rounded-lg p-3 text-xs hover:bg-white/5", !notification.read && "bg-primary/10")}>
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{timeAgo(notification.createdAt)}</p>
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{user?.name}</p>
              <p className="text-[10px] text-gray-500">{user?.role}</p>
            </div>
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
};
