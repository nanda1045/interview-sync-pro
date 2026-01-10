'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import * as Y from 'yjs';
import { io, Socket } from 'socket.io-client';
import { ArrowLeft, Users, UserCheck, Code, Lightbulb, FileCode } from 'lucide-react';
import { Problem } from '../../../../shared/types';
import { CustomWebsocketProvider } from '../../../lib/yjs-provider';
import ThemeToggle from '../../../components/ThemeToggle';
import InterviewTimer from '../../../components/InterviewTimer';

// Dynamically import CodeEditor to prevent SSR issues
// Must be outside component to avoid hydration errors
const CodeEditor = dynamic(
  () => import('../../../components/CodeEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
        Loading editor...
      </div>
    ),
  }
);

// Dynamically import Console
const Console = dynamic(
  () => import('../../../components/Console'),
  { 
    ssr: false,
    loading: () => null,
  }
);

// Dynamically import VideoChat
const VideoChat = dynamic(
  () => import('../../../components/VideoChat'),
  { 
    ssr: false,
    loading: () => null,
  }
);

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('// Start coding here...\n');
  const [participants, setParticipants] = useState<string[]>([]);
  const [problemSlug, setProblemSlug] = useState<string | null>(null);
  
  const yDocRef = useRef<Y.Doc | null>(null);
  const yTextRef = useRef<Y.Text | null>(null);
  const yMapRef = useRef<Y.Map<any> | null>(null);
  const providerRef = useRef<CustomWebsocketProvider | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isInterviewer, setIsInterviewer] = useState(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'hints' | 'solution'>('problem');
  const [userId, setUserId] = useState<string>('');

  const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

  // Get problem slug from URL on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setProblemSlug(params.get('problem'));
    }
  }, []);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only initialize Socket.io and Yjs on the client side
    if (typeof window === 'undefined' || !isClient) return;

    // Initialize Socket.io connection using environment variable
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socket = io(socketUrl, {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setUserId(socket.id);
      // Send room join with problem slug if available
      socket.emit('join-room', {
        roomId,
        problemSlug: problemSlug || undefined,
      });
    });

    socket.on('room-joined', (data: string | { roomId: string; participants: string[] }) => {
      if (typeof data === 'string') {
        // Backward compatibility
        console.log('Joined room:', data);
      } else {
        console.log('Joined room:', data.roomId);
        setParticipants(data.participants);
      }
    });

    socket.on('participants-updated', (participantsList: string[]) => {
      setParticipants(participantsList);
    });

    socket.on('user-joined', (userId: string) => {
      console.log('User joined:', userId);
    });

    socket.on('user-left', (userId: string) => {
      console.log('User left:', userId);
    });

    // Initialize Yjs
    const yDoc = new Y.Doc();
    yDocRef.current = yDoc;

    const yText = yDoc.getText('code');
    yTextRef.current = yText;

    // Initialize shared console output map
    const yMap = yDoc.getMap('output');
    yMapRef.current = yMap;

    // Connect to Yjs WebSocket server
    const wsUrl = process.env.NEXT_PUBLIC_YJS_URL || 'ws://localhost:3001';
    const provider = new CustomWebsocketProvider(wsUrl, roomId, yDoc);

    providerRef.current = provider;

    // Load initial code from Yjs
    const initialCode = yText.toString() || '// Start coding here...\n';
    setCode(initialCode);

    return () => {
      provider.destroy();
      socket.disconnect();
      yDoc.destroy();
    };
  }, [roomId, isClient]);

  // Load problem data from database
  useEffect(() => {
    if (!isClient || !problemSlug) return;

    const loadProblem = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/problems/${problemSlug}`);
        if (response.ok) {
          const data = await response.json();
          setProblem(data);
          
          // Set starter code from problem if Yjs document is empty
          if (yTextRef.current) {
            const starterCode = data.starterCode?.typescript || data.starterCode?.javascript || '// Start coding here...\n';
            const currentCode = yTextRef.current.toString();
            
            // Only set starter code if Yjs document is empty or has default code
            if (!currentCode || currentCode.trim() === '// Start coding here...\n' || currentCode.trim() === '') {
              yTextRef.current.delete(0, currentCode.length);
              yTextRef.current.insert(0, starterCode);
              setCode(starterCode);
            }
          }
        } else {
          console.error('Failed to load problem:', response.statusText);
        }
      } catch (err) {
        console.error('Failed to load problem:', err);
      }
    };

    loadProblem();
  }, [problemSlug, isClient, serverUrl]);

  // Handle code execution
  const handleRunCode = async (code: string, language: string) => {
    if (!yMapRef.current) return;

    setIsExecuting(true);
    setIsConsoleOpen(true);

    try {
      const response = await fetch(`${serverUrl}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          source_code: code,
          stdin: '', // Can be extended to support custom input
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Add output to shared Yjs map
        const outputKey = `output_${Date.now()}`;
        yMapRef.current.set(outputKey, {
          ...result,
          timestamp: Date.now(),
        });
      } else {
        // Add error to shared map
        const errorKey = `output_${Date.now()}`;
        yMapRef.current.set(errorKey, {
          stdout: '',
          stderr: result.message || 'Execution failed',
          compile_output: '',
          message: result.error || 'Unknown error',
          status: {
            id: 6, // Runtime Error
            description: result.error || 'Runtime Error',
          },
          time: '0',
          memory: 0,
          success: false,
          timestamp: Date.now(),
        });
      }
    } catch (error: any) {
      console.error('Error executing code:', error);
      
      // Add error to shared map
      if (yMapRef.current) {
        const errorKey = `output_${Date.now()}`;
        yMapRef.current.set(errorKey, {
          stdout: '',
          stderr: error.message || 'Failed to execute code',
          compile_output: '',
          message: 'Network error or server unavailable',
          status: {
            id: 6,
            description: 'Execution Error',
          },
          time: '0',
          memory: 0,
          success: false,
          timestamp: Date.now(),
        });
      }
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Lobby
          </button>
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              Room: {roomId}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Interview Timer */}
          {socketRef.current && (
            <InterviewTimer socket={socketRef.current} roomId={roomId} initialDuration={60} />
          )}
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
          {/* Interviewer Role Toggle */}
          <button
            onClick={() => setIsInterviewer(!isInterviewer)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isInterviewer
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
            title={isInterviewer ? 'Interviewer Mode: ON' : 'Interviewer Mode: OFF'}
          >
            <UserCheck className="h-4 w-4" />
            {isInterviewer ? 'Interviewer' : 'Candidate'}
          </button>
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
          {/* Participant Count */}
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Users className="h-5 w-5" />
            <span className="text-sm">{participants.length}</span>
          </div>
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane - Problem Description with Tabs */}
        <div className="w-1/2 flex flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          {/* Tabs */}
          {problem && (
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('problem')}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'problem'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Code className="h-4 w-4" />
                Problem
              </button>
              {isInterviewer && problem.hints && problem.hints.length > 0 && (
                <button
                  onClick={() => setActiveTab('hints')}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'hints'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  <Lightbulb className="h-4 w-4" />
                  Hints
                </button>
              )}
              {isInterviewer && problem.solution && (
                <button
                  onClick={() => setActiveTab('solution')}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'solution'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  <FileCode className="h-4 w-4" />
                  Solution
                </button>
              )}
            </div>
          )}

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {problem ? (
              <div className="space-y-6">
                {activeTab === 'problem' && (
                  <>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                          {problem.title}
                        </h2>
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            problem.difficulty === 'Easy'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : problem.difficulty === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="prose prose-slate max-w-none dark:prose-invert">
                      <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                        {problem.description}
                      </p>
                    </div>

                    {(problem.examples || problem.testCases) && (problem.examples || problem.testCases)!.length > 0 && (
                      <div>
                        <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                          Examples:
                        </h3>
                        {(problem.examples || problem.testCases)!.map((example, idx) => (
                          <div
                            key={idx}
                            className="mb-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-700"
                          >
                            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                              Example {idx + 1}:
                            </p>
                            <pre className="mb-2 rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">
                              <strong>Input:</strong> {example.input}
                              {'\n'}
                              <strong>Output:</strong> {example.output}
                            </pre>
                            {example.explanation && (
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                <strong>Explanation:</strong> {example.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {problem.constraints && problem.constraints.length > 0 && (
                      <div>
                        <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                          Constraints:
                        </h3>
                        <ul className="list-disc space-y-1 pl-6 text-slate-700 dark:text-slate-300">
                          {problem.constraints.map((constraint, idx) => (
                            <li key={idx}>{constraint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'hints' && isInterviewer && problem.hints && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Hints
                    </h2>
                    {problem.hints.map((hint, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
                            Hint {idx + 1}
                          </h3>
                        </div>
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          {hint}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'solution' && isInterviewer && problem.solution && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Solution
                    </h2>
                    <div className="rounded-lg bg-slate-900 p-4">
                      <pre className="overflow-x-auto text-sm text-green-400">
                        <code>{problem.solution}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">Loading problem...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Code Editor with Console */}
        <div className="relative w-1/2 flex flex-col">
          <div className="flex-1 overflow-hidden">
            {typeof window !== 'undefined' && isClient && yDocRef.current && yTextRef.current && providerRef.current ? (
              <CodeEditor
                roomId={roomId}
                yDoc={yDocRef.current}
                yText={yTextRef.current}
                provider={providerRef.current}
                initialCode={code}
                language="typescript"
                onRunCode={handleRunCode}
                isExecuting={isExecuting}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
                Loading editor...
              </div>
            )}
          </div>
          
          {/* Console - slides up from bottom */}
          {isClient && yMapRef.current && (
            <Console
              yMap={yMapRef.current}
              isOpen={isConsoleOpen}
              onClose={() => setIsConsoleOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Video Chat - Floating Window */}
      {isClient && socketRef.current && userId && (
        <VideoChat
          socket={socketRef.current}
          roomId={roomId}
          userId={userId}
        />
      )}
    </div>
  );
}

