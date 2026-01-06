'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

export default function Lobby() {
  const [roomId, setRoomId] = useState('');
  const router = useRouter();

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId.trim()}`);
    }
  };

  const handleCreateRoom = () => {
    // Generate a random room ID
    const newRoomId = Math.random().toString(36).substring(2, 10);
    router.push(`/room/${newRoomId}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            InterviewSync Pro
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Collaborative Mock Interview Platform
          </p>
        </div>

        <form onSubmit={handleJoinRoom} className="space-y-6">
          <div>
            <label
              htmlFor="roomId"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Room ID
            </label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <LogIn className="h-5 w-5" />
            Join Room
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              OR
            </span>
          </div>
        </div>

        <button
          onClick={handleCreateRoom}
          className="w-full rounded-lg border-2 border-blue-600 bg-transparent px-4 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-slate-700"
        >
          Create New Room
        </button>
      </div>
    </div>
  );
}
