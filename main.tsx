import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const savedTheme = window.localStorage.getItem('monopulse-theme');
document.documentElement.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
