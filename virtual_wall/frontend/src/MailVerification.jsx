import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { buildApiUrl } from './config/api';
import { APP_CONSTANTS } from './config/constants';
import './mailverification.css';

const MailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email] = useState(location.state?.email || localStorage.getItem('pendingEmail') || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(buildApiUrl('/mail-verification/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('pendingEmail');
        navigate('/login');
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');
    try {
      const res = await fetch(buildApiUrl('/mail-verification/resend-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to resend OTP');
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

  const getCountdownClass = () => {
    if (otpCountdown <= 30) return 'mailverification-countdown warning';
    return 'mailverification-countdown normal';
  };

  return (
    <div className="mailverification-container">
      <header className="mailverification-header">
        <div className="mailverification-header-logo">
          Altar Designer
        </div>
        <div className="mailverification-header-subtitle">
          Design your own altar with custom backgrounds and sacred decor
        </div>
      </header>
      
      <main className="mailverification-content">
        <div className="mailverification-card">
          <div className="mailverification-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          
          <h1 className="mailverification-title">Email Verification</h1>
          
          <p className="mailverification-info">
            Enter the 6-digit code sent to <span className="mailverification-email">{email}</span>
          </p>
          
          <form onSubmit={handleSubmit} className="mailverification-form">
            <div className={getCountdownClass()}>
              OTP expires in: {Math.floor(otpCountdown / 60)}:{String(otpCountdown % 60).padStart(2, '0')}
            </div>
            
            <input
              type="text"
              placeholder="Enter OTP code"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              maxLength={6}
              className="mailverification-otp-input"
              disabled={otpCountdown === 0}
            />
            
            <button 
              type="submit" 
              disabled={loading || otpCountdown === 0} 
              className="mailverification-verify-btn"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            
            {otpCountdown === 0 && (
              <div className="mailverification-expired">
                OTP expired. Please resend code.
              </div>
            )}
          </form>
          
          <button 
            onClick={handleResendOtp}
            disabled={resendLoading || resendDisabled} 
            className="mailverification-resend-btn"
          >
            {resendLoading ? 'Sending...' : resendDisabled ? `Resend (${resendCountdown}s)` : 'Resend code'}
          </button>
          
          {error && <div className="mailverification-error">{error}</div>}
        </div>
      </main>
    </div>
  );
};

export default MailVerification; 