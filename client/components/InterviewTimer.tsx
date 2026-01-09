'use client';

import { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface InterviewTimerProps {
  socket: Socket;
  roomId: string;
  initialDuration?: number; // in minutes
}

export default function InterviewTimer({ socket, roomId, initialDuration = 60 }: InterviewTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialDuration * 60); // Convert to seconds
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    // Sync timer with server/other participants
    socket.on('timer-sync', (data: { timeLeft: number; isPaused: boolean }) => {
      setTimeLeft(data.timeLeft);
      setIsPaused(data.isPaused);
      if (!data.isPaused) {
        startTimeRef.current = Date.now();
      }
    });

    socket.on('timer-start', () => {
      setIsPaused(false);
      startTimeRef.current = Date.now();
    });

    socket.on('timer-pause', () => {
      setIsPaused(true);
      pausedTimeRef.current = timeLeft;
    });

    socket.on('timer-reset', (duration: number) => {
      setTimeLeft(duration * 60);
      setIsPaused(false);
      startTimeRef.current = Date.now();
    });

    // Request current timer state when joining
    socket.emit('timer-request', { roomId });

    return () => {
      socket.off('timer-sync');
      socket.off('timer-start');
      socket.off('timer-pause');
      socket.off('timer-reset');
    };
  }, [socket, roomId]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (): string => {
    const minutesLeft = Math.floor(timeLeft / 60);
    if (minutesLeft < 5) return 'text-red-600 dark:text-red-400';
    if (minutesLeft < 15) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
      <span className={`text-lg font-mono font-semibold ${getTimeColor()}`}>
        {formatTime(timeLeft)}
      </span>
      {timeLeft === 0 && (
        <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-200">
          Time's Up!
        </span>
      )}
    </div>
  );
}

