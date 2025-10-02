export const parseWorkflow = (wf) => {
  if (!wf || !wf.nodes || !Array.isArray(wf.nodes)) return {};
  
  const grouped = {};
  
  wf.nodes.forEach((node, idx) => {
    if (!node) return;
    
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

export const searchNodes = (tree, query) => {
  if (!query || !tree) return tree;
  
  const filtered = {};
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) return tree;
  
  Object.keys(tree).forEach(category => {
    const matchingNodes = tree[category].filter(node => 
      node.name.toLowerCase().includes(lowerQuery) ||
      node.type.toLowerCase().includes(lowerQuery) ||
      category.toLowerCase().includes(lowerQuery)
    );
    
    if (matchingNodes.length > 0) {
      filtered[category] = matchingNodes;
    }
  });
  
  return filtered;
};