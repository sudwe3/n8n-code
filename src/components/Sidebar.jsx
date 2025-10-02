import React, { useState } from 'react';
import { FolderOpen, Download, Search, X, Settings, Cloud } from './Icons.jsx';
import { TreeView } from './TreeView.jsx';

export const Sidebar = ({ 
  workflow, 
  tree, 
  selectedNode, 
  onNodeClick, 
  onOpenFile, 
  onExport,
  expandedFolders,
  onToggleFolder,
  isN8nConnected,
  n8nWorkflows,
  onOpenN8nWorkflow,
  onSettingsClick,
  onRefreshN8n,
  n8nLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('local');

  return (
    <div className="w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col" style={{ backgroundColor: '#252526' }}>
      <div className="p-2 border-b border-[#3e3e42] space-y-2">
        <div className="flex gap-2">
          <button
            onClick={onOpenFile}
            className="flex-1 px-2 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <FolderOpen size={14} />
            Open
          </button>
          <button
            onClick={onExport}
            disabled={!workflow}
            className="flex-1 px-2 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#3e3e42] disabled:cursor-not-allowed rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            Export
          </button>
          <button
            onClick={onSettingsClick}
            className="px-2 py-1.5 bg-[#3e3e42] hover:bg-[#4e4e52] rounded text-xs flex items-center justify-center transition-colors"
          >
            <Settings size={14} />
          </button>
        </div>

        {isN8nConnected && (
          <div className="flex border-b border-[#3e3e42]">
            <button
              onClick={() => setActiveTab('local')}
              className={`flex-1 px-3 py-1.5 text-xs transition-colors ${
                activeTab === 'local' 
                  ? 'text-white border-b-2 border-[#0e639c]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Local
            </button>
            <button
              onClick={() => setActiveTab('n8n')}
              className={`flex-1 px-3 py-1.5 text-xs flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'n8n' 
                  ? 'text-white border-b-2 border-[#0e639c]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Cloud size={12} />
              n8n
            </button>
          </div>
        )}
      </div>
      
      {(workflow || (isN8nConnected && activeTab === 'n8n')) && (
        <div className="p-2 border-b border-[#3e3e42]">
          <div className="relative flex items-center">
            <div className="absolute left-2 pointer-events-none">
              <Search size={14} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-[#3e3e42] border border-[#3e3e42] rounded focus:border-[#0e639c] focus:outline-none text-gray-100 placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-gray-400 hover:text-gray-100 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'local' ? (
          !workflow ? (
            <div className="text-gray-400 text-xs p-4 text-center">
              Open an n8n workflow to start editing
            </div>
          ) : (
            <TreeView
              tree={tree}
              searchQuery={searchQuery}
              selectedNode={selectedNode}
              onNodeClick={onNodeClick}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
            />
          )
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">
                {n8nWorkflows.length} workflows
              </span>
              <button
                onClick={onRefreshN8n}
                disabled={n8nLoading}
                className="text-xs text-[#0e639c] hover:text-[#1177bb] disabled:opacity-50"
              >
                {n8nLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {n8nWorkflows.length === 0 ? (
              <div className="text-gray-400 text-xs p-4 text-center">
                No workflows found in n8n
              </div>
            ) : (
              <div className="space-y-1">
                {n8nWorkflows
                  .filter(wf => 
                    !searchQuery || 
                    wf.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((wf) => (
                    <div
                      key={wf.id}
                      onClick={() => onOpenN8nWorkflow(wf)}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#2a2d2e] rounded cursor-pointer transition-colors"
                    >
                      <Cloud size={13} className="text-[#519aba] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs truncate font-medium">{wf.name}</div>
                        {wf.active && (
                          <span className="text-[10px] text-green-400">Active</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};