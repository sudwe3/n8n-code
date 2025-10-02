import React from 'react';
import { ChevronRight, ChevronDown, Folder, File } from './Icons.jsx';
import { searchNodes } from '../utils/workflowParser.js';

export const TreeView = ({ 
  tree, 
  searchQuery, 
  selectedNode, 
  onNodeClick, 
  expandedFolders, 
  onToggleFolder 
}) => {
  const filteredTree = searchQuery ? searchNodes(tree, searchQuery) : tree;
  const categories = Object.keys(filteredTree).sort();

  if (categories.length === 0 && searchQuery) {
    return (
      <div className="text-gray-400 text-xs p-4 text-center">
        No nodes found matching "{searchQuery}"
      </div>
    );
  }

  return (
    <div>
      {categories.map((category) => (
        <div key={category} className="mb-1">
          <div
            className="flex items-center gap-1 px-2 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer transition-colors"
            onClick={() => onToggleFolder(category)}
          >
            {expandedFolders.has(category) ? <ChevronDown /> : <ChevronRight />}
            <Folder size={14} className="text-[#dcb67a]" />
            <span className="text-xs font-medium">
              {category} ({filteredTree[category].length})
            </span>
          </div>
          {expandedFolders.has(category) && filteredTree[category].map((node) => (
            <div
              key={node.id}
              onClick={() => onNodeClick(node)}
              className={`flex items-center gap-2 px-2 py-1 ml-4 hover:bg-[#2a2d2e] rounded cursor-pointer transition-colors ${
                selectedNode?.id === node.id ? 'bg-[#37373d]' : ''
              }`}
            >
              <File size={13} className="text-[#519aba] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs truncate font-medium">{node.name}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};