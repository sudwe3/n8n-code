import React from 'react';
import { File, Save } from './Icons.jsx';

export const TopBar = ({ selectedNode, onSave, hasUnsavedChanges }) => {
  return (
    <div className="h-10 bg-[#252526] border-b border-[#3e3e42] flex items-center px-3 gap-3">
      {selectedNode ? (
        <>
          <File size={14} className="text-[#519aba]" />
          <span className="text-xs font-medium">{selectedNode.name}</span>
          <span className="text-[10px] text-gray-500 px-2 py-0.5 bg-[#3e3e42] rounded">
            {selectedNode.category}
          </span>
          {hasUnsavedChanges && (
            <span className="text-[10px] text-orange-400">●</span>
          )}
          <button
            onClick={onSave}
            className="ml-auto px-3 py-1 bg-[#0e639c] hover:bg-[#1177bb] rounded text-xs flex items-center gap-1.5 transition-colors"
          >
            <Save size={12} />
            Save
          </button>
        </>
      ) : (
        <span className="text-xs text-gray-500">No node selected</span>
      )}
    </div>
  );
};