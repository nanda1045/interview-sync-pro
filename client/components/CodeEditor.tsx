'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { CustomWebsocketProvider } from '../lib/yjs-provider';
import { Play, Loader2 } from 'lucide-react';
import { JUDGE0_LANGUAGE_MAP, getLanguageDisplayName } from '../lib/judge0Languages';

// Dynamically import Monaco Editor to prevent SSR/hydration issues
const Editor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
        Loading editor...
      </div>
    ),
  }
);

interface CodeEditorProps {
  roomId: string;
  yDoc: Y.Doc;
  yText: Y.Text;
  provider: CustomWebsocketProvider;
  initialCode: string;
  language?: string;
  onRunCode?: (code: string, language: string) => void;
  isExecuting?: boolean;
}

export default function CodeEditor({
  roomId,
  yDoc,
  yText,
  provider,
  initialCode,
  language = 'typescript',
  onRunCode,
  isExecuting = false,
}: CodeEditorProps) {
  const bindingRef = useRef<MonacoBinding | null>(null);
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Bind Monaco Editor to Yjs when editor is ready
    if (yText && !bindingRef.current) {
      try {
        const binding = new MonacoBinding(
          yText,
          editor.getModel(),
          new Set([editor]),
          undefined
        );
        bindingRef.current = binding;
      } catch (error) {
        console.error('Error creating Monaco binding:', error);
      }
    }
    
    setIsEditorReady(true);
  };

  useEffect(() => {
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
    };
  }, []);

  const handleRunCode = () => {
    if (editorRef.current && onRunCode) {
      const code = editorRef.current.getValue();
      onRunCode(code, currentLanguage);
    }
  };

  // Prevent hydration errors by only rendering when mounted on client
  if (!isMounted) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" suppressHydrationWarning>
      {/* Editor Header with Run Button */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <select
            value={currentLanguage}
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
          >
            {Object.keys(JUDGE0_LANGUAGE_MAP)
              .filter((lang) => ['python3', 'javascript', 'typescript', 'java', 'cpp', 'c', 'csharp', 'go', 'rust'].includes(lang))
              .map((lang) => (
                <option key={lang} value={lang}>
                  {getLanguageDisplayName(lang)}
                </option>
              ))}
          </select>
        </div>
        <button
          onClick={handleRunCode}
          disabled={!isEditorReady || isExecuting}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExecuting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Code
            </>
          )}
        </button>
      </div>

      {/* Editor */}
      <div className="relative flex-1" suppressHydrationWarning>
        {!isEditorReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-400">
            Loading editor...
          </div>
        )}
        <Editor
          height="100%"
          language={currentLanguage}
          theme="vs-dark"
          value={initialCode}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}

