import ActivityLog from '../models/ActivityLog.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/http.js';

export const getWorkspaceActivity = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const filter = { workspaceId: req.params.workspaceId };
  if (req.query.projectId) filter.projectId = req.query.projectId;
  if (req.query.userId) filter.userId = req.query.userId;
  const [activities, total] = await Promise.all([
    ActivityLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('userId', 'name avatar email'),
    ActivityLog.countDocuments(filter),
  ]);
  return ok(res, { activities, page, limit, total });
});
