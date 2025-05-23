
import React from 'react';

const LoginButton = ({ onClick }) => {
  const buttonStyle = {
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  return (
    <button
      onClick={onClick}
      style={buttonStyle}
      onMouseEnter={(e) => {
        e.target.style.background = '#45a049';
        e.target.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = '#4CAF50';
        e.target.style.transform = 'translateY(0)';
      }}
    >
      Sign In / Create Account
    </button>
  );
};

export default LoginButton;
