'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import * as Y from 'yjs';
import { io, Socket } from 'socket.io-client';
import { ArrowLeft, Users } from 'lucide-react';
import { Problem } from '../../../../shared/types';
import { CustomWebsocketProvider } from '../../../lib/yjs-provider';

// Dynamically import Monaco Editor to prevent SSR issues
const MonacoEditor = dynamic(
  () => import('../../../components/MonacoEditor'),
  { ssr: false }
);

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('// Start coding here...\n');
  const [participants, setParticipants] = useState<string[]>([]);
  
  const yDocRef = useRef<Y.Doc | null>(null);
  const yTextRef = useRef<Y.Text | null>(null);
  const providerRef = useRef<CustomWebsocketProvider | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only initialize Socket.io and Yjs on the client side
    if (typeof window === 'undefined') return;

    // Initialize Socket.io connection using environment variable
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socket = io(socketUrl, {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('join-room', roomId);
    });

    socket.on('room-joined', (room: string) => {
      console.log('Joined room:', room);
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

    // Connect to Yjs WebSocket server
    const wsUrl = process.env.NEXT_PUBLIC_YJS_URL || 'ws://localhost:3001';
    const provider = new CustomWebsocketProvider(wsUrl, roomId, yDoc);

    providerRef.current = provider;

    // Load initial code from Yjs
    const initialCode = yText.toString() || '// Start coding here...\n';
    setCode(initialCode);

    // Load problem data
    fetch('/api/problems/two-sum')
      .then((res) => res.json())
      .then((data) => setProblem(data))
      .catch((err) => console.error('Failed to load problem:', err));

    return () => {
      provider.destroy();
      socket.disconnect();
      yDoc.destroy();
    };
  }, [roomId, isClient]);

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
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Users className="h-5 w-5" />
          <span className="text-sm">{participants.length}</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane - Problem Description */}
        <div className="w-1/2 overflow-y-auto border-r border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          {problem ? (
            <div className="space-y-6">
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

              {problem.examples && problem.examples.length > 0 && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                    Examples:
                  </h3>
                  {problem.examples.map((example, idx) => (
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
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-slate-500 dark:text-slate-400">Loading problem...</p>
            </div>
          )}
        </div>

        {/* Right Pane - Monaco Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Code Editor
            </h3>
          </div>
          <div className="flex-1">
            {isClient && yDocRef.current && yTextRef.current && providerRef.current ? (
              <MonacoEditor
                roomId={roomId}
                yDoc={yDocRef.current}
                yText={yTextRef.current}
                provider={providerRef.current}
                initialCode={code}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
                Loading editor...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

