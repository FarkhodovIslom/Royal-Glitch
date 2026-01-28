import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;
let connectionPromise: Promise<Socket> | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket(): Promise<Socket> {
  const socket = getSocket();

  if (socket.connected) {
    return Promise.resolve(socket);
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = new Promise((resolve, reject) => {
    socket.connect();

    const onConnect = () => {
      console.log('🔌 Connected to server');
      cleanup();
      resolve(socket);
    };

    const onError = (error: any) => {
      console.error('❌ Connection error:', error);
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onError);
      connectionPromise = null;
    };

    socket.on('connect', onConnect);
    socket.on('connect_error', onError);
  });

  return connectionPromise;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    connectionPromise = null;
  }
}
