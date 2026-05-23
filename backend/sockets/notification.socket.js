export const emitNotification = (io, userId, notifObject) => {
  io.of('/notifications').to(`user:${userId}`).emit('notification:new', notifObject);
};

const registerNotificationSocket = (io) => {
  const namespace = io.of('/notifications');
  namespace.on('connection', (socket) => {
    socket.on('subscribe', ({ userId }) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });
};

export default registerNotificationSocket;
