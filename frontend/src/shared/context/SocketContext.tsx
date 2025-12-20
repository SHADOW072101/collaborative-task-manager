import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectSocket: () => {},
  disconnectSocket: () => {},
});

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No token found for socket connection');
      return;
    }

    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
    }

    console.log('🔌 Attempting to connect socket with token');
    
    const socketInstance = io('http://https://collaborative-task-manager-sable.vercel.app', {
      auth: { 
        token,
        userId: JSON.parse(localStorage.getItem('user') || '{}')?.id 
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      forceNew: true,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected. Reason:', reason);
      setIsConnected(false);
      
      // Auto-reconnect unless manually disconnected
      if (reason === 'io server disconnect' || reason === 'transport close') {
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          socketInstance.connect();
        }, 1000);
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error.message);
      setIsConnected(false);
    });

    socketInstance.on('authenticated', () => {
      console.log('🔐 Socket authenticated successfully');
    });

    socketInstance.on('unauthorized', (error: any) => {
      console.error('🔐 Socket authentication failed:', error.message);
      setIsConnected(false);
    });

    // Listen for task-related events
    socketInstance.on('task:created', (task) => {
      console.log('📝 New task created via socket:', task);
      // You can dispatch this to your state management
    });

    socketInstance.on('task:updated', (task) => {
      console.log('📝 Task updated via socket:', task);
    });

    socketInstance.on('task:deleted', (taskId) => {
      console.log('🗑️ Task deleted via socket:', taskId);
    });

    setSocket(socketInstance);
  };

  const disconnectSocket = () => {
    if (socket) {
      console.log('👋 Manually disconnecting socket');
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  // Connect on mount and when token changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      console.log('🔑 Token found, connecting socket...');
      connectSocket();
    } else {
      console.log('🔑 No token found, disconnecting socket...');
      disconnectSocket();
    }

    return () => {
      // Cleanup on unmount
      if (socket) {
        console.log('🧹 Cleaning up socket on unmount');
        socket.disconnect();
      }
    };
  }, [localStorage.getItem('token')]); // Re-run when token changes

  // Listen for storage events (for multiple tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          console.log('🔄 Token changed in another tab, reconnecting socket...');
          connectSocket();
        } else {
          console.log('🔄 Token removed in another tab, disconnecting socket...');
          disconnectSocket();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      connectSocket, 
      disconnectSocket 
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);