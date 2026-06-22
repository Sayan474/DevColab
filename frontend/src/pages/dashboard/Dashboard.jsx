import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Button, Badge, Avatar } from "../../components/ui";
import { cn } from "../../assets/utils";
import { Plus, ArrowRight, MessageSquare, Settings, Zap, BarChart2, Clock } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useWorkspace } from "../../context/useWorkspace";
import api, { unwrap } from "../../lib/api";
import { formatDate, taskAssigneeId, timeAgo } from "../../lib/format";

const Dashboard = () => {
  const { user } = useAuth();
  const { currentWorkspace, projects, fetchProjects } = useWorkspace();
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentWorkspace) fetchProjects(currentWorkspace._id || currentWorkspace.id);
  }, [currentWorkspace, fetchProjects]);

  useEffect(() => {
    const load = async () => {
      if (!currentWorkspace) return;
      const workspaceId = currentWorkspace._id || currentWorkspace.id;
      const activityData = unwrap(await api.get(`/activity/workspace/${workspaceId}?limit=4`));
      setActivities(activityData.activities || []);
      const taskLists = await Promise.all(projects.slice(0, 4).map((project) => api.get(`/tasks/project/${project._id || project.id}`)));
      setTasks(taskLists.flatMap((response) => unwrap(response).tasks || []));
    };
    load().catch(() => {});
  }, [currentWorkspace, projects]);

  const pendingTasks = tasks.filter((task) => taskAssigneeId(task)?.toString() === (user?._id || user?.id) && task.status !== "done");
  const primaryProjectId = projects[0]?._id || projects[0]?.id;

  const handleNewProject = () => navigate('/projects/new');
  const handleViewFeed = () => navigate(primaryProjectId ? `/project/${primaryProjectId}/activity` : '/projects');

  return (
    <PageShell breadcrumbs={["Dashboard"]}>
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Good morning, {user?.name || "developer"}</h1>
            <p className="text-gray-500">Here's what's happening across your projects today.</p>
          </div>
          <div className="flex gap-3">
            <Button className="gap-2" onClick={handleNewProject}><Plus size={18} /> New Project</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["Summarize Daily", Zap, "primary"],
            ["Team Standup", MessageSquare, "success"],
            ["What's Blocking?", BarChart2, "info"],
          ].map(([label, Icon, tone]) => (
            <Link key={label} to={projects[0] ? `/project/${projects[0]._id || projects[0].id}/ai` : "/dashboard"} className="surface p-4 rounded-xl flex items-center gap-4 hover:border-primary transition-all group text-left card-interactive">
              <div className={`w-10 h-10 rounded-lg bg-${tone}/10 flex items-center justify-center text-${tone}`}><Icon size={20} /></div>
              <div><p className="font-bold">{label}</p><p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">AI Action</p></div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">Pending Tasks <Badge variant="primary">{pendingTasks.length}</Badge></h2>
              </div>
              <div className="space-y-2">
                {pendingTasks.length === 0 && <div className="surface p-6 rounded-xl text-sm text-gray-500">No pending tasks assigned to you.</div>}
                {pendingTasks.map((task) => (
                  <Link to={`/project/${task.projectId?._id || task.projectId}/board`} key={task._id || task.id} className="surface p-3 rounded-lg flex items-center justify-between hover:border-dark-border bg-white/5 card-interactive">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", task.priority === "P0" ? "bg-danger" : task.priority === "P1" ? "bg-warning" : "bg-info")} />
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {formatDate(task.dueDate)}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">Recent Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.length === 0 && <div className="surface p-6 rounded-xl text-sm text-gray-500">Create your first project from onboarding or workspace settings.</div>}
                {projects.map((project) => (
                  <Link to={`/project/${project._id || project.id}/board`} key={project._id || project.id} className="surface p-5 rounded-xl cursor-pointer group card-interactive">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: project.color }}>{project.name.charAt(0)}</div>
                        <div><h3 className="font-bold group-hover:text-primary transition-colors">{project.name}</h3><p className="text-xs text-gray-500">{project.tasksCount || 0} tasks active</p></div>
                      </div>
                      <Settings size={18} className="text-gray-500" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <section className="surface p-6 rounded-2xl h-fit sticky top-24 card-interactive">
            <h2 className="text-lg font-bold mb-6">Recent Activity</h2>
            <div className="space-y-6">
              {activities.length === 0 && <p className="text-sm text-gray-500">No activity yet.</p>}
              {activities.map((activity) => (
                <div key={activity._id || activity.id} className="flex gap-3 relative">
                  <Avatar src={activity.userId?.avatar} name={activity.userId?.name} size="sm" />
                  <div className="flex-1"><p className="text-xs leading-relaxed"><span className="font-bold">{activity.userId?.name || "Someone"}</span> {activity.action.replace(".", " ")}</p><p className="text-[10px] text-gray-500 mt-1">{timeAgo(activity.createdAt)}</p></div>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-8 py-2 text-xs" onClick={handleViewFeed}>View Full Feed <ArrowRight size={14} /></Button>
          </section>
        </div>
      </div>
    </PageShell>
  );
};

export default Dashboard;
