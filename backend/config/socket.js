let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;

export const emitToProject = (projectId, event, payload) => {
  ioInstance?.of('/board').to(`project:${projectId}`).emit(event, payload);
};

export const emitToWorkspace = (workspaceId, event, payload) => {
  ioInstance?.to(`workspace:${workspaceId}`).emit(event, payload);
};

export const emitToUser = (userId, event, payload) => {
  ioInstance?.of('/notifications').to(`user:${userId}`).emit(event, payload);
};
