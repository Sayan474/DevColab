import { useEffect, useState } from "react";
import { PageShell } from "../../components/layout/PageShell";
import { Button } from "../../components/ui";
import api, { unwrap } from "../../lib/api";
import { timeAgo } from "../../lib/format";
import { cn } from "../../assets/utils";
import { useAuth } from "../../context/useAuth";
import { notifSocket } from "../../lib/socket";

const InboxPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = unwrap(await api.get("/notifications"));
      setNotifications(data.notifications || []);
    };
    load().catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    notifSocket.connect();
    notifSocket.emit("subscribe", { userId: user._id || user.id });
    const addNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };
    notifSocket.on("notification:new", addNotification);
    return () => {
      notifSocket.off("notification:new", addNotification);
    };
  }, [user]);

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const openNotification = async (notification) => {
    await api.put(`/notifications/${notification._id || notification.id}/read`);
    setNotifications((prev) =>
      prev.map((item) =>
        (item._id || item.id) === (notification._id || notification.id)
          ? { ...item, read: true }
          : item
      )
    );
    if (notification.link) window.location.href = notification.link;
  };

  return (
    <PageShell breadcrumbs={["Inbox"]}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inbox</h1>
            <p className="text-gray-500">Stay on top of mentions and updates.</p>
          </div>
          <Button variant="secondary" onClick={markAllRead}>Mark all read</Button>
        </div>

        <div className="space-y-2">
          {notifications.length === 0 && (
            <div className="surface p-6 rounded-xl text-sm text-gray-500">
              You have no notifications yet.
            </div>
          )}
          {notifications.map((notification) => (
            <button
              key={notification._id || notification.id}
              onClick={() => openNotification(notification)}
              className={cn(
                "surface w-full text-left p-4 rounded-xl transition-all card-interactive",
                !notification.read && "border border-primary/40"
              )}
            >
              <p className="font-medium">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-2">{timeAgo(notification.createdAt)}</p>
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default InboxPage;
