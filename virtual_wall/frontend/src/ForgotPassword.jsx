import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ForgotPassword.module.css';
import { buildApiUrl } from './config/api';
import { APP_CONSTANTS } from './config/constants';
import './wall.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
      setReadOnly(true);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch(buildApiUrl('/mail-verification/request-reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 1000);
      } else {
        setError(data.error || APP_CONSTANTS.VALIDATION_MESSAGES.SAVE_FAILED);
      }
    } catch (err) {
      setError(APP_CONSTANTS.VALIDATION_MESSAGES.NETWORK_ERROR);
    }
    setLoading(false);
  };

  const handleLogin = () => {
    navigate('/Login');
  };

  const handleSignUp = () => {
    navigate('/SignUp');
  };

  return (
    <div className={styles.container}>
      {/* Header like Login Page */}
      <header className={styles.header}>
        <div className={styles.headerLogo}>Altar Designer</div>
        <span className={styles.headerSubtitle}>
          Reset your password to continue designing your sacred space
        </span>
      </header>
      
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          <div className={styles.icon}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path fill="#2196f3" d="M12 2a7 7 0 0 0-7 7v3.28A2 2 0 0 0 4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-1-1.72V9a7 7 0 0 0-7-7Zm0 2a5 5 0 0 1 5 5v3H7V9a5 5 0 0 1 5-5Zm-6 10h12v5H6v-5Zm6 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
            </svg>
          </div>
        </div>
        <h2 className={styles.heading}>Reset Your Password</h2>
        <p className={styles.info}>
          Enter your registered email address and we'll send you a secure reset code to create a new password.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputContainer}>
            <label className={styles.inputLabel}>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={styles.input}
              readOnly={readOnly}
            />
          </div>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Sending Reset Code...
              </>
            ) : (
              <>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className={styles.buttonIcon}>
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Send Reset Code
              </>
            )}
          </button>
        </form>
        {error && (
          <div className={styles.error}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className={styles.errorIcon}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className={styles.success}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className={styles.successIcon}>
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Reset code sent! Check your email.
          </div>
        )}
        <div className={styles.footer}>
          <button className={styles.backButton} onClick={() => navigate('/login')}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className={styles.backIcon}>
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 