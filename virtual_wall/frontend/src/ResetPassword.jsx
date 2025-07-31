import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ResetPassword.module.css';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from './utils/passwordValidation';
import { buildApiUrl } from './config/api';
import { APP_CONSTANTS } from './config/constants';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [passwordValidation, setPasswordValidation] = useState({ isValid: false, errors: [], strength: 'weak' });
  const [showPassword, setShowPassword] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(APP_CONSTANTS.OTP_TIMEOUT);

  // Start countdown on mount and when resend
  useEffect(() => {
    setOtpCountdown(APP_CONSTANTS.OTP_TIMEOUT);
    const interval = setInterval(() => {
      setOtpCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendDisabled]);

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const validation = validatePassword(newPassword);
    setPasswordValidation(validation);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!passwordValidation.isValid) {
      setError(APP_CONSTANTS.VALIDATION_MESSAGES.PASSWORD_REQUIREMENTS);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('/mail-verification/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      } else {
        setError(data.error || APP_CONSTANTS.VALIDATION_MESSAGES.SAVE_FAILED);
      }
    } catch (err) {
      setError(APP_CONSTANTS.VALIDATION_MESSAGES.NETWORK_ERROR);
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');
    try {
      const res = await fetch(buildApiUrl('/mail-verification/request-reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || APP_CONSTANTS.VALIDATION_MESSAGES.SAVE_FAILED);
        setResendLoading(false);
        return;
      }
      // Start countdown
      setResendDisabled(true);
      setResendCountdown(60);
      const countdownInterval = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('Network error');
    }
    setResendLoading(false);
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
        <div className={styles.icon}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#2196f3" d="M12 2a7 7 0 0 0-7 7v3.28A2 2 0 0 0 4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-1-1.72V9a7 7 0 0 0-7-7Zm0 2a5 5 0 0 1 5 5v3H7V9a5 5 0 0 1 5-5Zm-6 10h12v5H6v-5Zm6 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>
        </div>
        <h2 className={styles.heading}>Reset Password</h2>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2em' }}>
          <div style={{ margin: '0.5em 0', color: otpCountdown <= 30 ? '#f44336' : '#1769aa', fontWeight: 600 }}>
            OTP expires in: {Math.floor(otpCountdown / 60)}:{String(otpCountdown % 60).padStart(2, '0')}
          </div>
          <input
            type="text"
            placeholder="Enter OTP code"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
            maxLength={6}
            className={styles.input}
            disabled={otpCountdown === 0}
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={handlePasswordChange}
              required
              className={styles.input}
              style={{ 
                border: `1.5px solid ${passwordValidation.isValid ? '#4caf50' : password.length > 0 ? '#f44336' : '#e5e7eb'}`,
                paddingRight: '3em'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2em',
                color: '#666'
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {password.length > 0 && (
            <div style={{ marginBottom: '0.5em' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5em', 
                marginBottom: '0.3em',
                fontSize: '0.9em'
              }}>
                <span>Strength:</span>
                <span style={{ 
                  color: getPasswordStrengthColor(passwordValidation.strength),
                  fontWeight: 'bold'
                }}>
                  {getPasswordStrengthText(passwordValidation.strength)}
                </span>
              </div>
              <div style={{ 
                height: '4px', 
                background: '#e0e0e0', 
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: getPasswordStrengthColor(passwordValidation.strength),
                  width: passwordValidation.strength === 'weak' ? '25%' : 
                        passwordValidation.strength === 'medium' ? '50%' : 
                        passwordValidation.strength === 'strong' ? '75%' : '100%',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}
          {passwordValidation.errors.length > 0 && (
            <div style={{ 
              fontSize: '0.85em', 
              color: '#f44336',
              marginBottom: '0.5em',
              lineHeight: '1.4'
            }}>
              {passwordValidation.errors.map((error, index) => (
                <div key={index} style={{ marginBottom: '0.2em' }}>• {error}</div>
              ))}
            </div>
          )}
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            className={styles.input}
            style={{ 
              border: `1.5px solid ${password === confirm && confirm.length > 0 ? '#4caf50' : confirm.length > 0 ? '#f44336' : '#e5e7eb'}`
            }}
          />
          <button type="submit" disabled={loading || otpCountdown === 0} className={styles.button}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          {otpCountdown === 0 && (
            <div style={{ color: '#f44336', marginTop: '0.5em' }}>
              OTP expired. Please resend code.
            </div>
          )}
        </form>
        <button 
          onClick={handleResendOtp}
          disabled={resendLoading || resendDisabled} 
          className={styles.button}
          style={{ 
            background: 'transparent', 
            color: '#2196f3', 
            border: '1px solid #2196f3',
            marginTop: '0.5em'
          }}
        >
          {resendLoading ? 'Sending...' : resendDisabled ? `Resend (${resendCountdown}s)` : 'Resend OTP'}
        </button>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>Password reset successful! Redirecting to login...</div>}
      </div>
      <button className={styles.back} onClick={() => navigate('/login')}>&larr; Back to Login</button>
    </div>
  );
};

export default ResetPassword; 