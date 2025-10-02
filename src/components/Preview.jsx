import React, { useEffect, useRef, useState } from 'react';
import { X } from './Icons.jsx';

export const Preview = ({ isOpen, onClose, workflow }) => {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadWebComponent = () => {
      if (window.customElements && window.customElements.get('n8n-demo')) {
        setIsLoading(false);
        return;
      }

      const webComponentsScript = document.createElement('script');
      webComponentsScript.src = 'https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs@2.0.0/webcomponents-loader.js';
      
      const polyfillScript = document.createElement('script');
      polyfillScript.src = 'https://www.unpkg.com/lit@2.0.0-rc.2/polyfill-support.js';
      
      const n8nScript = document.createElement('script');
      n8nScript.type = 'module';
      n8nScript.src = 'https://cdn.jsdelivr.net/npm/@n8n_io/n8n-demo-component/n8n-demo.bundled.js';
      
      n8nScript.onload = () => {
        setTimeout(() => setIsLoading(false), 500);
      };

      document.head.appendChild(webComponentsScript);
      document.head.appendChild(polyfillScript);
      document.head.appendChild(n8nScript);
    };

    loadWebComponent();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isLoading || !containerRef.current || !workflow) return;

    const containerHeight = containerRef.current.clientHeight;

    const existingStyle = document.getElementById('n8n-preview-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'n8n-preview-style';
    style.textContent = `
      .preview-container n8n-demo {
        --n8n-workflow-min-height: ${containerHeight}px;
        width: 100%;
        height: 100%;
        display: block;
      }
    `;
    document.head.appendChild(style);

    const demoElement = document.createElement('n8n-demo');
    demoElement.setAttribute('workflow', JSON.stringify(workflow));
    demoElement.setAttribute('theme', 'dark');
    demoElement.setAttribute('disableinteractivity', 'false');
    
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(demoElement);

    return () => {
      const styleToRemove = document.getElementById('n8n-preview-style');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [isOpen, isLoading, workflow]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#252526] rounded-lg w-[95vw] h-[90vh] flex flex-col border border-[#3e3e42]">
        <div className="flex items-center justify-between p-4 border-b border-[#3e3e42]">
          <h2 className="text-lg font-semibold">Workflow Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Loading preview...
            </div>
          ) : !workflow ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              No workflow loaded
            </div>
          ) : (
            <div ref={containerRef} className="preview-container w-full h-full" />
          )}
        </div>
      </div>
    </div>
  );
};