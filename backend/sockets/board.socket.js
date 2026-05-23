const registerBoardSocket = (io) => {
  const namespace = io.of('/board');
  namespace.on('connection', (socket) => {
    socket.on('join_board', ({ projectId }) => {
      if (projectId) socket.join(`project:${projectId}`);
    });
    socket.on('leave_board', ({ projectId }) => {
      if (projectId) socket.leave(`project:${projectId}`);
    });
    ['task:created', 'task:moved', 'task:updated', 'task:deleted', 'task:comment'].forEach((event) => {
      socket.on(event, (payload = {}) => {
        const projectId = payload.projectId || payload.task?.projectId;
        if (projectId) socket.to(`project:${projectId}`).emit(event, payload);
      });
    });
  });
};

export default registerBoardSocket;
