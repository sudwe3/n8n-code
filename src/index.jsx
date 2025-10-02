import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import N8NEditor from './App.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <N8NEditor />
  </React.StrictMode>
);