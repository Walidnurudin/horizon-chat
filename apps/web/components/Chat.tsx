"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Send, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Chat({ receiverId }: { receiverId?: string }) {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const { messages, sendMessage, isConnected } = useSocket(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', token);
  const [inputVal, setInputVal] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !user) return;
    sendMessage(inputVal.trim(), user.id, receiverId);
    setInputVal('');
  };

  if (!user) return <div className="p-8 text-center text-white">Loading...</div>;

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-xl">
      <div className="bg-emerald-600 p-4 text-white flex justify-between items-center z-10 shadow-sm relative">
        <div className="flex flex-row items-center gap-3">
          {receiverId && (
            <Link href="/users" className="hover:bg-emerald-700 p-1 rounded-full text-white transition-colors">
               <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div>
            <h2 className="font-semibold text-lg">{receiverId ? 'Horizon Private' : 'Horizon Global'}</h2>
            <div className="flex items-center text-xs text-emerald-100 mt-1">
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              {isConnected ? 'Connected' : 'Reconnecting...'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {!receiverId && (
            <Link href="/users" className="hover:text-emerald-100 underline text-xs font-semibold">
              Direct Messages
            </Link>
          )}
          <span className="opacity-80 hidden sm:inline">{user.username}</span>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-opacity-50">
        <div className="flex flex-col space-y-3">
          {messages.map((msg) => {
            const isMe = msg.senderId === user.id;
            return (
              <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                <div 
                  className={`px-3 py-2 rounded-lg shadow-sm ${
                    isMe 
                      ? 'bg-emerald-100 dark:bg-emerald-800 rounded-tr-none text-gray-800 dark:text-emerald-50' 
                      : 'bg-white dark:bg-gray-800 rounded-tl-none border dark:border-gray-700'
                  }`}
                >
                  {!isMe && <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">{msg.senderId}</div>}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</div>
                  
                  <div className="flex justify-end items-center mt-1 space-x-1 opacity-70">
                    <span className="text-[10px]">
                      {format(new Date(msg.timestamp), 'HH:mm')}
                    </span>
                    {isMe && (
                      <span className="text-[10px]">
                        {msg.status === 'sending' && <Clock className="w-3 h-3 text-gray-500" />}
                        {msg.status === 'sent' && <span className="text-gray-500">✓</span>}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="p-3 bg-gray-100 dark:bg-gray-800 flex items-center space-x-2">
        <form onSubmit={handleSubmit} className="flex-1 flex space-x-2">
          <input 
            type="text"
            className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            placeholder="Type a message..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!inputVal.trim() || !isConnected}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
