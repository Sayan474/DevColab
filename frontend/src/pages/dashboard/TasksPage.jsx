import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Badge } from "../../components/ui";
import { useAuth } from "../../context/useAuth";
import { useWorkspace } from "../../context/useWorkspace";
import api, { unwrap } from "../../lib/api";
import { formatDate, taskAssigneeId } from "../../lib/format";

const TasksPage = () => {
  const { user } = useAuth();
  const { currentWorkspace, projects, fetchProjects } = useWorkspace();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (currentWorkspace) fetchProjects(currentWorkspace._id || currentWorkspace.id);
  }, [currentWorkspace, fetchProjects]);

  useEffect(() => {
    const load = async () => {
      if (!currentWorkspace) return;
      const taskLists = await Promise.all(
        projects.map((project) => api.get(`/tasks/project/${project._id || project.id}`))
      );
      setTasks(taskLists.flatMap((response) => unwrap(response).tasks || []));
    };
    load().catch(() => {});
  }, [currentWorkspace, projects]);

  const myTasks = useMemo(() => {
    const userId = user?._id || user?.id;
    return tasks.filter((task) => taskAssigneeId(task)?.toString() === userId);
  }, [tasks, user]);

  const pending = myTasks.filter((task) => task.status !== "done");

  return (
    <PageShell breadcrumbs={["My Tasks"]}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Tasks</h1>
            <p className="text-gray-500">Everything assigned to you across projects.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Pending</span>
            <Badge variant="primary">{pending.length}</Badge>
          </div>
        </div>

        <div className="space-y-3">
          {myTasks.length === 0 && (
            <div className="surface p-6 rounded-xl text-sm text-gray-500">
              You have no assigned tasks yet.
            </div>
          )}
          {myTasks.map((task) => (
            <Link
              key={task._id || task.id}
              to={`/project/${task.projectId?._id || task.projectId}/board`}
              className="surface p-4 rounded-xl flex items-center justify-between hover:border-dark-border card-interactive"
            >
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="text-xs text-gray-500 mt-1">{task.status}</p>
              </div>
              <span className="text-xs text-gray-500">Due {formatDate(task.dueDate)}</span>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default TasksPage;
