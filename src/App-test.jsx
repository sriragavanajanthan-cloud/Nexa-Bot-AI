import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function TestPage() {
  return (
    <div style={{ color: 'white', padding: '20px', background: '#111', minHeight: '100vh' }}>
      <h1>✅ Test Page Works!</h1>
      <p>If you see this, React is rendering correctly.</p>
      <button onClick={() => alert('Working!')}>Click me</button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/app" element={<TestPage />} />
        <Route path="/" element={<Navigate to="/app" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
