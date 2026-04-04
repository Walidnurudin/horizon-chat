import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, ServerToClientEvents, ClientToServerEvents } from '@messaging/types';

export const useSocket = (url: string, token: string | null) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!token) return;

    const socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> = io(url, {
      transports: ['websocket'],
      auth: { token }
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      // Ask for history when connected
      socketInstance.emit('requestHistory', {});
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('messageHistory', (msgs) => {
      setMessages(msgs);
    });

    socketInstance.on('receiveMessage', (msg) => {
      setMessages((prev) => {
        if (prev.find(m => m.id === msg.id)) return prev;
        const newArray = [...prev, msg].sort((a, b) => a.timestamp - b.timestamp);
        return newArray;
      });
    });

    socketInstance.on('heartbeatAck', () => {
      console.log('Heartbeat acknowledged by server');
    });

    const heartbeatInterval = setInterval(() => {
      if (socketInstance.connected) {
        socketInstance.emit('heartbeat');
      }
    }, 10000);

    return () => {
      clearInterval(heartbeatInterval);
      socketInstance.disconnect();
    };
  }, [url, token]);

  const sendMessage = useCallback((content: string, senderId: string, receiverId?: string) => {
    if (!socket) return;

    // Optimistic UI update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      senderId,
      receiverId,
      timestamp: Date.now(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Send to server
    socket.emit('sendMessage', { content, senderId, receiverId: receiverId || undefined }, (res) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id ? res.message : msg
        )
      );
    });
  }, [socket]);

  return { isConnected, messages, sendMessage, setMessages };
};

