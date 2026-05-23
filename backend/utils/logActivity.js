import ActivityLog from '../models/ActivityLog.js';
import { getIO } from '../config/socket.js';

const logActivity = async ({ userId, workspaceId, projectId, action, entityType, entityId, entityName, metadata = {} }) => {
  const activity = await ActivityLog.create({ userId, workspaceId, projectId, action, entityType, entityId, entityName, metadata });
  const populated = await activity.populate('userId', 'name avatar email');
  const io = getIO();
  io?.to(`workspace:${workspaceId}`).emit('activity:new', populated);
  if (projectId) io?.of('/board').to(`project:${projectId}`).emit('activity:new', populated);
  return populated;
};

export default logActivity;
