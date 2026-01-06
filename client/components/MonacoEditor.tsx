'use client';

import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { CustomWebsocketProvider } from '../lib/yjs-provider';

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
  };

  useEffect(() => {
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
    };
  }, []);

  return (
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
  );
}

