import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import Subscriptions from './subscriptions.jsx';
import { usePlan } from "./PlanContext";
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from './utils/passwordValidation';
import { buildApiUrl } from './config/api';
import { APP_CONSTANTS, isValidEmail, formatExpiry } from './config/constants';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsBtnRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const navigate = useNavigate();
  const { planFeatures } = usePlan();
  
  // Share feature flags
  const shareAuthViewEnabled = planFeatures.share_authorized_view_enabled;
  const shareAuthEditEnabled = planFeatures.share_authorized_edit_enabled;
  const shareUnauthViewEnabled = planFeatures.share_unauthorized_view_enabled;
  const shareUnauthEditEnabled = planFeatures.share_unauthorized_edit_enabled;
  
  // Check if any sharing is enabled
  const anySharingEnabled = shareAuthViewEnabled || shareAuthEditEnabled || shareUnauthViewEnabled || shareUnauthEditEnabled;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);
  const [pendingEdit, setPendingEdit] = useState(null);
  const [editPassword, setEditPassword] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [changePwdModalOpen, setChangePwdModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePwdLoading, setChangePwdLoading] = useState(false);
  const [changePwdError, setChangePwdError] = useState("");
  const [changePwdSuccess, setChangePwdSuccess] = useState("");
  const [newPasswordValidation, setNewPasswordValidation] = useState({ isValid: false, errors: [], strength: 'weak' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const fileInputRef = useRef();
  const [isPhotoHover, setIsPhotoHover] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(null); // wall_id of open share menu
  const [authorizedSubMenuOpen, setAuthorizedSubMenuOpen] = useState(null); // wall_id of open authorized submenu
  const [unauthorizedSubMenuOpen, setUnauthorizedSubMenuOpen] = useState(null); // wall_id of open unauthorized submenu
  const shareMenuRef = useRef();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [pendingWallId, setPendingWallId] = useState(null);
  const [showEditEmailModal, setShowEditEmailModal] = useState(false);
  const [editEmailInput, setEditEmailInput] = useState("");
  const [pendingEditWallId, setPendingEditWallId] = useState(null);

  // For improved email input UI
  const [viewEmails, setViewEmails] = useState([]);
  const [viewEmailError, setViewEmailError] = useState("");
  const [editEmails, setEditEmails] = useState([]);
  const [editEmailError, setEditEmailError] = useState("");

  // For showing generated links and copy functionality
  const [generatedViewLink, setGeneratedViewLink] = useState("");
  const [generatedEditLink, setGeneratedEditLink] = useState("");
  const [generatedUnauthorizedViewLink, setGeneratedUnauthorizedViewLink] = useState("");
  const [generatedUnauthorizedEditLink, setGeneratedUnauthorizedEditLink] = useState("");
  const [copyMsg, setCopyMsg] = useState("");
  const [viewLinkLoading, setViewLinkLoading] = useState(false);
  const [editLinkLoading, setEditLinkLoading] = useState(false);

  // Subscription/payment UI state
  const [subscription, setSubscription] = useState('free');
  const [subscriptionExpires, setSubscriptionExpires] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  // For email OTP verification
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [pendingNewEmail, setPendingNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpError, setEmailOtpError] = useState("");
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);

  // Password validation handler
  const handleNewPasswordChange = (e) => {
    const newPasswordValue = e.target.value;
    setNewPassword(newPasswordValue);
    const validation = validatePassword(newPasswordValue);
    setNewPasswordValidation(validation);
  };

  // Fetch subscription status from backend
  useEffect(() => {
    let u = null;
    try {
      u = JSON.parse(localStorage.getItem('user'));
    } catch {}
    if (!u?.id) return;
    fetch(`/api/subscriptions/status/${u.id}`)
      .then(res => res.json())
      .then(data => {
        setSubscription(data.plan || 'free');
        setSubscriptionExpires(data.expires);
      });
  }, [showPaymentModal, paymentSuccess]);



  // Function to generate and show public share link
  const handlePublicShare = async (wall_id) => {
    try {
      const res = await fetch(buildApiUrl(`/shareDraft/${wall_id}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": user?.token ? `Bearer ${user.token}` : undefined,
        },
      });
      if (!res.ok) {
        alert(APP_CONSTANTS.VALIDATION_MESSAGES.SAVE_FAILED);
        return;
      }
      const data = await res.json();
      setGeneratedUnauthorizedViewLink(data.shareUrl);
    } catch (err) {
      alert(APP_CONSTANTS.VALIDATION_MESSAGES.NETWORK_ERROR);
    }
  };
  // Function to generate and show edit link
  const handleEditShare = async (wall_id) => {
    try {
      const res = await fetch(buildApiUrl(`/editShareDraft/${wall_id}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": user?.token ? `Bearer ${user.token}` : undefined,
        },
      });
      if (!res.ok) {
        alert(APP_CONSTANTS.VALIDATION_MESSAGES.SAVE_FAILED);
        return;
      }
      const data = await res.json();
      setGeneratedUnauthorizedEditLink(data.editUrl);
    } catch (err) {
      alert(APP_CONSTANTS.VALIDATION_MESSAGES.NETWORK_ERROR);
    }
  };

  // Function to generate and show authorized view-only link
  const handleAuthorizedViewShare = async (wall_id, emails) => {
    setViewLinkLoading(true);
    try {
      const res = await fetch(buildApiUrl(`/authViewShareDraft/${wall_id}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": user?.token ? `Bearer ${user.token}` : undefined,
        },
        body: JSON.stringify({ emails }),
      });
      if (!res.ok) {
        alert(APP_CONSTANTS.VALIDATION_MESSAGES.SAVE_FAILED);
        setViewLinkLoading(false);
        return;
      }
      const data = await res.json();
      setGeneratedViewLink(data.viewUrl);
    } catch (err) {
      alert(APP_CONSTANTS.VALIDATION_MESSAGES.NETWORK_ERROR);
    } finally {
      setViewLinkLoading(false);
    }
  };

  // Function to generate and show authorized edit link
  const handleAuthorizedEditShare = async (wall_id, emails) => {
    setEditLinkLoading(true);
    try {
      const res = await fetch(buildApiUrl(`/authEditShareDraft/${wall_id}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": user?.token ? `Bearer ${user.token}` : undefined,
        },
        body: JSON.stringify({ emails }),
      });
      if (!res.ok) {
        alert(APP_CONSTANTS.VALIDATION_MESSAGES.SAVE_FAILED);
        setEditLinkLoading(false);
        return;
      }
      const data = await res.json();
      setGeneratedEditLink(data.editUrl);
    } catch (err) {
      alert(APP_CONSTANTS.VALIDATION_MESSAGES.NETWORK_ERROR);
    } finally {
      setEditLinkLoading(false);
    }
  };

  useEffect(() => {
    const fetchDrafts = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        navigate("/Login");
        return;
      }

      const userObj = JSON.parse(storedUser);
      setUser(userObj);

      // Fetch profile photo
      try {
        const res = await fetch(buildApiUrl(`/profilePhoto/${userObj.id}`), {
          headers: { Authorization: `Bearer ${userObj.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.photo) {
            setProfilePhotoPreview(data.photo);
          }
        }
      } catch (err) { /* ignore */ }

      try {
        const token = userObj.token;
        const res = await fetch(
          buildApiUrl(`/getDrafts/${userObj.id}`),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("user");
          navigate("/Login");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch drafts");

        const data = await res.json();

        const decodedDrafts = data.map((draft) => {
          const decoded = JSON.parse(atob(draft.wall_data));
          return {
            ...decoded,
            wall_id: draft.wall_id,
            timestamp: draft.timestamp,
            name: decoded.name || `Draft ${draft.id}`,
          };
        });

        setDrafts(decodedDrafts);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  // Close settings menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target) &&
        settingsBtnRef.current &&
        !settingsBtnRef.current.contains(event.target)
      ) {
        setSettingsOpen(false);
      }
    }
    if (settingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsOpen]);

  // Close share menu and submenus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target)
      ) {
        setShareMenuOpen(null);
        setAuthorizedSubMenuOpen(null);
        setUnauthorizedSubMenuOpen(null);
      }
    }
    if (shareMenuOpen !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [shareMenuOpen]);

  // Add a function to delete a draft by timestamp
  async function handleDeleteDraft(wall_id) {
    if (!user) return;

    try {
      const token = user.token;
      const res = await fetch(buildApiUrl(`/deleteDraft/${wall_id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("user");
        navigate("/Login");
        return;
      }

      if (!res.ok) {
        const error = await res.text();
        alert(APP_CONSTANTS.VALIDATION_MESSAGES.DELETE_FAILED + ": " + error);
        return;
      }

      const updatedDrafts = drafts.filter((d) => d.wall_id !== wall_id);
      setDrafts(updatedDrafts);
    } catch (err) {
      console.error("Delete draft error:", err);
      alert(APP_CONSTANTS.VALIDATION_MESSAGES.NETWORK_ERROR);
    }
  }

  // Open edit modal and prefill fields
  const openEditModal = () => {
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditModalOpen(true);
    setEditError("");
  };

  // Handle edit submit (show password prompt)
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setPasswordPromptOpen(true);
    setPendingEdit({ username: editUsername, email: editEmail });
  };
  // Modified handlePasswordSubmit for email change verification
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      // If email changed, start verification flow
      if (pendingEdit.email !== user.email) {
        // Request email change OTP
        const res = await fetch(buildApiUrl("/mail-verification/request-email-change"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, newEmail: pendingEdit.email }),
        });
        const data = await res.json();
        if (!data.success) {
          setEditError(data.error || "Failed to send verification code");
          setEditLoading(false);
          return;
        }
        setShowEmailOtpModal(true);
        setPendingNewEmail(pendingEdit.email);
        setEditLoading(false);
        return;
      }
      // If email not changed, proceed as before
      const res = await fetch(buildApiUrl("/updateUser"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          id: user.id,
          username: pendingEdit.username,
          email: pendingEdit.email,
          password: editPassword,
        }),
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("user");
        navigate("/Login");
        return;
      }
      if (!res.ok) {
        const error = await res.text();
        setEditError(error || "Failed to update user");
        setEditLoading(false);
        return;
      }
      const updatedUser = await res.json();
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditModalOpen(false);
      setPasswordPromptOpen(false);
      setEditPassword("");
      setEditLoading(false);
      setEditError("");
    } catch (err) {
      setEditError("Something went wrong. Try again.");
      setEditLoading(false);
    }
  };

  // Handle OTP submit for email change
  const handleEmailOtpSubmit = async (e) => {
    e.preventDefault();
    setEmailOtpLoading(true);
    setEmailOtpError("");
    try {
      const res = await fetch(buildApiUrl("/mail-verification/verify-email-change"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, newEmail: pendingNewEmail, otp: emailOtp }),
      });
      const data = await res.json();
      if (!data.success) {
        setEmailOtpError(data.error || "Failed to verify code");
        setEmailOtpLoading(false);
        return;
      }
      // Update user in UI and localStorage
      const updatedUser = { ...user, email: pendingNewEmail };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowEmailOtpModal(false);
      setEditModalOpen(false);
      setPasswordPromptOpen(false);
      setEditPassword("");
      setEditLoading(false);
      setEditError("");
      setPendingNewEmail("");
      setEmailOtp("");
      setEmailOtpError("");
    } catch (err) {
      setEmailOtpError("Something went wrong. Try again.");
    }
    setEmailOtpLoading(false);
  };

  // Function to handle photo upload to backend
  const handleSavePhoto = async () => {
    if (!profilePhotoPreview) return;
    try {
      const res = await fetch(buildApiUrl("/uploadProfilePhoto"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: user?.token ? `Bearer ${user.token}` : undefined,
        },
        body: JSON.stringify({
          id: user.id,
          photo: profilePhotoPreview, // base64 string
        }),
      });
      if (!res.ok) {
        alert(await res.text() || "Failed to upload photo");
        return;
      }
      alert("Profile photo updated!");
    } catch (err) {
      alert("Something went wrong. Try again.");
    }
  };

  if (loading) {
    return (
      <>
        <div className="appHeader">
          Altar Designer
          <span>Design your own altar with custom backgrounds and sacred decor</span>
        </div>
        <div className="profile-loading-bg">
          <div className="profile-loading-spinner" />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      </>
    );
  }

  if (!user) return null;

  // SVG icon for link
  const LinkIcon = () => (
    <svg width="22" height="22" fill="#2196f3" viewBox="0 0 24 24" className="profile-link-svg"><path d="M17 7a5 5 0 0 0-7.07 0l-4.24 4.24a5 5 0 0 0 7.07 7.07l1.06-1.06a1 1 0 1 0-1.42-1.42l-1.06 1.06a3 3 0 1 1-4.24-4.24l4.24-4.24a3 3 0 0 1 4.24 4.24l-.88.88a1 1 0 1 0 1.42 1.42l.88-.88A5 5 0 0 0 17 7z"/></svg>
  );

  return (
    <>
      <div className="appHeader profile-header">
        Altar Designer
        <span>Design your own altar with custom backgrounds and sacred decor</span>
        <button
          className="profile-settings-btn"
          ref={settingsBtnRef}
          onClick={() => setSettingsOpen((open) => !open)}
        >
          <svg width="26" height="26" fill="#fff" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#2196f3" fillOpacity="0.13" />
            <path d="M12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7zm7-3.5c0-.46-.04-.91-.1-1.35l1.82-1.42a.5.5 0 0 0 .12-.65l-1.72-2.98a.5.5 0 0 0-.61-.23l-2.15.86a7.03 7.03 0 0 0-1.16-.68l-.33-2.3A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.5.42l-.33 2.3c-.41.18-.8.39-1.16.68l-2.15-.86a.5.5 0 0 0-.61.23l-1.72 2.98a.5.5 0 0 0 .12.65l1.82 1.42c-.06.44-.1.89-.1 1.35s.04.91.1 1.35l-1.82 1.42a.5.5 0 0 0-.12.65l1.72 2.98a.5.5 0 0 0 .61.23l2.15-.86c.36.29.75.5 1.16.68l.33 2.3A.5.5 0 0 0 10 22h4a.5.5 0 0 0 .5-.42l.33-2.3c.41-.18.8-.39 1.16-.68l2.15.86a.5.5 0 0 0 .61-.23l1.72-2.98a.5.5 0 0 0-.12-.65l-1.82-1.42c.06-.44.1-.89.1-1.35z" />
          </svg>
        </button>
        {settingsOpen && (
          <div
            ref={settingsMenuRef}
            className="profile-settings-menu"
          >
            <button className="profile-settings-menu-btn" onClick={() => {setSettingsOpen(false); openEditModal();}}>
              <svg width="12" height="12" fill="#2196f3" viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>
              Edit User
            </button>
            <button className="profile-settings-menu-btn" onClick={() => {setSettingsOpen(false); setChangePwdModalOpen(true); setChangePwdError(""); setChangePwdSuccess(""); setOldPassword(""); setNewPassword(""); setConfirmNewPassword("");}}>
              <svg width="12" height="12" fill="#2196f3" viewBox="0 0 24 24"><path d="M12 17a2 2 0 0 0 2-2v-2a2 2 0 0 0-4 0v2a2 2 0 0 0 2 2zm6-6V9a6 6 0 0 0-12 0v2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2zm-8-2a4 4 0 0 1 8 0v2H6V9z"/></svg>
              Change Password
            </button>
            <button className="profile-settings-menu-btn" onClick={() => { setSettingsOpen(false); navigate('/subscriptions'); }}>
              <svg width="12" height="12" fill="#2196f3" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              Subscriptions
            </button>
          </div>
        )}
      </div>
      {/* Edit User Modal */}
      {editModalOpen && (
        <div className="profile-edit-modal">
          <div className="profile-edit-modal-content">
            <div className="profile-edit-modal-header">
              <span className="profile-edit-modal-title">Edit User Details</span>
              <button onClick={() => { setEditModalOpen(false); setEditError(""); }} className="profile-edit-modal-close">×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="profile-edit-modal-form">
              <div className="profile-edit-modal-label">
                <span className="profile-edit-modal-label-text">Username</span>
                <input 
                  type="text" 
                  value={editUsername} 
                  onChange={e => setEditUsername(e.target.value)} 
                  className="profile-edit-modal-input" 
                  placeholder="Enter your username"
                  required 
                />
              </div>
              <div className="profile-edit-modal-label">
                <span className="profile-edit-modal-label-text">Email Address</span>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={e => setEditEmail(e.target.value)} 
                  className="profile-edit-modal-input" 
                  placeholder="Enter your email address"
                  required 
                />
              </div>
              {editError && <div className="profile-edit-modal-error">{editError}</div>}
              <button type="submit" className="profile-edit-modal-submit">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{marginRight: '8px'}}>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Update Profile
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Password Prompt Modal */}
      {passwordPromptOpen && (
        <div className="profile-edit-modal">
          <div className="profile-edit-modal-content">
            <div className="profile-edit-modal-header">
              <span className="profile-edit-modal-title">Security Verification</span>
              <button onClick={() => { setPasswordPromptOpen(false); setEditLoading(false); setEditPassword(""); setEditError(""); }} className="profile-edit-modal-close">×</button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="profile-edit-modal-form">
              <div className="profile-edit-modal-label">
                <span className="profile-edit-modal-label-text">Current Password</span>
                <input 
                  type="password" 
                  value={editPassword} 
                  onChange={e => setEditPassword(e.target.value)} 
                  className="profile-edit-modal-input" 
                  placeholder="Enter your current password"
                  required 
                  autoFocus 
                />
              </div>
              {editError && <div className="profile-edit-modal-error">{editError}</div>}
              <button type="submit" className="profile-edit-modal-submit" disabled={editLoading}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{marginRight: '8px'}}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {editLoading ? 'Verifying...' : 'Confirm & Update'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Email OTP Modal for Email Change */}
      {showEmailOtpModal && (
        <div className="profile-edit-modal">
          <div className="profile-edit-modal-content">
            <div className="profile-edit-modal-header">
              <span className="profile-edit-modal-title">Email Verification</span>
              <button onClick={() => { setShowEmailOtpModal(false); setEmailOtp(""); setEmailOtpError(""); setPendingNewEmail(""); }} className="profile-edit-modal-close">×</button>
            </div>
            <form onSubmit={handleEmailOtpSubmit} className="profile-edit-modal-form">
              <div style={{textAlign: 'center', marginBottom: '1rem', padding: '1rem', background: 'rgba(33, 150, 243, 0.1)', borderRadius: '12px', border: '1px solid rgba(33, 150, 243, 0.2)'}}>
                <svg width="24" height="24" fill="#2196f3" viewBox="0 0 24 24" style={{marginBottom: '0.5rem'}}>
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <div style={{fontWeight: 600, color: '#1769aa', marginBottom: '0.5rem'}}>Verification Code Sent</div>
                <div style={{fontSize: '0.9rem', color: '#666'}}>We've sent a 6-digit code to:</div>
                <div style={{fontWeight: 700, color: '#1769aa', marginTop: '0.3rem'}}>{pendingNewEmail}</div>
              </div>
              <div className="profile-edit-modal-label">
                <span className="profile-edit-modal-label-text">Verification Code</span>
                <input 
                  type="text" 
                  value={emailOtp} 
                  onChange={e => setEmailOtp(e.target.value)} 
                  className="profile-edit-modal-input" 
                  placeholder="Enter 6-digit code"
                  required 
                  maxLength={6}
                  style={{textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem', fontWeight: '600'}}
                />
              </div>
              {emailOtpError && <div className="profile-edit-modal-error">{emailOtpError}</div>}
              <button type="submit" className="profile-edit-modal-submit" disabled={emailOtpLoading}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{marginRight: '8px'}}>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                {emailOtpLoading ? 'Verifying...' : 'Verify & Update Email'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Change Password Modal */}
      {changePwdModalOpen && (
        <div className="profile-edit-modal">
          <div className="profile-edit-modal-content">
            <div className="profile-edit-modal-header">
              <span className="profile-edit-modal-title">Change Password</span>
              <button onClick={() => { setChangePwdModalOpen(false); setChangePwdError(""); setChangePwdSuccess(""); }} className="profile-edit-modal-close">×</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setChangePwdError("");
              setChangePwdSuccess("");
              if (!oldPassword || !newPassword || !confirmNewPassword) {
                setChangePwdError("All fields are required");
                return;
              }
              if (newPassword !== confirmNewPassword) {
                setChangePwdError("New passwords do not match");
                return;
              }
              if (!newPasswordValidation.isValid) {
                setChangePwdError("Please fix password requirements before changing password.");
                return;
              }
              setChangePwdLoading(true);
              try {
                const res = await fetch(buildApiUrl("/changePassword"), {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                  },
                  body: JSON.stringify({
                    id: user.id,
                    oldPassword,
                    newPassword,
                  }),
                });
                if (res.status === 401 || res.status === 403) {
                  localStorage.removeItem("user");
                  navigate("/Login");
                  return;
                }
                if (!res.ok) {
                  const error = await res.text();
                  setChangePwdError(error || "Failed to change password");
                  setChangePwdLoading(false);
                  return;
                }
                setChangePwdSuccess("Password updated successfully!");
                setChangePwdLoading(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                setTimeout(() => setChangePwdModalOpen(false), 1200);
              } catch (err) {
                setChangePwdError("Something went wrong. Try again.");
                setChangePwdLoading(false);
              }
            }} className="profile-edit-modal-form">
              <div className="profile-edit-modal-label">
                <span className="profile-edit-modal-label-text">Current Password</span>
                <input 
                  type="password" 
                  value={oldPassword} 
                  onChange={e => setOldPassword(e.target.value)} 
                  className="profile-edit-modal-input" 
                  placeholder="Enter your current password"
                  required 
                  autoFocus 
                />
              </div>
              <div className="profile-edit-modal-label">
                <span className="profile-edit-modal-label-text">New Password</span>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    value={newPassword} 
                    onChange={handleNewPasswordChange}
                    className="profile-edit-modal-input" 
                    placeholder="Enter your new password"
                    required 
                    style={{ 
                      border: `2px solid ${newPasswordValidation.isValid ? '#4caf50' : newPassword.length > 0 ? '#f44336' : 'rgba(33, 150, 243, 0.2)'}`,
                      paddingRight: '3.5em'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.2em',
                      color: '#666',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    {showNewPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              {newPassword.length > 0 && (
                <div style={{ 
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'rgba(33, 150, 243, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(33, 150, 243, 0.1)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5em', 
                    marginBottom: '0.8em',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1769aa'
                  }}>
                    <span>Password Strength:</span>
                    <span style={{ 
                      color: getPasswordStrengthColor(newPasswordValidation.strength),
                      fontWeight: 'bold'
                    }}>
                      {getPasswordStrengthText(newPasswordValidation.strength)}
                    </span>
                  </div>
                  <div style={{ 
                    height: '6px', 
                    background: '#e0e0e0', 
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '0.8em'
                  }}>
                    <div style={{
                      height: '100%',
                      background: getPasswordStrengthColor(newPasswordValidation.strength),
                      width: newPasswordValidation.strength === 'weak' ? '25%' : 
                            newPasswordValidation.strength === 'medium' ? '50%' : 
                            newPasswordValidation.strength === 'strong' ? '75%' : '100%',
                      transition: 'width 0.3s ease',
                      borderRadius: '3px'
                    }} />
                  </div>
                  {newPasswordValidation.errors.length > 0 && (
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#f44336',
                      lineHeight: '1.4'
                    }}>
                      {newPasswordValidation.errors.map((error, index) => (
                        <div key={index} style={{ 
                          marginBottom: '0.3em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5em'
                        }}>
                          <span style={{color: '#f44336', fontSize: '0.8em'}}>•</span>
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="profile-edit-modal-label">
                <span className="profile-edit-modal-label-text">Confirm New Password</span>
                <input 
                  type="password" 
                  value={confirmNewPassword} 
                  onChange={e => setConfirmNewPassword(e.target.value)} 
                  className="profile-edit-modal-input" 
                  placeholder="Confirm your new password"
                  required 
                  style={{ 
                    border: `2px solid ${newPassword === confirmNewPassword && confirmNewPassword.length > 0 ? '#4caf50' : confirmNewPassword.length > 0 ? '#f44336' : 'rgba(33, 150, 243, 0.2)'}`
                  }}
                />
              </div>
              {changePwdError && <div className="profile-edit-modal-error">{changePwdError}</div>}
              {changePwdSuccess && (
                <div style={{
                  color: '#4caf50',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  padding: '0.8rem 1rem',
                  background: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{fontSize: '1.2em'}}>✅</span>
                  {changePwdSuccess}
                </div>
              )}
              <button type="submit" className="profile-edit-modal-submit" disabled={changePwdLoading}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{marginRight: '8px'}}>
                  <path d="M12 17a2 2 0 0 0 2-2v-2a2 2 0 0 0-4 0v2a2 2 0 0 0 2 2zm6-6V9a6 6 0 0 0-12 0v2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2zm-8-2a4 4 0 0 1 8 0v2H6V9z"/>
                </svg>
                {changePwdLoading ? 'Updating Password...' : 'Change Password'}
              </button>
              <button 
                type="button" 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#1769aa', 
                  fontWeight: '600', 
                  fontSize: '1rem', 
                  cursor: 'pointer', 
                  marginTop: '1rem', 
                  textDecoration: 'underline', 
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  alignSelf: 'center'
                }} 
                onMouseEnter={(e) => e.target.style.color = '#2196f3'}
                onMouseLeave={(e) => e.target.style.color = '#1769aa'}
                onClick={() => { setChangePwdModalOpen(false); navigate('/forgot-password', { state: { email: user.email } }); }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Forgot Password?
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Email Modal for Authorized View Only */}
      {showEmailModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-card-wide">
            <h3 className="profile-email-modal-header">Enter allowed emails (press Enter after each)</h3>
            <div className="profile-email-chips-row">
              {viewEmails.map((email, idx) => (
                <span key={idx} className="profile-chip">
                  {email}
                  <button onClick={() => {
                    const newEmails = viewEmails.filter((e, i) => i !== idx);
                    setViewEmails(newEmails);
                    if (newEmails.length === 0) setGeneratedViewLink("");
                  }} className="profile-chip-remove">&times;</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={emailInput}
              onChange={e => { setEmailInput(e.target.value); setViewEmailError(""); }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  const val = emailInput.trim();
                  if (!val) return;
                  if (!isValidEmail(val)) {
                    setViewEmailError('Invalid email');
                    return;
                  }
                  if (viewEmails.includes(val)) {
                    setViewEmailError('Duplicate email');
                    return;
                  }
                  setViewEmails([...viewEmails, val]);
                  setEmailInput("");
                  setViewEmailError("");
                }
              }}
              placeholder="Type email and press Enter"
              className="profile-email-input"
            />
            {viewEmailError && <div className="profile-email-error">{viewEmailError}</div>}
            {generatedViewLink && (
              <div className="profile-link-modal-box">
                <div className="profile-link-modal-header">
                  <LinkIcon />
                  <span className="profile-link-modal-title">Invite-Only View Link</span>
                </div>
                <div className="profile-link-modal-linkbox">
                  <div className="profile-share-linkbox">
                    {generatedViewLink}
                  </div>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedViewLink); setCopyMsg('Copied!'); setTimeout(() => setCopyMsg(''), 1200); }}
                  className="profile-link-copy"
                >Copy</button>
                {copyMsg && <span className="profile-share-copymsg">{copyMsg}</span>}
              </div>
            )}
            <div className="profile-link-modal-btn-row">
              <button onClick={() => { setShowEmailModal(false); setViewEmails([]); setEmailInput(""); setViewEmailError(""); setGeneratedViewLink(""); setViewLinkLoading(false); setPendingWallId(null); }} className="profile-link-modal-cancel">Cancel</button>
              <button
                onClick={() => {
                  if (emailInput.trim()) {
                    if (!isValidEmail(emailInput.trim())) {
                      setViewEmailError('Invalid email');
                      return;
                    }
                    if (viewEmails.includes(emailInput.trim())) {
                      setViewEmailError('Duplicate email');
                      return;
                    }
                    setViewEmails([...viewEmails, emailInput.trim()]);
                    setEmailInput("");
                    setViewEmailError("");
                    return;
                  }
                  if (viewEmails.length === 0) {
                    setViewEmailError('Please enter at least one email.');
                    return;
                  }
                  handleAuthorizedViewShare(pendingWallId, viewEmails);
                  // Do not close modal or reset state here; let user see the link and close manually
                }}
                className="profile-link-modal-copy"
                disabled={viewLinkLoading}
              >
                {viewLinkLoading ? 'Generating...' : 'Generate Link'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Email Modal for Authorized Edit Only */}
      {showEditEmailModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-card-wide">
            <h3 className="profile-email-modal-header">Enter allowed emails for editing (press Enter after each)</h3>
            <div className="profile-email-chips-row">
              {editEmails.map((email, idx) => (
                <span key={idx} className="profile-chip">
                  {email}
                  <button onClick={() => {
                    const newEmails = editEmails.filter((e, i) => i !== idx);
                    setEditEmails(newEmails);
                    if (newEmails.length === 0) setGeneratedEditLink("");
                  }} className="profile-chip-remove">&times;</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={editEmailInput}
              onChange={e => { setEditEmailInput(e.target.value); setEditEmailError(""); }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  const val = editEmailInput.trim();
                  if (!val) return;
                  if (!isValidEmail(val)) {
                    setEditEmailError('Invalid email');
                    return;
                  }
                  if (editEmails.includes(val)) {
                    setEditEmailError('Duplicate email');
                    return;
                  }
                  setEditEmails([...editEmails, val]);
                  setEditEmailInput("");
                  setEditEmailError("");
                }
              }}
              placeholder="Type email and press Enter"
              className="profile-email-input"
            />
            {editEmailError && <div className="profile-email-error">{editEmailError}</div>}
            {generatedEditLink && (
              <div className="profile-link-modal-box">
                <div className="profile-link-modal-header">
                  <LinkIcon />
                  <span className="profile-link-modal-title">Invite-Only Edit Link</span>
                </div>
                <div className="profile-link-modal-linkbox">
                  <div className="profile-share-linkbox profile-share-linkbox-alt">
                    {generatedEditLink}
                  </div>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedEditLink); setCopyMsg('Copied!'); setTimeout(() => setCopyMsg(''), 1200); }}
                  className="profile-link-copy profile-link-copy-edit"
                >Copy</button>
                {copyMsg && <span className="profile-share-copymsg">{copyMsg}</span>}
              </div>
            )}
            <div className="profile-link-modal-btn-row">
              <button onClick={() => { setShowEditEmailModal(false); setEditEmails([]); setEditEmailInput(""); setEditEmailError(""); setGeneratedEditLink(""); setEditLinkLoading(false); setPendingEditWallId(null); }} className="profile-link-modal-cancel">Cancel</button>
              <button
                onClick={() => {
                  if (editEmailInput.trim()) {
                    if (!isValidEmail(editEmailInput.trim())) {
                      setEditEmailError('Invalid email');
                      return;
                    }
                    if (editEmails.includes(editEmailInput.trim())) {
                      setEditEmailError('Duplicate email');
                      return;
                    }
                    setEditEmails([...editEmails, editEmailInput.trim()]);
                    setEditEmailInput("");
                    setEditEmailError("");
                    return;
                  }
                  if (editEmails.length === 0) {
                    setEditEmailError('Please enter at least one email.');
                    return;
                  }
                  handleAuthorizedEditShare(pendingEditWallId, editEmails);
                  // Do not close modal or reset state here; let user see the link and close manually
                }}
                className="profile-link-modal-copy"
                disabled={editLinkLoading}
              >
                {editLinkLoading ? 'Generating...' : 'Generate Link'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Unauthorized View Link Modal */}
      {generatedUnauthorizedViewLink && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-card-wide">
           <button onClick={() => setGeneratedUnauthorizedViewLink("")} className="profile-share-close" title="Close">×</button>
            <div className="profile-share-header">
             <LinkIcon />
              <span className="profile-share-title">Shareable Link</span>
            </div>
            <div className="profile-share-linkbox">
              {generatedUnauthorizedViewLink}
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(generatedUnauthorizedViewLink); setCopyMsg('Copied!'); setTimeout(() => setCopyMsg(''), 1200); }}
              className="profile-link-copy"
            >Copy</button>
            {copyMsg && <span className="profile-share-copymsg">{copyMsg}</span>}
          </div>
        </div>
      )}
      {/* Unauthorized Edit Link Modal */}
      {generatedUnauthorizedEditLink && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-card-wide">
           <button onClick={() => setGeneratedUnauthorizedEditLink("")} className="profile-share-close" title="Close">×</button>
            <div className="profile-share-header">
             <LinkIcon />
              <span className="profile-share-title">Shareable Link</span>
            </div>
            <div className="profile-share-linkbox profile-share-linkbox-alt">
              {generatedUnauthorizedEditLink}
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(generatedUnauthorizedEditLink); setCopyMsg('Copied!'); setTimeout(() => setCopyMsg(''), 1200); }}
              className="profile-link-copy profile-link-copy-edit"
            >Copy</button>
            {copyMsg && <span className="profile-share-copymsg">{copyMsg}</span>}
          </div>
        </div>
      )}
      {/* Payment Modal */}
      <Subscriptions
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        currentPlan={subscription}
        onUpgrade={setSubscription}
      />
      {showUpgradeModal && (
        <div className="profile-payment-modal">
          <div className="subscriptions-modal-content" style={{maxWidth: 400, minWidth: 320, width: '100%'}}>
            <h2 className="subscriptions-title" style={{fontSize: '1.2em', marginBottom: 18}}>Upgrade to Premium</h2>
            <div style={{color: '#b71c1c', marginBottom: 18, fontWeight: 600}}>
              {upgradeMessage || "Only 3 drafts for free users. If you want more, please upgrade."}
            </div>
            <button
              className="subscriptions-plan-btn premium"
              onClick={() => {
                setShowUpgradeModal(false);
                navigate('/subscriptions');
              }}
            >
              Upgrade Now
            </button>
            <button
              className="profile-link-modal-cancel"
              style={{marginTop: 12}}
              onClick={() => setShowUpgradeModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="profile-bg-main">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-photo-container">
            <div
              className={`profile-photo-wrapper ${isPhotoHover ? 'profile-photo-hover' : ''}`}
              title="Profile Photo"
              onMouseEnter={() => setIsPhotoHover(true)}
              onMouseLeave={() => setIsPhotoHover(false)}
            >
              {profilePhotoPreview ? (
                <img
                  src={profilePhotoPreview.startsWith('data:') ? profilePhotoPreview : `data:image/*;base64,${profilePhotoPreview}`}
                  alt="Profile"
                  className="profile-photo-img"
                />
              ) : (
                <svg width="54" height="54" fill="#fff" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
                </svg>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="profile-btn profile-photo-upload-btn"
            >
              <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24" className="profile-btn-svg"><path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm8-10h-3.17l-1.84-2.63A2 2 0 0 0 13.42 3h-2.84a2 2 0 0 0-1.57.87L7.17 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm-8 10a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"/></svg>
              {profilePhotoPreview ? 'Change Photo' : 'Upload Photo'}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    setProfilePhoto(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setProfilePhotoPreview(reader.result);
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </button>
            <button
              type="button"
              onClick={handleSavePhoto}
              disabled={!profilePhotoPreview}
              className="profile-btn profile-save-photo-btn"
            >
              <svg width="20" height="20" fill={profilePhotoPreview ? '#1769aa' : '#b5b5d6'} viewBox="0 0 24 24" className="profile-btn-svg"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Save Photo
            </button>
            <h1 className="profile-title">
              Profile
            </h1>
            <div className="profile-info-card"><span className="profile-info-label">User ID</span><div className="profile-info-value">{user.id}</div></div>
            <div className="profile-info-card"><span className="profile-info-label">Username</span><div className="profile-info-value">{user.username}</div></div>
            <div className="profile-info-card"><span className="profile-info-label">Email</span><div className="profile-info-value">{user.email}</div></div>
            <div className="profile-subscription-row">
              <span className={`profile-subscription-badge${subscription === 'premium' ? ' pro' : subscription === 'pro' ? ' pro' : ''}`}>
                {subscription === 'premium' ? 'Premium' : subscription === 'pro' ? 'Pro' : 'Free'}
              </span>
              {subscriptionExpires && (
                <span style={{marginLeft: 12, fontWeight: 400, color: '#888', fontSize: '0.98em'}}>
                  (Expires: {formatExpiry(subscriptionExpires)})
                </span>
              )}
              {subscription === 'free' && (
                <button className="profile-upgrade-btn" onClick={() => setShowPaymentModal(true)}>Upgrade to Pro</button>
              )}
              {subscription === 'pro' && (
                <button className="profile-upgrade-btn" onClick={() => setShowPaymentModal(true)}>Upgrade to Premium</button>
              )}
            </div>
          </div>
          {/* Button Group: Delete User and Logout */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.7em", marginTop: "1.5em" }}>
            <button
              onClick={async () => {
                const password = prompt("Please enter your password to delete your account:");
                if (!password) return;
                try {
                  const res = await fetch(buildApiUrl("/deleteUser"), {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
                    body: JSON.stringify({ username: user.username, password }),
                  });
                  if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("user");
                    navigate("/Login");
                    return;
                  }
                  if (!res.ok) {
                    const error = await res.text();
                    alert("Failed to delete user: " + error);
                    return;
                  }
                  alert("User deleted successfully");
                  localStorage.removeItem("user");
                  navigate("/Login");
                } catch (err) {
                  alert("Something went wrong while deleting the user.");
                }
              }}
              className="profile-btn profile-btn-delete"
            >
              Delete User
            </button>
          <button
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/Login");
            }}
            className="profile-btn profile-btn-logout"
          >
            Logout
          </button>
          </div>
        </div>
        {/* Drafts Section OUTSIDE profile card */}
        <div className="profile-drafts-section">
          <div className="profile-drafts-inner">
            <h2 className="profile-drafts-title">Your Drafts</h2>
            {!anySharingEnabled && (
              <div style={{ 
                color: '#b71c1c', 
                fontWeight: 600, 
                fontSize: '0.9em', 
                marginBottom: '1em',
                padding: '0.8em',
                background: '#ffebee',
                borderRadius: '8px',
                border: '1px solid #ffcdd2'
              }}>
                ⚠️ Sharing is disabled for your current plan. Upgrade to enable sharing features.
              </div>
            )}
            {drafts.length === 0 ? (
              <div className="profile-drafts-empty">No drafts saved yet.</div>
            ) : (
              <ul className="profile-drafts-list">
                {drafts.map((draft, idx) => (
                  <li
                    key={draft.timestamp}
                    className="profile-draft-card"
                  >
                    <span className="profile-draft-card-title">
                      {draft.name || `Draft ${idx + 1}`}
                    </span>
                    <div className="profile-draft-card-btns">
                      <button
                        className="profile-btn profile-draft-load-btn"
                        onClick={() =>
                          navigate("/mainWall", { state: { draft } })
                        }
                      >
                        Load
                      </button>
                      <button
                        className="profile-btn profile-draft-delete-btn"
                        onClick={() => handleDeleteDraft(draft.wall_id)}
                      >
                        Delete
                      </button>
                      <button
                        className="profile-btn profile-draft-share-btn"
                        onClick={() => {
                          if (!anySharingEnabled) {
                            const upgrade = confirm('Sharing is only available for premium users. Would you like to upgrade your plan?');
                            if (upgrade) {
                              window.location.href = '/subscriptions';
                            }
                            return;
                          }
                          setShareMenuOpen(draft.wall_id);
                        }}
                        style={{
                          opacity: anySharingEnabled ? 1 : 0.6,
                          cursor: anySharingEnabled ? 'pointer' : 'not-allowed',
                          background: anySharingEnabled ? undefined : '#e0e7ef',
                          color: anySharingEnabled ? undefined : '#b5b5d6',
                        }}
                        disabled={!anySharingEnabled}
                        title={!anySharingEnabled ? 'Upgrade required for sharing' : 'Share this draft'}
                      >
                        Share
                        {!anySharingEnabled && (
                          <span style={{ fontSize: '0.8em', marginLeft: '0.3em', opacity: 0.8 }}>
                            🔒
                          </span>
                        )}
                        {shareMenuOpen === draft.wall_id && anySharingEnabled && (
                          <div
                            ref={shareMenuRef}
                            className="profile-share-menu"
                          >
                            <button
                              className="profile-share-menu-btn profile-share-menu-parent"
                              onClick={() => {
                                setAuthorizedSubMenuOpen(authorizedSubMenuOpen === draft.wall_id ? null : draft.wall_id);
                                setUnauthorizedSubMenuOpen(null);
                              }}
                            >
                              Authorized
                              {authorizedSubMenuOpen === draft.wall_id && (
                                <div className="profile-share-submenu profile-share-submenu-dropdown">
                                  <button
                                    className="profile-share-menu-btn"
                                    onClick={() => {
                                      if (!shareAuthViewEnabled) {
                                        const upgrade = confirm('Authorized View sharing is only available for premium users. Would you like to upgrade your plan?');
                                        if (upgrade) {
                                          window.location.href = '/subscriptions';
                                        }
                                        return;
                                      }
                                      setShowEmailModal(true);
                                      setPendingWallId(draft.wall_id);
                                      setShareMenuOpen(null);
                                      setAuthorizedSubMenuOpen(null);
                                    }}
                                    style={{
                                      opacity: shareAuthViewEnabled ? 1 : 0.6,
                                      cursor: shareAuthViewEnabled ? 'pointer' : 'not-allowed',
                                    }}
                                    disabled={!shareAuthViewEnabled}
                                  >
                                    View {!shareAuthViewEnabled && '🔒'}
                                  </button>
                                  <button
                                    className="profile-share-menu-btn"
                                    onClick={() => {
                                      if (!shareAuthEditEnabled) {
                                        const upgrade = confirm('Authorized Edit sharing is only available for premium users. Would you like to upgrade your plan?');
                                        if (upgrade) {
                                          window.location.href = '/subscriptions';
                                        }
                                        return;
                                      }
                                      setShowEditEmailModal(true);
                                      setPendingEditWallId(draft.wall_id);
                                      setShareMenuOpen(null);
                                      setAuthorizedSubMenuOpen(null);
                                    }}
                                    style={{
                                      opacity: shareAuthEditEnabled ? 1 : 0.6,
                                      cursor: shareAuthEditEnabled ? 'pointer' : 'not-allowed',
                                    }}
                                    disabled={!shareAuthEditEnabled}
                                  >
                                    Edit {!shareAuthEditEnabled && '🔒'}
                                  </button>
                                </div>
                              )}
                            </button>
                            <button
                              className="profile-share-menu-btn profile-share-menu-parent"
                              onClick={() => {
                                setUnauthorizedSubMenuOpen(unauthorizedSubMenuOpen === draft.wall_id ? null : draft.wall_id);
                                setAuthorizedSubMenuOpen(null);
                              }}
                            >
                              Unauthorized
                              {unauthorizedSubMenuOpen === draft.wall_id && (
                                <div className="profile-share-submenu profile-share-submenu-dropdown">
                                  <button
                                    className="profile-share-menu-btn"
                                    onClick={() => {
                                      if (!shareUnauthViewEnabled) {
                                        const upgrade = confirm('Unauthorized View sharing is only available for premium users. Would you like to upgrade your plan?');
                                        if (upgrade) {
                                          window.location.href = '/subscriptions';
                                        }
                                        return;
                                      }
                                      handlePublicShare(draft.wall_id);
                                      setShareMenuOpen(null);
                                      setUnauthorizedSubMenuOpen(null);
                                    }}
                                    style={{
                                      opacity: shareUnauthViewEnabled ? 1 : 0.6,
                                      cursor: shareUnauthViewEnabled ? 'pointer' : 'not-allowed',
                                    }}
                                    disabled={!shareUnauthViewEnabled}
                                  >
                                    View {!shareUnauthViewEnabled && '🔒'}
                                  </button>
                                  <button
                                    className="profile-share-menu-btn"
                                    onClick={() => {
                                      if (!shareUnauthEditEnabled) {
                                        const upgrade = confirm('Unauthorized Edit sharing is only available for premium users. Would you like to upgrade your plan?');
                                        if (upgrade) {
                                          window.location.href = '/subscriptions';
                                        }
                                        return;
                                      }
                                      handleEditShare(draft.wall_id);
                                      setShareMenuOpen(null);
                                      setUnauthorizedSubMenuOpen(null);
                                    }}
                                    style={{
                                      opacity: shareUnauthEditEnabled ? 1 : 0.6,
                                      cursor: shareUnauthEditEnabled ? 'pointer' : 'not-allowed',
                                    }}
                                    disabled={!shareUnauthEditEnabled}
                                  >
                                    Edit {!shareUnauthEditEnabled && '🔒'}
                                  </button>
                                </div>
                              )}
                            </button>
                          </div>
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
