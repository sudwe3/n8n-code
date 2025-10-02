import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.jsx';
import { TopBar } from './components/TopBar.jsx';
import { EditorPanel } from './components/EditorPanel.jsx';
import { Settings } from './components/Settings.jsx';
import { useWorkflow } from './hooks/useWorkflow.js';
import { useFileOperations } from './hooks/useFileOperations.js';
import { useN8nConnection } from './hooks/useN8nConnection.js';
import { extractCode, hasCode } from './utils/codeExtractor.js';

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

  const {
    isConnected: isN8nConnected,
    workflows: n8nWorkflows,
    loading: n8nLoading,
    connect: connectN8n,
    disconnect: disconnectN8n,
    loadWorkflows: loadN8nWorkflows,
    getWorkflow: getN8nWorkflow,
    updateWorkflow: updateN8nWorkflow,
  } = useN8nConnection();

  const [selectedNode, setSelectedNode] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [activeTab, setActiveTab] = useState('json');
  const [codeField, setCodeField] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentN8nWorkflowId, setCurrentN8nWorkflowId] = useState(null);
  
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
        updatedData.parameters[codeField.field] = editorContent;
      } else {
        updatedData = JSON.parse(editorContent);
      }
      
      const newWorkflow = { ...workflow };
      newWorkflow.nodes[selectedNode.nodeIndex] = updatedData;
      
      updateWorkflow(newWorkflow);
      
      const updatedNode = { ...selectedNode, data: updatedData };
      setSelectedNode(updatedNode);
      
      if (currentN8nWorkflowId) {
        await updateN8nWorkflow(currentN8nWorkflowId, newWorkflow);
        setHasUnsavedChanges(false);
        alert('Saved to n8n successfully');
      } else {
        const saved = await handleSaveFile(
          JSON.stringify(newWorkflow, null, 2),
          currentFilePath
        );
        
        if (saved) {
          setCurrentFilePath(saved);
          setHasUnsavedChanges(false);
          alert('Saved successfully');
        }
      }
    } catch (err) {
      alert('Error saving: ' + err.message);
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
  }, [selectedNode, workflow, editorContent, activeTab, codeField, currentFilePath, currentN8nWorkflowId]);

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

  const handleOpenN8nWorkflow = async (n8nWorkflow) => {
    try {
      const fullWorkflow = await getN8nWorkflow(n8nWorkflow.id);
      loadWorkflow(fullWorkflow, null);
      setCurrentN8nWorkflowId(n8nWorkflow.id);
      setCurrentFilePath(null);
      setSelectedNode(null);
    } catch (err) {
      alert('Error loading workflow from n8n: ' + err.message);
    }
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
        isN8nConnected={isN8nConnected}
        n8nWorkflows={n8nWorkflows}
        onOpenN8nWorkflow={handleOpenN8nWorkflow}
        onSettingsClick={() => setSettingsOpen(true)}
        onRefreshN8n={loadN8nWorkflows}
        n8nLoading={n8nLoading}
      />
      
      <div className="flex-1 flex flex-col">
        <TopBar
          selectedNode={selectedNode}
          onSave={handleSave}
          hasUnsavedChanges={hasUnsavedChanges}
          isN8nWorkflow={!!currentN8nWorkflowId}
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

      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onConnect={connectN8n}
        isConnected={isN8nConnected}
        onDisconnect={disconnectN8n}
      />
    </div>
  );
};

export default N8NEditor;