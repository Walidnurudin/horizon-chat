"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        login(data.access_token, data.user);
        router.push("/");
      } else {
        alert("Registration failed. Username may be taken.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 mb-2">Horizon Chat</h1>
          <p className="text-emerald-500 font-medium">Connect to Horizon</p>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Create a new account</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Username</label>
            <input
              className="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Password</label>
            <input
              type="password"
              className="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition-colors"
          >
            Register
          </button>
        </form>
        <p className="text-gray-400 mt-6 text-center">
          Already have an account? <Link href="/login" className="text-blue-500 hover:text-blue-400 transition-colors">Login</Link>
        </p>
      </div>
    </div>
  );
}
