import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Button } from "../../components/ui";
import { useWorkspace } from "../../context/useWorkspace";

const ProjectsPage = () => {
  const { projects } = useWorkspace();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("query") || "").toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return projects;
    return projects.filter((project) => project.name.toLowerCase().includes(query));
  }, [projects, query]);

  return (
    <PageShell breadcrumbs={["All Projects"]}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">All Projects</h1>
            <p className="text-gray-500">Browse and jump into any workspace project.</p>
          </div>
          <Link to="/projects/new">
            <Button className="gap-2">New Project</Button>
          </Link>
        </div>

        {filtered.length === 0 && (
          <div className="surface p-6 rounded-xl text-sm text-gray-500">
            No projects match your search.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((project) => (
            <div key={project._id || project.id} className="surface p-5 rounded-xl card-interactive">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: project.color }}>{project.name.charAt(0)}</div>
                <div>
                  <p className="font-bold">{project.name}</p>
                  <p className="text-xs text-gray-500">{project.tasksCount || 0} tasks</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link to={`/project/${project._id || project.id}/board`} className="px-3 py-1 rounded-full border border-dark-border hover:border-primary">Board</Link>
                <Link to={`/project/${project._id || project.id}/snippets`} className="px-3 py-1 rounded-full border border-dark-border hover:border-primary">Snippets</Link>
                <Link to={`/project/${project._id || project.id}/wiki`} className="px-3 py-1 rounded-full border border-dark-border hover:border-primary">Wiki</Link>
                <Link to={`/project/${project._id || project.id}/activity`} className="px-3 py-1 rounded-full border border-dark-border hover:border-primary">Activity</Link>
                <Link to={`/project/${project._id || project.id}/ai`} className="px-3 py-1 rounded-full border border-dark-border hover:border-primary">AI</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default ProjectsPage;
