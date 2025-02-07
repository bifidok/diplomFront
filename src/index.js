import React from 'react';
import './css/index.css';
import App from './App';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
    //<React.StrictMode>
    <App />
  //</React.StrictMode>,
);