/**
 * @file main.jsx
 * @description Application root mounter for React/Vite.
 * 
 * FUTURE PURPOSE:
 * - Mounts React application tree into root DOM element.
 * - Wraps app in Web3/Wallet context and authentication providers.
 * 
 * TARGET PHASE:
 * - Phase 4: Frontend — React (Vite) + ethers.js, wallet connect, Admin panel, Audit/Asset views
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
