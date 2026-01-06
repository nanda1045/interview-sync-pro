'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { CustomWebsocketProvider } from '../lib/yjs-provider';

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

interface MonacoEditorProps {
  roomId: string;
  yDoc: Y.Doc;
  yText: Y.Text;
  provider: CustomWebsocketProvider;
  initialCode: string;
}

export default function MonacoEditor({
  roomId,
  yDoc,
  yText,
  provider,
  initialCode,
}: MonacoEditorProps) {
  const bindingRef = useRef<MonacoBinding | null>(null);
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

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

  return (
    <div className="relative h-full w-full">
      {!isEditorReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-400">
          Loading editor...
        </div>
      )}
      <Editor
        height="100%"
        defaultLanguage="typescript"
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
  );
}

