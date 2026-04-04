"use client"
import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:3001/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => setUsers(data))
    .catch(err => console.error(err));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b141a] p-4">
      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-md overflow-hidden">
        <div className="bg-emerald-600 p-4 text-white">
           <h2 className="text-xl font-bold">Select User to Chat</h2>
        </div>
        <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
          {users.map(u => (
            <Link 
              key={u.id}
              href={`/chat/${u.id}`}
              className="block bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-4 rounded-lg transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">{u.username}</div>
            </Link>
          ))}
          {users.length === 0 && (
             <p className="text-gray-500 italic p-4 text-center">No other users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
