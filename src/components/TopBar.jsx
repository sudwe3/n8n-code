import React from 'react';
import { File, Save, Cloud } from './Icons.jsx';

export const Eye = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

export const TopBar = ({ selectedNode, onSave, hasUnsavedChanges, isN8nWorkflow, onPreview, hasWorkflow }) => {
  return (
    <div className="h-10 bg-[#252526] border-b border-[#3e3e42] flex items-center px-3 gap-3">
      {selectedNode ? (
        <>
          <File size={14} className="text-[#519aba]" />
          <span className="text-xs font-medium">{selectedNode.name}</span>
          <span className="text-[10px] text-gray-500 px-2 py-0.5 bg-[#3e3e42] rounded">
            {selectedNode.category}
          </span>
          {isN8nWorkflow && (
            <span className="text-[10px] text-blue-400 px-2 py-0.5 bg-blue-900 bg-opacity-30 rounded flex items-center gap-1">
              <Cloud size={10} />
              n8n
            </span>
          )}
          {hasUnsavedChanges && (
            <span className="text-[10px] text-orange-400">●</span>
          )}
          <div className="ml-auto flex gap-2">
            {hasWorkflow && (
              <button
                onClick={onPreview}
                className="px-3 py-1 bg-[#3e3e42] hover:bg-[#4e4e52] rounded text-xs flex items-center gap-1.5 transition-colors"
              >
                <Eye size={12} />
                Preview
              </button>
            )}
            <button
              onClick={onSave}
              className="px-3 py-1 bg-[#0e639c] hover:bg-[#1177bb] rounded text-xs flex items-center gap-1.5 transition-colors"
            >
              <Save size={12} />
              {isN8nWorkflow ? 'Save to n8n' : 'Save'}
            </button>
          </div>
        </>
      ) : hasWorkflow ? (
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-gray-500">Select a node to edit</span>
          <button
            onClick={onPreview}
            className="px-3 py-1 bg-[#3e3e42] hover:bg-[#4e4e52] rounded text-xs flex items-center gap-1.5 transition-colors"
          >
            <Eye size={12} />
            Preview
          </button>
        </div>
      ) : (
        <span className="text-xs text-gray-500">No workflow loaded</span>
      )}
    </div>
  );
};