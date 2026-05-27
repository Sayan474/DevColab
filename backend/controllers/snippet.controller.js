import Snippet from '../models/Snippet.js';
import Project from '../models/Project.js';
import asyncHandler from '../utils/asyncHandler.js';
import { fail, ok, message } from '../utils/http.js';
import logActivity from '../utils/logActivity.js';

export const createSnippet = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.body.projectId);
  if (!project) return fail(res, 'Project not found', 404);
  const snippet = await Snippet.create({ ...req.body, createdBy: req.user.id });
  await logActivity({ userId: req.user.id, workspaceId: project.workspaceId, projectId: project._id, action: 'snippet.created', entityType: 'snippet', entityId: snippet._id, entityName: snippet.title });
  return ok(res, { snippet }, 201);
});

export const listSnippets = asyncHandler(async (req, res) => {
  const filter = { projectId: req.params.projectId };
  if (req.query.tag) filter.tags = req.query.tag;
  if (req.query.search) {
    const query = new RegExp(req.query.search, 'i');
    filter.$or = [{ title: query }, { description: query }, { code: query }, { tags: query }];
  }
  const snippets = await Snippet.find(filter).sort({ createdAt: -1 }).populate('createdBy', 'name avatar email');
  return ok(res, { snippets });
});

export const getSnippet = asyncHandler(async (req, res) => {
  const snippet = await Snippet.findById(req.params.snippetId).populate('createdBy', 'name avatar email');
  if (!snippet) return fail(res, 'Snippet not found', 404);
  return ok(res, { snippet });
});

export const updateSnippet = asyncHandler(async (req, res) => {
  const snippet = await Snippet.findByIdAndUpdate(req.params.snippetId, req.body, { new: true });
  if (!snippet) return fail(res, 'Snippet not found', 404);
  const project = await Project.findById(snippet.projectId);
  await logActivity({ userId: req.user.id, workspaceId: project.workspaceId, projectId: project._id, action: 'snippet.updated', entityType: 'snippet', entityId: snippet._id, entityName: snippet.title });
  return ok(res, { snippet });
});

export const deleteSnippet = asyncHandler(async (req, res) => {
  const snippet = await Snippet.findByIdAndDelete(req.params.snippetId);
  if (!snippet) return fail(res, 'Snippet not found', 404);
  const project = await Project.findById(snippet.projectId);
  await logActivity({ userId: req.user.id, workspaceId: project.workspaceId, projectId: project._id, action: 'snippet.deleted', entityType: 'snippet', entityId: snippet._id, entityName: snippet.title });
  return message(res, 'Snippet deleted');
});
