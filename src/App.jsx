import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.jsx';
import { TopBar } from './components/TopBar.jsx';
import { EditorPanel } from './components/EditorPanel.jsx';
import { useWorkflow } from './hooks/useWorkflow.js';
import { useFileOperations } from './hooks/useFileOperations.js';
import { extractCode, hasCode, escapeCode } from './utils/codeExtractor.js';

const N8NEditor = () => {
  const {
    workflow,
    tree,
    currentFilePath,
    hasUnsavedChanges,
    loadWorkflow,
    updateWorkflow,
    setCurrentFilePath,
    setHasUnsavedChanges
  } = useWorkflow();

  const { handleOpenFile, handleSaveFile, handleExportFile } = useFileOperations(loadWorkflow);

  const [selectedNode, setSelectedNode] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [activeTab, setActiveTab] = useState('json');
  const [codeField, setCodeField] = useState(null);
  
  const monacoRef = useRef(null);
  const editorContainerRef = useRef(null);

  useEffect(() => {
    if (selectedNode) {
      const codeInfo = extractCode(selectedNode.data);
      setCodeField(codeInfo);
      
      if (activeTab === 'code' && !codeInfo) {
        setActiveTab('json');
      }
    }
  }, [selectedNode]);

  const handleSave = async () => {
    if (!selectedNode || !workflow) return;

    try {
      let updatedData;
      
      if (activeTab === 'code' && codeField) {
        updatedData = JSON.parse(JSON.stringify(selectedNode.data));
        const escapedCode = escapeCode(editorContent);
        updatedData.parameters[codeField.field] = escapedCode;
      } else {
        updatedData = JSON.parse(editorContent);
      }
      
      const newWorkflow = { ...workflow };
      newWorkflow.nodes[selectedNode.nodeIndex] = updatedData;
      
      updateWorkflow(newWorkflow);
      
      const updatedNode = { ...selectedNode, data: updatedData };
      setSelectedNode(updatedNode);
      
      const saved = await handleSaveFile(
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

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setActiveTab('json');
  };

  const handleExport = async () => {
    if (!workflow) return;
    await handleExportFile(JSON.stringify(workflow, null, 2));
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

  const handleContentChange = (content, originalContent) => {
    setEditorContent(content);
    setHasUnsavedChanges(content !== originalContent);
  };

  const nodeHasCode = selectedNode ? hasCode(selectedNode.data) : false;

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-gray-100 font-sans" style={{ backgroundColor: '#1e1e1e' }}>
      <Sidebar
        workflow={workflow}
        tree={tree}
        selectedNode={selectedNode}
        onNodeClick={handleNodeClick}
        onOpenFile={handleOpenFile}
        onExport={handleExport}
        expandedFolders={expandedFolders}
        onToggleFolder={toggleFolder}
      />
      
      <div className="flex-1 flex flex-col">
        <TopBar
          selectedNode={selectedNode}
          onSave={handleSave}
          hasUnsavedChanges={hasUnsavedChanges}
        />
        
        <EditorPanel
          selectedNode={selectedNode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasCode={nodeHasCode}
          editorContent={editorContent}
          onContentChange={handleContentChange}
          monacoRef={monacoRef}
          editorContainerRef={editorContainerRef}
        />
      </div>
    </div>
  );
};

export default N8NEditor;