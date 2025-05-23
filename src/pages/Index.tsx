
import React from 'react';
import BowlingScorecard from '../components/BowlingScorecard';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  return (
    <div className="main-container">
      <BowlingScorecard />
    </div>
  );
};

export default Index;
