import registerBoardSocket from './board.socket.js';
import registerPresenceSocket from './presence.socket.js';
import registerNotificationSocket from './notification.socket.js';

const registerSockets = (io) => {
  registerBoardSocket(io);
  registerPresenceSocket(io);
  registerNotificationSocket(io);
};

export default registerSockets;
