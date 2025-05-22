
// src/App.jsx
import React from 'react';
import { AuthProvider } from './contexts/AuthContext.jsx';
import BowlingScorecard from './components/BowlingScorecard';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BowlingScorecard />
      </div>
    </AuthProvider>
  );
}

export default App;
