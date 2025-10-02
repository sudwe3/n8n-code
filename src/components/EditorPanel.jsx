import React, { useRef, useEffect, useState } from 'react';

export const EditorPanel = ({ 
  selectedNode, 
  activeTab, 
  setActiveTab, 
  hasCode, 
  editorContent,
  onContentChange,
  monacoRef,
  editorContainerRef
}) => {
  const [initialContent, setInitialContent] = useState('');
  const isInitializing = useRef(false);

  useEffect(() => {
    if (!selectedNode || !editorContainerRef.current) return;
    
    const initEditor = () => {
      let content, language;
      
      if (activeTab === 'code' && hasCode) {
        const codeInfo = extractCodeInfo(selectedNode.data);
        content = codeInfo ? unescapeCode(codeInfo.code) : '';
        language = 'javascript';
      } else {
        content = JSON.stringify(selectedNode.data, null, 2);
        language = 'json';
      }
      
      setInitialContent(content);
      isInitializing.current = true;
      
      if (editorContainerRef.current && !monacoRef.current) {
        monacoRef.current = window.monaco.editor.create(editorContainerRef.current, {
          value: content,
          language: language,
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: true },
          fontSize: 13,
          tabSize: 2,
          wordWrap: 'on',
        });

        monacoRef.current.onDidChangeModelContent(() => {
          if (isInitializing.current) {
            isInitializing.current = false;
            return;
          }
          const newContent = monacoRef.current.getValue();
          onContentChange(newContent, content);
        });
      } else if (monacoRef.current) {
        const model = monacoRef.current.getModel();
        window.monaco.editor.setModelLanguage(model, language);
        monacoRef.current.setValue(content);
      }
      
      setTimeout(() => {
        isInitializing.current = false;
      }, 100);
    };
    
    if (!window.monaco) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
      script.async = true;
      script.onload = () => {
        window.require.config({ 
          paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } 
        });
        window.require(['vs/editor/editor.main'], initEditor);
      };
      document.body.appendChild(script);
    } else {
      initEditor();
    }
  }, [selectedNode, activeTab]);

  const extractCodeInfo = (node) => {
    const codeFields = ['jsCode', 'functionCode', 'code', 'javascriptCode'];
    for (const field of codeFields) {
      if (node.parameters && node.parameters[field]) {
        return { code: node.parameters[field], field };
      }
    }
    return null;
  };

  const unescapeCode = (code) => {
    return code.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  };

  return (
    <>
      {selectedNode && (
        <div className="flex bg-[#252526] border-b border-[#3e3e42]" style={{ backgroundColor: '#252526' }}>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 text-xs transition-colors ${
              activeTab === 'json' 
                ? 'bg-[#1e1e1e] text-white border-b-2 border-[#0e639c]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            JSON
          </button>
          {hasCode && (
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 text-xs transition-colors ${
                activeTab === 'code' 
                  ? 'bg-[#1e1e1e] text-white border-b-2 border-[#0e639c]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Code
            </button>
          )}
        </div>
      )}
      
      <div className="flex-1 bg-[#1e1e1e]" style={{ backgroundColor: '#1e1e1e' }}>
        {selectedNode ? (
          <div ref={editorContainerRef} className="w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Select a node from the tree to edit
          </div>
        )}
      </div>
    </>
  );
};