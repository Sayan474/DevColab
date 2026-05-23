import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { emitToProject } from '../config/socket.js';
import { createNotification } from '../utils/notifications.js';
import logActivity from '../utils/logActivity.js';
import { fail, ok, message } from '../utils/http.js';

const populateTask = (query) => query
  .populate('assigneeId', 'name avatar email')
  .populate('createdBy', 'name avatar email')
  .populate('comments.author', 'name avatar email')
  .populate('comments.mentions', 'name avatar email');

const groupTasks = (tasks) => tasks.reduce((acc, task) => {
  acc[task.status] = acc[task.status] || [];
  acc[task.status].push(task);
  return acc;
}, { todo: [], in_progress: [], in_review: [], done: [] });

export const createTask = asyncHandler(async (req, res) => {
  const { title, projectId } = req.body;
  if (!title || !projectId) return fail(res, 'title and projectId are required', 422);
  const project = await Project.findById(projectId);
  if (!project) return fail(res, 'Project not found', 404);
  const task = await Task.create({
    title,
    description: req.body.description || '',
    status: req.body.status || 'todo',
    priority: req.body.priority || 'P1',
    assigneeId: req.body.assigneeId || undefined,
    projectId,
    workspaceId: project.workspaceId,
    labels: req.body.labels || [],
    dueDate: req.body.dueDate || undefined,
    position: req.body.position || 0,
    createdBy: req.user.id,
  });
  const populated = await populateTask(Task.findById(task._id));
  await logActivity({ userId: req.user.id, workspaceId: project.workspaceId, projectId, action: 'task.created', entityType: 'task', entityId: task._id, entityName: task.title });
  if (task.assigneeId?.toString() !== req.user.id) {
    await createNotification({ userId: task.assigneeId, senderId: req.user.id, type: 'assignment', message: `You were assigned to ${task.title}`, link: `/project/${projectId}/board` });
  }
  emitToProject(projectId, 'task:created', populated);
  return ok(res, { task: populated }, 201);
});

export const listProjectTasks = asyncHandler(async (req, res) => {
  const tasks = await populateTask(Task.find({ projectId: req.params.projectId }).sort({ status: 1, position: 1, createdAt: -1 }));
  return ok(res, req.query.grouped === 'true' ? { tasks: groupTasks(tasks) } : { tasks });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await populateTask(Task.findById(req.params.taskId));
  if (!task) return fail(res, 'Task not found', 404);
  return ok(res, { task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return fail(res, 'Task not found', 404);
  const previousStatus = task.status;
  const previousAssignee = task.assigneeId?.toString();
  ['title', 'description', 'status', 'priority', 'assigneeId', 'labels', 'dueDate', 'position'].forEach((key) => {
    if (req.body[key] !== undefined) task[key] = req.body[key];
  });
  await task.save();
  const populated = await populateTask(Task.findById(task._id));
  await logActivity({ userId: req.user.id, workspaceId: task.workspaceId, projectId: task.projectId, action: previousStatus !== task.status ? 'task.moved' : 'task.updated', entityType: 'task', entityId: task._id, entityName: task.title, metadata: { from: previousStatus, to: task.status } });
  if (task.assigneeId && task.assigneeId.toString() !== previousAssignee && task.assigneeId.toString() !== req.user.id) {
    await createNotification({ userId: task.assigneeId, senderId: req.user.id, type: 'assignment', message: `You were assigned to ${task.title}`, link: `/project/${task.projectId}/board` });
  }
  emitToProject(task.projectId, previousStatus !== task.status ? 'task:moved' : 'task:updated', previousStatus !== task.status ? { taskId: task._id, from: previousStatus, to: task.status, position: task.position, movedBy: req.user.id, task: populated } : populated);
  return ok(res, { task: populated });
});

export const moveTask = asyncHandler(async (req, res) => {
  const { status, position = 0 } = req.body;
  if (!['todo', 'in_progress', 'in_review', 'done'].includes(status)) return fail(res, 'Invalid status', 422);
  const task = await Task.findById(req.params.taskId);
  if (!task) return fail(res, 'Task not found', 404);
  const from = task.status;
  task.status = status;
  task.position = position;
  await task.save();
  const populated = await populateTask(Task.findById(task._id));
  await logActivity({ userId: req.user.id, workspaceId: task.workspaceId, projectId: task.projectId, action: 'task.moved', entityType: 'task', entityId: task._id, entityName: task.title, metadata: { from, to: status, position } });
  emitToProject(task.projectId, 'task:moved', { taskId: task._id, from, to: status, position, movedBy: req.user.id, task: populated });
  return ok(res, { task: populated });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.taskId);
  if (!task) return fail(res, 'Task not found', 404);
  await logActivity({ userId: req.user.id, workspaceId: task.workspaceId, projectId: task.projectId, action: 'task.deleted', entityType: 'task', entityId: task._id, entityName: task.title });
  emitToProject(task.projectId, 'task:deleted', { taskId: task._id, projectId: task.projectId });
  return message(res, 'Task deleted');
});

export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return fail(res, 'Comment text is required', 422);
  const task = await Task.findById(req.params.taskId);
  if (!task) return fail(res, 'Task not found', 404);
  const usernames = [...text.matchAll(/@([\w.\- ]+)/g)].map((match) => match[1].trim());
  const mentionedUsers = usernames.length ? await User.find({ name: { $in: usernames.map((name) => new RegExp(`^${name}$`, 'i')) } }).select('_id name') : [];
  const comment = { author: req.user.id, text, mentions: mentionedUsers.map((user) => user._id) };
  task.comments.push(comment);
  await task.save();
  const saved = task.comments[task.comments.length - 1];
  for (const user of mentionedUsers) {
    if (user._id.toString() !== req.user.id) {
      await createNotification({ userId: user._id, senderId: req.user.id, type: 'mention', message: `${req.user.name} mentioned you on ${task.title}`, link: `/project/${task.projectId}/board` });
    }
  }
  await logActivity({ userId: req.user.id, workspaceId: task.workspaceId, projectId: task.projectId, action: 'comment.added', entityType: 'task', entityId: task._id, entityName: task.title });
  emitToProject(task.projectId, 'task:comment', { taskId: task._id, projectId: task.projectId, comment: saved });
  return ok(res, { comment: saved }, 201);
});

export const addAttachment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return fail(res, 'Task not found', 404);
  if (!req.file) return fail(res, 'File is required', 422);
  const attachment = { filename: req.file.originalname, url: `/uploads/${req.file.filename}`, uploadedBy: req.user.id };
  task.attachments.push(attachment);
  await task.save();
  await logActivity({ userId: req.user.id, workspaceId: task.workspaceId, projectId: task.projectId, action: 'task.attachment_added', entityType: 'task', entityId: task._id, entityName: task.title });
  return ok(res, { attachment: task.attachments[task.attachments.length - 1] }, 201);
});
