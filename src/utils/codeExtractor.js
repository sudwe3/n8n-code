export const extractCode = (node) => {
  const codeFields = ['jsCode', 'functionCode', 'code', 'javascriptCode'];
  for (const field of codeFields) {
    if (node.parameters && node.parameters[field]) {
      return { code: node.parameters[field], field };
    }
  }
  return null;
};

export const hasCode = (node) => {
  return extractCode(node) !== null;
};

export const escapeCode = (code) => {
  return code.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
};

export const unescapeCode = (code) => {
  return code.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
};