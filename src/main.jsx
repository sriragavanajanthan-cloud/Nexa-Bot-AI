import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('🚀 Starting app...');

const App = () => {
  return React.createElement('div', { style: { color: 'white', background: 'black', minHeight: '100vh', padding: '20px' } },
    React.createElement('h1', null, 'NEXAbot.AI'),
    React.createElement('p', null, 'If you see this, React is working!'),
    React.createElement('button', { 
      onClick: () => alert('Button clicked!'),
      style: { padding: '10px 20px', marginTop: '20px' }
    }, 'Test Button')
  );
};

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  console.log('Creating root...');
  const root = ReactDOM.createRoot(rootElement);
  console.log('Rendering...');
  root.render(React.createElement(React.StrictMode, null, React.createElement(App)));
  console.log('✅ App rendered');
} else {
  console.error('❌ Root element not found');
}
