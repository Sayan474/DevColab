import Workspace from '../models/Workspace.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Snippet from '../models/Snippet.js';
import WikiPage from '../models/WikiPage.js';
import asyncHandler from '../utils/asyncHandler.js';
import { fail, ok, message } from '../utils/http.js';
import logActivity from '../utils/logActivity.js';

export const createProject = asyncHandler(async (req, res) => {
  const { name, description = '', color = '#7C3AED', workspaceId } = req.body;
  if (!name || !workspaceId) return fail(res, 'name and workspaceId are required', 422);
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return fail(res, 'Workspace not found', 404);
  const projectCount = await Project.countDocuments({ workspaceId, isArchived: false });
  if (workspace.plan === 'free' && projectCount >= 3) return fail(res, 'Free plan allows three projects per workspace', 403, { upgrade: true });
  const project = await Project.create({
    name,
    description,
    color,
    workspaceId,
    createdBy: req.user.id,
    members: workspace.members.map((member) => ({ userId: member.userId, role: member.role === 'owner' ? 'admin' : member.role })),
  });
  await logActivity({ userId: req.user.id, workspaceId, projectId: project._id, action: 'project.created', entityType: 'project', entityId: project._id, entityName: project.name });
  return ok(res, { project }, 201);
});

export const listProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ workspaceId: req.params.workspaceId, isArchived: false }).populate('members.userId', 'name avatar email');
  const ids = projects.map((p) => p._id);
  const counts = await Task.aggregate([{ $match: { projectId: { $in: ids } } }, { $group: { _id: '$projectId', tasksCount: { $sum: 1 } } }]);
  const byProject = new Map(counts.map((item) => [item._id.toString(), item.tasksCount]));
  return ok(res, { projects: projects.map((project) => ({ ...project.toJSON(), tasksCount: byProject.get(project._id.toString()) || 0 })) });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId).populate('members.userId', 'name avatar email role');
  if (!project) return fail(res, 'Project not found', 404);
  return ok(res, { project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const update = {};
  ['name', 'description', 'color', 'isArchived'].forEach((key) => { if (req.body[key] !== undefined) update[key] = req.body[key]; });
  const project = await Project.findByIdAndUpdate(req.params.projectId, update, { new: true });
  if (!project) return fail(res, 'Project not found', 404);
  await logActivity({ userId: req.user.id, workspaceId: project.workspaceId, projectId: project._id, action: 'project.updated', entityType: 'project', entityId: project._id, entityName: project.name });
  return ok(res, { project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return fail(res, 'Project not found', 404);
  await Promise.all([
    Task.deleteMany({ projectId: project._id }),
    Snippet.deleteMany({ projectId: project._id }),
    WikiPage.deleteMany({ projectId: project._id }),
    Project.findByIdAndDelete(project._id),
  ]);
  await logActivity({ userId: req.user.id, workspaceId: project.workspaceId, projectId: project._id, action: 'project.deleted', entityType: 'project', entityId: project._id, entityName: project.name });
  return message(res, 'Project deleted');
});
