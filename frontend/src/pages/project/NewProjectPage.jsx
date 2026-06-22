import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Button, Input } from "../../components/ui";
import { useWorkspace } from "../../context/useWorkspace";

const NewProjectPage = () => {
  const { createProject } = useWorkspace();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#7C3AED");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const project = await createProject({ name: name.trim(), description: description.trim(), color });
      navigate(`/project/${project._id || project.id}/board`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell breadcrumbs={["New Project"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create a new project</h1>
          <p className="text-gray-500">Set the basics and start collaborating.</p>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="surface p-6 rounded-2xl space-y-5">
          <Input
            label="Project Name"
            placeholder="DevColab Mobile"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Description</label>
            <textarea
              className="input-field min-h-[120px] resize-none"
              placeholder="Share what this project is about..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Project Color</label>
            <input
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-10 w-16 rounded-md border border-dark-border bg-transparent"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={!name.trim() || submitting}>
              {submitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

export default NewProjectPage;
