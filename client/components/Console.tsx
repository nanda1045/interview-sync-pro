'use client';

import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import * as Y from 'yjs';

interface ConsoleOutput {
  stdout: string;
  stderr: string;
  compile_output: string;
  message: string;
  status: {
    id: number;
    description: string;
  };
  time: string;
  memory: number;
  success: boolean;
  timestamp: number;
}

interface ConsoleProps {
  yMap: Y.Map<any>;
  isOpen: boolean;
  onClose: () => void;
}

export default function Console({ yMap, isOpen, onClose }: ConsoleProps) {
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const [outputs, setOutputs] = useState<ConsoleOutput[]>([]);

  useEffect(() => {
    if (!yMap) return;

    // Listen for changes to the console output map
    const updateOutputs = () => {
      const outputArray: ConsoleOutput[] = [];
      yMap.forEach((value, key) => {
        if (key.startsWith('output_')) {
          outputArray.push(value as ConsoleOutput);
        }
      });
      // Sort by timestamp (newest first)
      outputArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setOutputs(outputArray);
    };

    // Initial load
    updateOutputs();

    // Listen for changes
    yMap.observe(updateOutputs);

    return () => {
      yMap.unobserve(updateOutputs);
    };
  }, [yMap]);

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (consoleEndRef.current && isOpen) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [outputs, isOpen]);

  // Always show console when there are outputs, otherwise only when explicitly opened
  const shouldShow = isOpen || outputs.length > 0;
  
  if (!shouldShow) return null;

  const getStatusIcon = (output: ConsoleOutput) => {
    if (output.success) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (output.status.id === 4 || output.status.id === 5) {
      // Wrong Answer or Time Limit Exceeded
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (output: ConsoleOutput) => {
    if (output.success) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    } else if (output.status.id === 4 || output.status.id === 5) {
      return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    } else {
      return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 flex h-64 flex-col border-t-2 border-slate-300 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800">
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-700">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Console Output
          </h3>
          {outputs.length > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {outputs.length} {outputs.length === 1 ? 'execution' : 'executions'}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-slate-200"
          title="Hide console"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Console Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {outputs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-400">
            <p>No output yet. Run your code to see results here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {outputs.map((output, idx) => (
              <div
                key={idx}
                className={`rounded-lg border-2 p-3 ${getStatusColor(output)}`}
              >
                <div className="mb-2 flex items-center gap-2">
                  {getStatusIcon(output)}
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {output.status.description}
                  </span>
                </div>

                {/* Execution Stats */}
                <div className="mb-3 flex items-center gap-4 rounded-md bg-slate-100 px-3 py-2 dark:bg-slate-700/50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-medium">Time:</span>
                    <span>{output.time ? parseFloat(output.time).toFixed(3) : '0.000'}s</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <Zap className="h-3.5 w-3.5" />
                    <span className="font-medium">Memory:</span>
                    <span>{output.memory ? (output.memory / 1024).toFixed(2) : '0.00'} KB</span>
                  </div>
                </div>

                {output.stdout && (
                  <div className="mb-2">
                    <div className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Output:
                    </div>
                    <pre className="rounded bg-slate-100 p-2 text-sm text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                      {output.stdout}
                    </pre>
                  </div>
                )}

                {output.stderr && (
                  <div className="mb-2">
                    <div className="mb-1 text-xs font-semibold text-red-700 dark:text-red-400">
                      Error:
                    </div>
                    <pre className="rounded bg-red-100 p-2 text-sm text-red-900 dark:bg-red-900/30 dark:text-red-200">
                      {output.stderr}
                    </pre>
                  </div>
                )}

                {output.compile_output && (
                  <div className="mb-2">
                    <div className="mb-1 text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                      Compilation:
                    </div>
                    <pre className="rounded bg-yellow-100 p-2 text-sm text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200">
                      {output.compile_output}
                    </pre>
                  </div>
                )}

                {output.message && (
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {output.message}
                  </div>
                )}
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}

