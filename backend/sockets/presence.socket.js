const viewersByProject = new Map();

const listViewers = (projectId) => Array.from(viewersByProject.get(projectId)?.values() || []);

const removeSocket = (socketId) => {
  for (const [projectId, viewers] of viewersByProject.entries()) {
    if (viewers.delete(socketId)) {
      if (viewers.size === 0) viewersByProject.delete(projectId);
      return projectId;
    }
  }
  return null;
};

const registerPresenceSocket = (io) => {
  const namespace = io.of('/presence');
  namespace.on('connection', (socket) => {
    socket.on('join_board', ({ userId, projectId, userName, avatar }) => {
      if (!userId || !projectId) return;
      socket.join(`project:${projectId}`);
      if (!viewersByProject.has(projectId)) viewersByProject.set(projectId, new Map());
      viewersByProject.get(projectId).set(socket.id, { socketId: socket.id, userId, userName, avatar });
      namespace.to(`project:${projectId}`).emit('presence:update', listViewers(projectId));
    });
    socket.on('disconnect', () => {
      const projectId = removeSocket(socket.id);
      if (projectId) namespace.to(`project:${projectId}`).emit('presence:update', listViewers(projectId));
    });
  });
};

export default registerPresenceSocket;
