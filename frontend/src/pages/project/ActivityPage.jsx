import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Avatar } from "../../components/ui";
import { cn } from "../../assets/utils";
import { CheckCircle2, FileText, Code, UserPlus, MessageSquare, Clock } from "lucide-react";
import api, { unwrap } from "../../lib/api";
import { useWorkspace } from "../../context/useWorkspace";
import { boardSocket } from "../../lib/socket";
import { timeAgo } from "../../lib/format";

const ActivityPage = () => {
  const { id: projectId } = useParams();
  const { currentWorkspace } = useWorkspace();
  const [activities, setActivities] = useState([]);
  const workspaceId = currentWorkspace?._id || currentWorkspace?.id;

  useEffect(() => {
    if (!workspaceId) return;
    api.get(`/activity/workspace/${workspaceId}?projectId=${projectId}`).then((res) => setActivities(unwrap(res).activities || [])).catch(() => {});
  }, [workspaceId, projectId]);

  useEffect(() => {
    boardSocket.connect();
    const prepend = (activity) => setActivities((prev) => [activity, ...prev]);
    boardSocket.on('activity:new', prepend);
    return () => boardSocket.off('activity:new', prepend);
  }, []);

  const getTypeStyles = (type) => type === "task" ? "border-primary bg-primary/5" : type === "wiki" ? "border-blue-500 bg-blue-500/5" : type === "snippet" ? "border-amber-500 bg-amber-500/5" : "border-success bg-success/5";
  const getTypeIcon = (type) => type === "task" ? <CheckCircle2 size={14} className="text-primary" /> : type === "wiki" ? <FileText size={14} className="text-blue-500" /> : type === "snippet" ? <Code size={14} className="text-amber-500" /> : type === "member" ? <UserPlus size={14} className="text-success" /> : <MessageSquare size={14} />;

  return (
    <PageShell breadcrumbs={["Projects", "Activity"]}>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Activity Feed</h1>
        <div className="space-y-4">
          {activities.length === 0 && <div className="surface p-8 rounded-2xl flex flex-col items-center text-center gap-2"><Clock className="text-gray-600 mb-2" size={32} /><p className="text-gray-500 text-sm italic">No activity yet.</p></div>}
          {activities.map((activity) => (
            <div key={activity._id || activity.id} className={cn("surface p-5 rounded-2xl border-l-4 flex items-center justify-between", getTypeStyles(activity.entityType))}>
              <div className="flex items-center gap-4">
                <div className="relative"><Avatar src={activity.userId?.avatar} name={activity.userId?.name} size="md" /><div className="absolute -bottom-1 -right-1 bg-dark-bg p-1 rounded-full">{getTypeIcon(activity.entityType)}</div></div>
                <div><p className="text-sm"><span className="font-bold">{activity.userId?.name || "Someone"}</span><span className="text-gray-400 ml-1.5">{activity.action.replace(".", " ")} {activity.entityName || ""}</span></p><p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">{timeAgo(activity.createdAt)}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default ActivityPage;
