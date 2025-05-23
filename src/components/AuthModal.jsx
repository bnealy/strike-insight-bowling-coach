
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const AuthModal = ({ isOpen, onClose }) => {
  // State variables
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get auth methods
  const { login, register } = useAuth();

  // Don't render if modal is closed
  if (!isOpen) return null;

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      console.log(`Submitting ${isLoginMode ? 'login' : 'registration'} form`);
      
      if (isLoginMode) {
        // Login flow
        console.log('Attempting login with email:', formData.email);
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          console.log('Login successful, closing modal');
          onClose();
        } else {
          console.error('Login failed:', result.error);
          setError(result.error || 'Login failed');
          toast({
            title: "Login failed",
            description: result.error || "Please check your credentials and try again.",
            variant: "destructive"
          });
        }
      } else {
        // Registration flow
        if (!formData.name.trim()) {
          console.error('Registration failed: Name is required');
          setError('Name is required');
          setIsSubmitting(false);
          return;
        }
        
        console.log('Attempting registration with email:', formData.email);
        const result = await register(formData.name, formData.email, formData.password);
        
        if (result.success) {
          console.log('Registration successful, closing modal');
          onClose();
          toast({
            title: "Account created",
            description: "Your account has been created successfully. You are now signed in.",
          });
        } else {
          console.error('Registration failed:', result.error);
          setError(result.error || 'Registration failed');
          toast({
            title: "Registration failed",
            description: result.error || "Please check your information and try again.",
            variant: "destructive"
          });
        }
      }
    } catch (err) {
      console.error('Unexpected error during authentication:', err);
      setError(err.message || 'An unexpected error occurred');
      toast({
        title: "Authentication error",
        description: err.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal styles
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '30px',
      width: '90%',
      maxWidth: '500px',
      position: 'relative',
    },
    header: {
      marginBottom: '20px',
      textAlign: 'center',
    },
    title: {
      fontSize: '1.8rem',
      color: '#333',
      margin: '0 0 10px 0',
    },
    toggleText: {
      marginTop: '10px',
      color: '#666',
    },
    toggleButton: {
      background: 'none',
      border: 'none',
      color: '#4CAF50',
      cursor: 'pointer',
      fontWeight: 'bold',
      padding: '0',
      fontSize: '1rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    label: {
      fontWeight: '500',
      color: '#555',
    },
    input: {
      padding: '12px 15px',
      borderRadius: '5px',
      border: '1px solid #ddd',
      fontSize: '1rem',
    },
    buttonContainer: {
      marginTop: '20px',
    },
    submitButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
      width: '100%',
      padding: '12px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '1rem',
    },
    closeButton: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      background: 'none',
      border: 'none',
      fontSize: '1.2rem',
      cursor: 'pointer',
      color: '#666',
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '10px',
      borderRadius: '5px',
      marginBottom: '15px',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.closeButton} onClick={onClose}>✖</button>
        
        <div style={styles.header}>
          <h2 style={styles.title}>
            {isLoginMode ? 'Sign In' : 'Create Account'}
          </h2>
          <div style={styles.toggleText}>
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button 
              style={styles.toggleButton}
              onClick={() => {
                setError('');
                setIsLoginMode(!isLoginMode);
              }}
            >
              {isLoginMode ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
        
        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <form style={styles.form} onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                name="name"
                style={styles.input}
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name"
                required
                disabled={isSubmitting}
              />
            </div>
          )}
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              style={styles.input}
              value={formData.email}
              onChange={handleInputChange}
              placeholder="email@example.com"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              style={styles.input}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
              minLength={6}
            />
          </div>
          
          <div style={styles.buttonContainer}>
            <button 
              type="submit" 
              style={{
                ...styles.submitButton,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isLoginMode ? 'Signing In...' : 'Creating Account...') 
                : (isLoginMode ? 'Sign In' : 'Create Account')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
