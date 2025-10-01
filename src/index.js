const { useState, useRef, useEffect } = React;

const ChevronRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const ChevronDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const File = ({ size = 14, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>;
const Folder = ({ size = 14, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const FolderOpen = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const Download = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const Save = ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;

const N8NEditor = () => {
  const [workflow, setWorkflow] = useState(null);
  const [tree, setTree] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [currentFilePath, setCurrentFilePath] = useState(null);
  const [activeTab, setActiveTab] = useState('json');
  const [codeField, setCodeField] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const monacoRef = useRef(null);
  const editorContainerRef = useRef(null);

  const extractCode = (node) => {
    const codeFields = ['jsCode', 'functionCode', 'code', 'javascriptCode'];
    for (const field of codeFields) {
      if (node.parameters && node.parameters[field]) {
        return { code: node.parameters[field], field };
      }
    }
    return null;
  };

  const hasCode = (node) => {
    return extractCode(node) !== null;
  };

  useEffect(() => {
    window.electronAPI.setUnsavedChanges(hasUnsavedChanges);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleFileDrop = async (data) => {
      try {
        const json = JSON.parse(data.content);
        setWorkflow(json);
        setTree(parseWorkflow(json));
        setExpandedFolders(new Set());
        setCurrentFilePath(data.path);
        setHasUnsavedChanges(false);
      } catch (err) {
        alert('Invalid JSON file');
      }
    };

    window.electronAPI.onFileDropped(handleFileDrop);

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].path.endsWith('.json')) {
        const result = await window.electronAPI.readDroppedFile(files[0].path);
        if (result) {
          try {
            const json = JSON.parse(result.content);
            setWorkflow(json);
            setTree(parseWorkflow(json));
            setExpandedFolders(new Set());
            setCurrentFilePath(result.path);
            setHasUnsavedChanges(false);
          } catch (err) {
            alert('Invalid JSON file');
          }
        }
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleSave = async () => {
    if (!selectedNode || !workflow) return;

    try {
      let updatedData;
      
      if (activeTab === 'code' && codeField) {
        updatedData = JSON.parse(JSON.stringify(selectedNode.data));
        const escapedCode = editorContent.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
        updatedData.parameters[codeField.field] = escapedCode;
      } else {
        updatedData = JSON.parse(editorContent);
      }
      
      const newWorkflow = { ...workflow };
      newWorkflow.nodes[selectedNode.nodeIndex] = updatedData;
      
      setWorkflow(newWorkflow);
      setTree(parseWorkflow(newWorkflow));
      
      const updatedNode = { ...selectedNode, data: updatedData };
      setSelectedNode(updatedNode);
      
      const saved = await window.electronAPI.saveFile(
        JSON.stringify(newWorkflow, null, 2),
        currentFilePath
      );
      
      if (saved) {
        setCurrentFilePath(saved);
        setHasUnsavedChanges(false);
        alert('Saved successfully');
      }
    } catch (err) {
      alert('Invalid content: ' + err.message);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNode, workflow, editorContent, activeTab, codeField, currentFilePath]);

  useEffect(() => {
    if (!selectedNode || !editorContainerRef.current) return;
    
    const codeInfo = extractCode(selectedNode.data);
    setCodeField(codeInfo);
    
    if (activeTab === 'code' && !codeInfo) {
      setActiveTab('json');
    }
    
    const initEditor = () => {
      let content, language;
      
      if (activeTab === 'code' && codeInfo) {
        content = codeInfo.code.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        language = 'javascript';
      } else {
        content = JSON.stringify(selectedNode.data, null, 2);
        language = 'json';
      }
      
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
          setEditorContent(monacoRef.current.getValue());
          setHasUnsavedChanges(true);
        });
      } else if (monacoRef.current) {
        const model = monacoRef.current.getModel();
        window.monaco.editor.setModelLanguage(model, language);
        monacoRef.current.setValue(content);
      }
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

  const parseWorkflow = (wf) => {
    if (!wf || !wf.nodes) return {};
    
    const grouped = {};
    
    wf.nodes.forEach((node, idx) => {
      const nodeType = node.type || 'Unknown';
      const category = nodeType.split('.').pop() || 'Other';
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      
      grouped[category].push({
        id: `node-${idx}`,
        name: node.name || `Node ${idx}`,
        type: nodeType,
        category: category,
        data: node,
        nodeIndex: idx
      });
    });
    
    return grouped;
  };

  const handleOpenFile = async () => {
    const result = await window.electronAPI.openFile();
    if (result) {
      try {
        const json = JSON.parse(result.content);
        setWorkflow(json);
        setTree(parseWorkflow(json));
        setExpandedFolders(new Set());
        setCurrentFilePath(result.path);
        setHasUnsavedChanges(false);
      } catch (err) {
        alert('Invalid JSON file');
      }
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setActiveTab('json');
  };

  const handleExport = async () => {
    if (!workflow) return;
    
    const saved = await window.electronAPI.saveFile(
      JSON.stringify(workflow, null, 2),
      null
    );
    
    if (saved) {
      alert('Exported successfully');
    }
  };

  const toggleFolder = (id) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  return React.createElement('div', { 
    className: "flex h-screen bg-[#1e1e1e] text-gray-100 font-sans",
    style: { backgroundColor: '#1e1e1e' }
  },
    React.createElement('div', { 
      className: "w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col",
      style: { backgroundColor: '#252526' }
    },
      React.createElement('div', { className: "p-2 border-b border-[#3e3e42] flex gap-2" },
        React.createElement('button', {
          onClick: handleOpenFile,
          className: "flex-1 px-2 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
        },
          React.createElement(FolderOpen, { size: 14 }),
          'Open'
        ),
        React.createElement('button', {
          onClick: handleExport,
          disabled: !workflow,
          className: "flex-1 px-2 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#3e3e42] disabled:cursor-not-allowed rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
        },
          React.createElement(Download, { size: 14 }),
          'Export'
        )
      ),
      React.createElement('div', { className: "flex-1 overflow-y-auto p-2" },
        !workflow ? 
          React.createElement('div', { className: "text-gray-400 text-xs p-4 text-center" },
            'Open an n8n workflow to start editing'
          ) :
          React.createElement('div', null,
            Object.keys(tree).sort().map((category) => 
              React.createElement('div', { key: category, className: "mb-1" },
                React.createElement('div', {
                  className: "flex items-center gap-1 px-2 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer transition-colors",
                  onClick: () => toggleFolder(category)
                },
                  expandedFolders.has(category) ? 
                    React.createElement(ChevronDown) : 
                    React.createElement(ChevronRight),
                  React.createElement(Folder, { size: 14, className: "text-[#dcb67a]" }),
                  React.createElement('span', { className: "text-xs font-medium" }, `${category} (${tree[category].length})`)
                ),
                expandedFolders.has(category) && tree[category].map((node) =>
                  React.createElement('div', {
                    key: node.id,
                    onClick: () => handleNodeClick(node),
                    className: `flex items-center gap-2 px-2 py-1 ml-4 hover:bg-[#2a2d2e] rounded cursor-pointer transition-colors ${
                      selectedNode?.id === node.id ? 'bg-[#37373d]' : ''
                    }`
                  },
                    React.createElement(File, { size: 13, className: "text-[#519aba] flex-shrink-0" }),
                    React.createElement('div', { className: "flex-1 min-w-0" },
                      React.createElement('div', { className: "text-xs truncate font-medium" }, node.name)
                    )
                  )
                )
              )
            )
          )
      )
    ),
    React.createElement('div', { className: "flex-1 flex flex-col" },
      React.createElement('div', { className: "h-10 bg-[#252526] border-b border-[#3e3e42] flex items-center px-3 gap-3" },
        selectedNode ?
          React.createElement(React.Fragment, null,
            React.createElement(File, { size: 14, className: "text-[#519aba]" }),
            React.createElement('span', { className: "text-xs font-medium" }, selectedNode.name),
            React.createElement('span', { className: "text-[10px] text-gray-500 px-2 py-0.5 bg-[#3e3e42] rounded" }, selectedNode.category),
            React.createElement('button', {
              onClick: handleSave,
              className: "ml-auto px-3 py-1 bg-[#0e639c] hover:bg-[#1177bb] rounded text-xs flex items-center gap-1.5 transition-colors"
            },
              React.createElement(Save, { size: 12 }),
              'Save'
            )
          ) :
          React.createElement('span', { className: "text-xs text-gray-500" }, 'No node selected')
      ),
      selectedNode && React.createElement('div', { 
        className: "flex bg-[#252526] border-b border-[#3e3e42]",
        style: { backgroundColor: '#252526' }
      },
        React.createElement('button', {
          onClick: () => setActiveTab('json'),
          className: `px-4 py-2 text-xs transition-colors ${
            activeTab === 'json' 
              ? 'bg-[#1e1e1e] text-white border-b-2 border-[#0e639c]' 
              : 'text-gray-400 hover:text-white'
          }`
        }, 'JSON'),
        hasCode(selectedNode.data) && React.createElement('button', {
          onClick: () => setActiveTab('code'),
          className: `px-4 py-2 text-xs transition-colors ${
            activeTab === 'code' 
              ? 'bg-[#1e1e1e] text-white border-b-2 border-[#0e639c]' 
              : 'text-gray-400 hover:text-white'
          }`
        }, 'Code')
      ),
      React.createElement('div', { 
        className: "flex-1 bg-[#1e1e1e]",
        style: { backgroundColor: '#1e1e1e' }
      },
        selectedNode ?
          React.createElement('div', { ref: editorContainerRef, className: "w-full h-full" }) :
          React.createElement('div', { className: "flex items-center justify-center h-full text-gray-500 text-sm" },
            'Select a node from the tree to edit'
          )
      )
    )
  );
};

ReactDOM.render(React.createElement(N8NEditor), document.getElementById('root'));