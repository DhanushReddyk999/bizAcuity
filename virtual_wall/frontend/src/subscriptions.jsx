import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './subscriptions.css';
import './Profile.css';

export default function Subscriptions({ open, onClose, currentPlan, onUpgrade, isPage }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(currentPlan || 'free');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [expires, setExpires] = useState(null);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [planDurations, setPlanDurations] = useState([]);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [showMockPayment, setShowMockPayment] = useState(false);
  const navigate = useNavigate();

  // Get real user from localStorage
  let user = null;
  let userId = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
    userId = user?.id;
  } catch {}

  // Fetch plans from backend
  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => setPlans(data))
      .catch(() => setPlans([]));
  }, []);

  useEffect(() => {
    // Fetch current subscription status on mount
    const fetchStatus = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/subscriptions/status/${userId}`);
        const data = await res.json();
        if (data.expires && Date.now() > data.expires) {
          await fetch('/api/subscriptions/start-free-trial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });
          setSelectedPlan('free');
          setStatus({ plan: 'free', expires: Date.now() + 7 * 24 * 60 * 60 * 1000 });
          setExpires(Date.now() + 7 * 24 * 60 * 60 * 1000);
        } else {
          setStatus(data);
          setSelectedPlan(data.plan || 'none');
          setExpires(data.expires);
        }
      } catch (err) {
        setStatus(null);
      }
    };
    if (open && userId) fetchStatus();
  }, [open, userId]);

  if (!open) return null;
  if (!userId) {
    return <div className="subscriptions-modal-content"><h2>Please log in to manage your subscription.</h2></div>;
  }

  // Handle plan purchase (mocked for now)
  const handlePurchase = async (plan) => {
    setLoading(true);
    try {
      // You may want to add duration selection logic here if needed
      const res = await fetch(`/api/subscriptions/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId: plan.id }),
      });
      const data = await res.json();
      setShowSuccess(true);
      setSuccessMsg(`Payment successful! You are now on ${plan.name}.`);
      setShowPaymentPanel(false);
      await fetchStatus(); // Refresh status after purchase
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMsg('');
        if (onUpgrade) onUpgrade(plan.name.toLowerCase());
        if (onClose) onClose();
        if (isPage) navigate('/Profile');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleChoosePlan = (plan) => {
    setPendingPlan(plan);
    setShowMockPayment(true);
  };

  const handleMockPayment = async () => {
    setShowMockPayment(false);
    if (pendingPlan) {
      await handlePurchase(pendingPlan);
      setPendingPlan(null);
    }
  };

  const handleCancelPayment = () => {
    setShowMockPayment(false);
    setPendingPlan(null);
  };

  // Format expiry date
  const formatExpiry = (expires) => {
    if (!expires) return '';
    const d = new Date(Number(expires));
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  const content = (
    <>
      {/* Page Header - Only show when it's a full page */}
      {isPage && (
        <header className="subscriptions-page-header">
          <div className="subscriptions-header-logo">Altar Designer</div>
          <span className="subscriptions-header-subtitle">
            Choose your plan to unlock premium features
          </span>
        </header>
      )}

      <div className={isPage ? "subscriptions-main-content" : "subscriptions-modal-content"}>
        {/* Header Section */}
        <div className="subscriptions-header">
          <h1 className="subscriptions-main-title">Choose Your Plan</h1>
          <p className="subscriptions-subtitle">Unlock premium features to enhance your altar design experience</p>
        </div>

        {/* Current Plan Section */}
        <div className="subscriptions-current-plan">
          <div className="current-plan-card">
            <div className="current-plan-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="current-plan-info">
              <span className="current-plan-label">Current Plan</span>
              <span className={`current-plan-badge${selectedPlan === 'premium' ? ' premium' : ''}`}>
                {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
              </span>
            </div>
            {expires && (
              <div className="current-plan-expiry">
                <span className="expiry-label">Expires:</span>
                <span className="expiry-date">{formatExpiry(expires)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cancel Subscription Button for Premium Users */}
        {selectedPlan === 'premium' && (
          <div className="subscriptions-cancel-section">
            <button
              className="subscriptions-cancel-btn"
              onClick={() => setShowCancelModal(true)}
              disabled={loading}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="cancel-icon">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              {loading ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          </div>
        )}

        {/* Plans Section */}
        <div className="subscriptions-plans-section">
          <div className="subscriptions-plan-grid">
            {plans.map(plan => (
              <div key={plan.id} className={`subscriptions-plan-card${plan.name.toLowerCase() === 'premium' ? ' premium' : ''}`}>
                {plan.name.toLowerCase() === 'premium' && (
                  <div className="subscriptions-most-popular">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Most Popular
                  </div>
                )}
                
                <div className="subscriptions-plan-header">
                  <h3 className="subscriptions-plan-title">{plan.name}</h3>
                  <div className="subscriptions-plan-price-section">
                    <span className="subscriptions-plan-price">₹{plan.price}</span>
                    <span className="subscriptions-plan-duration">per {plan.duration}</span>
                  </div>
                </div>

                <div className="subscriptions-plan-features">
                  <h4 className="features-title">What's included:</h4>
                  <ul className="subscriptions-features-list">
                    {plan.download_wall_enabled === 1 && (
                      <li className="feature-item">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="feature-icon">
                          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                        </svg>
                        Download Wall
                      </li>
                    )}
                    {plan.custom_bg_enabled === 1 && (
                      <li className="feature-item">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="feature-icon">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                        Custom Image Background
                      </li>
                    )}
                    {plan.upload_image_enabled === 1 && (
                      <li className="feature-item">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="feature-icon">
                          <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
                        </svg>
                        Upload Image
                      </li>
                    )}
                    {plan.max_drafts !== null && plan.max_drafts !== undefined && (
                      <li className="feature-item">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="feature-icon">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                        Max Drafts: {plan.max_drafts}
                      </li>
                    )}
                    {plan.stickers_limit !== null && plan.stickers_limit !== undefined && (
                      <li className="feature-item">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="feature-icon">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Max Stickers: {plan.stickers_limit}
                      </li>
                    )}
                    {(plan.share_authorized_view_enabled === 1 || plan.share_authorized_edit_enabled === 1 || plan.share_unauthorized_view_enabled === 1 || plan.share_unauthorized_edit_enabled === 1) && (
                      <li className="feature-item">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="feature-icon">
                          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                        </svg>
                        Share Wall
                        <ul className="share-features-list">
                          {plan.share_authorized_view_enabled === 1 && <li>Authorized View</li>}
                          {plan.share_authorized_edit_enabled === 1 && <li>Authorized Edit</li>}
                          {plan.share_unauthorized_view_enabled === 1 && <li>Unauthorized View</li>}
                          {plan.share_unauthorized_edit_enabled === 1 && <li>Unauthorized Edit</li>}
                        </ul>
                      </li>
                    )}
                  </ul>
                </div>

                <button
                  className={`subscriptions-plan-btn${plan.name.toLowerCase() === 'premium' ? ' premium' : ''}`}
                  onClick={() => handleChoosePlan(plan)}
                  disabled={selectedPlan === plan.name.toLowerCase() || loading}
                >
                  {selectedPlan === plan.name.toLowerCase() ? (
                    <>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Current Plan
                    </>
                  ) : loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Choose {plan.name}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="subscriptions-success-message">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            {successMsg}
          </div>
        )}

        {/* Mock Payment Modal */}
        {showMockPayment && (
          <div className="subscriptions-payment-modal">
            <div className="payment-modal-content">
              <div className="payment-modal-header">
                <h3 className="payment-modal-title">Complete Payment</h3>
                <p className="payment-modal-subtitle">This is a mock payment screen for demonstration purposes.</p>
              </div>
              <div className="payment-modal-body">
                <div className="payment-summary">
                  <span className="payment-plan-name">{pendingPlan?.name}</span>
                  <span className="payment-amount">₹{pendingPlan?.price}</span>
                </div>
              </div>
              <div className="payment-modal-actions">
                <button
                  className="payment-confirm-btn"
                  onClick={handleMockPayment}
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Pay Now
                </button>
                <button
                  className="payment-cancel-btn"
                  onClick={handleCancelPayment}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div className="subscriptions-cancel-modal">
            <div className="cancel-modal-content">
              <div className="cancel-modal-header">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24" className="cancel-warning-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <h3 className="cancel-modal-title">Cancel Subscription?</h3>
              </div>
              <div className="cancel-modal-body">
                <p className="cancel-warning-text">
                  Are you sure you want to cancel your premium subscription? You will lose premium benefits immediately.
                </p>
                {cancelError && (
                  <div className="cancel-error-message">{cancelError}</div>
                )}
              </div>
              <div className="cancel-modal-actions">
                <button
                  className="cancel-confirm-btn"
                  onClick={async () => {
                    setLoading(true);
                    setCancelError("");
                    try {
                      const res = await fetch('/api/subscriptions/cancel', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId }),
                      });
                      const data = await res.json();
                      if (!res.ok || !data.success) {
                        setCancelError(data.error || 'Failed to cancel subscription. Please try again.');
                        return;
                      }
                      setSelectedPlan('free');
                      setExpires(null);
                      setShowSuccess(true);
                      setSuccessMsg('Subscription cancelled. You are now on Free plan.');
                      setTimeout(() => setShowSuccess(false), 2000);
                      setShowCancelModal(false);
                    } catch (err) {
                      setCancelError('Network error. Please try again.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                      Yes, Cancel
                    </>
                  )}
                </button>
                <button
                  className="cancel-keep-btn"
                  onClick={() => { setShowCancelModal(false); setCancelError(""); }}
                >
                  Keep Premium
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="subscriptions-back-section">
          <button 
            className="subscriptions-back-btn" 
            onClick={isPage ? () => navigate('/Profile') : onClose}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back to Profile
          </button>
        </div>
      </div>
    </>
  );

  if (isPage) {
    return <div className="subscriptions-page-container">{content}</div>;
  }
  return (
    <div className="profile-payment-modal">{content}</div>
  );
} 