import Workspace from '../models/Workspace.js';
import Project from '../models/Project.js';

const rank = { viewer: 1, member: 2, admin: 3, owner: 4 };

export const getWorkspaceRole = async (userId, workspaceId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return null;
  const member = workspace.members.find((item) => item.userId.toString() === userId.toString());
  return member?.role || null;
};

export const resolveWorkspaceId = async (req) => {
  if (req.params.workspaceId || req.body.workspaceId) return req.params.workspaceId || req.body.workspaceId;
  const projectId = req.params.projectId || req.body.projectId;
  if (projectId) {
    const project = await Project.findById(projectId).select('workspaceId');
    return project?.workspaceId;
  }
  return null;
};

export const requireRole = (minRole) => async (req, res, next) => {
  try {
    const workspaceId = await resolveWorkspaceId(req);
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspaceId or projectId is required' });
    const role = await getWorkspaceRole(req.user.id, workspaceId);
    if (!role || rank[role] < rank[minRole]) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    req.workspaceRole = role;
    req.workspaceId = workspaceId.toString();
    next();
  } catch (error) {
    next(error);
  }
};

export default requireRole;
