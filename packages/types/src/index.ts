export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId?: string; // added for DMs
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface User {
  id: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ServerToClientEvents {
  receiveMessage: (msg: Message) => void;
  messageHistory: (msgs: Message[]) => void;
  heartbeatAck: () => void;
  error: (payload: { message: string }) => void;
}

export interface ClientToServerEvents {
  sendMessage: (msg: Omit<Message, 'id' | 'timestamp' | 'status'>, callback: (res: { status: string; message: Message }) => void) => void;
  requestHistory: (payload?: { receiverId?: string }) => void;
  heartbeat: () => void;
}

