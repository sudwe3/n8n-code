import React, { useState } from 'react';
import { FolderOpen, Download, Search, X } from './Icons.jsx';
import { TreeView } from './TreeView.jsx';

export const Sidebar = ({ 
  workflow, 
  tree, 
  selectedNode, 
  onNodeClick, 
  onOpenFile, 
  onExport,
  expandedFolders,
  onToggleFolder
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col" style={{ backgroundColor: '#252526' }}>
      <div className="p-2 border-b border-[#3e3e42] flex gap-2">
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
      </div>
      
      {workflow && (
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
        {!workflow ? (
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
        )}
      </div>
    </div>
  );
};