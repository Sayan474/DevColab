import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const withAuth = () => ({
  autoConnect: false,
  auth: { token: localStorage.getItem('devcollab_token') },
});

export const boardSocket = io(`${SOCKET_URL}/board`, withAuth());
export const presenceSocket = io(`${SOCKET_URL}/presence`, withAuth());
export const notifSocket = io(`${SOCKET_URL}/notifications`, withAuth());

export const refreshSocketAuth = () => {
  const token = localStorage.getItem('devcollab_token');
  [boardSocket, presenceSocket, notifSocket].forEach((socket) => {
    socket.auth = { token };
  });
};

export const disconnectSockets = () => {
  [boardSocket, presenceSocket, notifSocket].forEach((socket) => socket.disconnect());
};
