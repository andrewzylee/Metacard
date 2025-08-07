import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Web-specific setup
if (typeof window !== 'undefined') {
  // Set up React Native Web
  import('react-native-web').then(() => {
    const container = document.getElementById('root');
    const root = createRoot(container);
    
    root.render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  });
}