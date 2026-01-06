'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Code, Filter, X } from 'lucide-react';

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companies: string[];
}

export default function Lobby() {
  const [roomId, setRoomId] = useState('');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchCompanies();
    fetchProblems();
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/problems/companies/list`);
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const url = selectedCompany
        ? `${serverUrl}/api/problems?company=${encodeURIComponent(selectedCompany)}`
        : `${serverUrl}/api/problems`;
      const response = await fetch(url);
      const data = await response.json();
      setProblems(data);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId.trim()}`);
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10);
    router.push(`/room/${newRoomId}`);
  };

  const handleProblemClick = (slug: string) => {
    const newRoomId = Math.random().toString(36).substring(2, 10);
    router.push(`/room/${newRoomId}?problem=${slug}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            InterviewSync Pro
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Collaborative Mock Interview Platform
          </p>
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-4">
          {/* Left Sidebar - Room Creation & Filters */}
          <div className="lg:col-span-1">
            <div className="space-y-6 rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
              {/* Room Join/Create */}
              <div>
                <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                  Quick Start
                </h2>
                <form onSubmit={handleJoinRoom} className="space-y-4">
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
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <LogIn className="h-4 w-4" />
                    Join Room
                  </button>
                </form>
                <button
                  onClick={handleCreateRoom}
                  className="mt-2 w-full rounded-lg border-2 border-blue-600 bg-transparent px-4 py-2 font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-slate-700"
                >
                  Create New Room
                </button>
              </div>

              {/* Company Filter */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Filter by Company
                  </h2>
                  {selectedCompany && (
                    <button
                      onClick={() => setSelectedCompany('')}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content - Problems List */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Problems
                  {selectedCompany && (
                    <span className="ml-2 text-lg font-normal text-slate-600 dark:text-slate-400">
                      - {selectedCompany}
                    </span>
                  )}
                </h2>
                {selectedCompany && (
                  <button
                    onClick={() => setSelectedCompany('')}
                    className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  >
                    <X className="h-4 w-4" />
                    Clear Filter
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-slate-500 dark:text-slate-400">Loading problems...</div>
                </div>
              ) : problems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Code className="mb-4 h-12 w-12 text-slate-400" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No problems found{selectedCompany ? ` for ${selectedCompany}` : ''}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {problems.map((problem) => (
                    <button
                      key={problem._id}
                      onClick={() => handleProblemClick(problem.slug)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-700 dark:hover:border-blue-600 dark:hover:bg-slate-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {problem.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getDifficultyColor(
                                problem.difficulty
                              )}`}
                            >
                              {problem.difficulty}
                            </span>
                            {problem.companies && problem.companies.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {problem.companies.slice(0, 3).map((company) => (
                                  <span
                                    key={company}
                                    className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  >
                                    {company}
                                  </span>
                                ))}
                                {problem.companies.length > 3 && (
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    +{problem.companies.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <Code className="ml-4 h-5 w-5 text-slate-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
