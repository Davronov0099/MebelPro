import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string) || 'http://localhost:5000';

let socket: Socket | null = null;

const joinRooms = (sock: Socket, userRole: string) => {
  if (userRole === 'admin' || userRole === 'kassir') {
    sock.emit('join-room', 'cashier-service');
  }
  if (userRole === 'admin') {
    sock.emit('join-room', 'admin-sales');
  }
  if (userRole === 'kassir') {
    sock.emit('join-room', 'kassir-sales');
  }
};

export const initializeSocket = (userRole: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  // Disconnect stale socket before creating new one
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    joinRooms(socket!, userRole);
  });

  // Re-join rooms after reconnect
  socket.on('reconnect', () => {
    joinRooms(socket!, userRole);
  });

  socket.on('disconnect', (_reason) => {
    // Socket disconnected — reconnection handled automatically
  });

  socket.on('connect_error', (_error) => {
    // Connection failed — will retry per reconnectionAttempts
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
