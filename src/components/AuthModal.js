// src/components/AuthModal.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        result = await register(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        setFormData({ name: '', email: '', password: '' });
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  if (!isOpen) return null;

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      background: 'white',
      borderRadius: '15px',
      padding: '30px',
      width: '90%',
      maxWidth: '400px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '25px'
    },
    title: {
      fontSize: '1.8em',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '10px'
    },
    subtitle: {
      color: '#666',
      fontSize: '0.9em'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    input: {
      padding: '12px 15px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.3s ease'
    },
    inputFocus: {
      borderColor: '#4CAF50',
      outline: 'none'
    },
    button: {
      background: '#4CAF50',
      color: 'white',
      border: 'none',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease'
    },
    buttonDisabled: {
      background: '#ccc',
      cursor: 'not-allowed'
    },
    error: {
      color: '#f44336',
      fontSize: '14px',
      textAlign: 'center',
      marginTop: '10px'
    },
    toggleContainer: {
      textAlign: 'center',
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid #e0e0e0'
    },
    toggleText: {
      color: '#666',
      fontSize: '14px'
    },
    toggleLink: {
      color: '#4CAF50',
      cursor: 'pointer',
      textDecoration: 'underline',
      fontWeight: 'bold'
    },
    closeButton: {
      position: 'absolute',
      top: '15px',
      right: '20px',
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#999'
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{ ...modalStyles.modal, position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button style={modalStyles.closeButton} onClick={onClose}>×</button>
        
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p style={modalStyles.subtitle}>
            {isLogin ? 'Sign in to save your bowling games' : 'Join to track your bowling progress'}
          </p>
        </div>

        <form style={modalStyles.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              style={modalStyles.input}
              required
            />
          )}
          
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            style={modalStyles.input}
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            style={modalStyles.input}
            required
          />

          {error && <p style={modalStyles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...modalStyles.button,
              ...(loading ? modalStyles.buttonDisabled : {})
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#45a049';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#4CAF50';
              }
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={modalStyles.toggleContainer}>
          <p style={modalStyles.toggleText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span style={modalStyles.toggleLink} onClick={toggleMode}>
              {isLogin ? 'Create one here' : 'Sign in here'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
