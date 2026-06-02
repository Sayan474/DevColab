import { io } from 'socket.io-client';
import { getSocketToken } from './api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Socket.IO cannot use httpOnly cookies — it needs the token explicitly
// We use a separate socketToken stored in localStorage just for this purpose
const withAuth = () => ({
  autoConnect: false,
  withCredentials: true, // still send cookies for any cookie-based checks
  auth: { token: getSocketToken() }, // but also send token explicitly for Socket.IO auth
});

export const boardSocket = io(`${SOCKET_URL}/board`, withAuth());
export const presenceSocket = io(`${SOCKET_URL}/presence`, withAuth());
export const notifSocket = io(`${SOCKET_URL}/notifications`, withAuth());

export const refreshSocketAuth = () => {
  const token = getSocketToken();
  [boardSocket, presenceSocket, notifSocket].forEach((socket) => {
    socket.auth = { token };
    // If socket is already connected, reconnect with new token
    if (socket.connected) {
      socket.disconnect().connect();
    }
  });
};

export const disconnectSockets = () => {
  [boardSocket, presenceSocket, notifSocket].forEach((socket) => socket.disconnect());
};