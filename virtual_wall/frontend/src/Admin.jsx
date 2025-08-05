import React, { useState, useEffect } from "react";
import Wall from "./wall.jsx";
import { useNavigate } from "react-router-dom";
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from './utils/passwordValidation';
import { buildApiUrl } from './config/api';
import API_CONFIG from './config/api';
import { APP_CONSTANTS } from './config/constants';
import './admin.css';

function PasswordPromptModal({ open, onConfirm, onCancel, label }) {
  const [password, setPassword] = useState("");
  if (!open) return null;
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content">
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">{label || "Enter Password"}</h2>
          <button className="admin-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="admin-modal-form">
          <div className="admin-modal-input-group">
            <label className="admin-modal-label">Admin Password</label>
            <input
              type="password"
              className="admin-modal-input"
              placeholder="Enter your admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          <div className="admin-modal-actions">
            <button className="admin-modal-btn admin-modal-btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button 
              className="admin-modal-btn admin-modal-btn-primary" 
              onClick={() => { 
                onConfirm(password); 
                setPassword(""); 
              }}
              disabled={!password.trim()}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddUserModal({ open, onAdd, onCancel }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({ isValid: false, errors: [], strength: 'weak' });
  const [showPassword, setShowPassword] = useState(false);
  
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const validation = validatePassword(newPassword);
    setPasswordValidation(validation);
  };
  
  if (!open) return null;
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content">
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">Add New User</h2>
          <button className="admin-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="admin-modal-form">
          <div className="admin-modal-input-group">
            <label className="admin-modal-label">Username</label>
            <input 
              type="text" 
              className="admin-modal-input"
              placeholder="Enter username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
          </div>
          
          <div className="admin-modal-input-group">
            <label className="admin-modal-label">Email</label>
            <input 
              type="email" 
              className="admin-modal-input"
              placeholder="Enter email address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          
          <div className="admin-modal-input-group">
            <label className="admin-modal-label">Role</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)} 
              className="admin-modal-select"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="admin-modal-input-group">
            <label className="admin-modal-label">Password</label>
            <div className="admin-modal-password-group">
              <input 
                type={showPassword ? "text" : "password"} 
                className="admin-modal-password-input"
                placeholder="Enter password" 
                value={password} 
                onChange={handlePasswordChange}
                style={{
                  borderColor: passwordValidation.isValid ? '#4caf50' : password.length > 0 ? '#f44336' : '#e5e7eb'
                }}
              />
              <button
                type="button"
                className="admin-modal-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {password.length > 0 && (
              <div className="admin-modal-password-strength">
                <div className="admin-modal-strength-header">
                  <span>Password Strength:</span>
                  <span 
                    className="admin-modal-strength-text"
                    style={{ color: getPasswordStrengthColor(passwordValidation.strength) }}
                  >
                    {getPasswordStrengthText(passwordValidation.strength)}
                  </span>
                </div>
                <div className="admin-modal-strength-bar">
                  <div 
                    className="admin-modal-strength-progress"
                    style={{
                      background: getPasswordStrengthColor(passwordValidation.strength),
                      width: passwordValidation.strength === 'weak' ? '25%' : 
                            passwordValidation.strength === 'medium' ? '50%' : 
                            passwordValidation.strength === 'strong' ? '75%' : '100%'
                    }}
                  />
                </div>
                {passwordValidation.errors.length > 0 && (
                  <div className="admin-modal-strength-errors">
                    <ul>
                      {passwordValidation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {error && <div className="admin-modal-error">{error}</div>}
          
          <div className="admin-modal-actions">
            <button className="admin-modal-btn admin-modal-btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button 
              className="admin-modal-btn admin-modal-btn-primary" 
              onClick={async () => {
                setError("");
                if (!username || !email || !role || !password) {
                  setError("All fields are required");
                  return;
                }
                if (!passwordValidation.isValid) {
                  setError("Please fix password requirements before adding user.");
                  return;
                }
                await onAdd({ username, email, role, password, setError });
              }}
              disabled={!username || !email || !password || !passwordValidation.isValid}
            >
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [view, setView] = useState(null); // 'users', 'drafts', 'plans', 'dashboard'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const allSelected = users.length > 0 && selectedUsers.length === users.length;
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFields, setEditFields] = useState({ username: '', email: '', role: 'user', plan_id: null, subscription_expires: '' });
  const [drafts, setDrafts] = useState([]);
  const [showDraftsFor, setShowDraftsFor] = useState(null); // user object or null
  const [previewDraft, setPreviewDraft] = useState(null); // holds the draft object to preview
  const [passwordPrompt, setPasswordPrompt] = useState({ open: false, label: '', onConfirm: null });
  const [addUserModal, setAddUserModal] = useState(false);
  const [pendingAddUser, setPendingAddUser] = useState(null); // store user data before password
  const [userDraftsPanel, setUserDraftsPanel] = useState({ open: false, user: null, drafts: [], loading: false, error: "" });
  const [userDetailsPanel, setUserDetailsPanel] = useState({ open: false, user: null, loading: false, error: "" });
  const [userPhotos, setUserPhotos] = useState({}); // userId -> base64 photo
  const [adminPhoto, setAdminPhoto] = useState(null);
  const [userDetailsPhoto, setUserDetailsPhoto] = useState(null);
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [otpUserId, setOtpUserId] = useState(null);
  const [otpNewEmail, setOtpNewEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [showAddUserOtpModal, setShowAddUserOtpModal] = useState(false);
  const [addUserOtpEmail, setAddUserOtpEmail] = useState("");
  const [addUserOtpValue, setAddUserOtpValue] = useState("");
  const [addUserOtpError, setAddUserOtpError] = useState("");
  const [addUserOtpLoading, setAddUserOtpLoading] = useState(false);
  const [plansPanel, setPlansPanel] = useState({ open: false, loading: false, error: '', plans: [] });
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingOtpUserId, setPendingOtpUserId] = useState(null);
  const [pendingOtpEmail, setPendingOtpEmail] = useState('');
  const [resendOtpLoading, setResendOtpLoading] = useState(false);
  const [resendOtpDisabled, setResendOtpDisabled] = useState(false);
  const [resendOtpCountdown, setResendOtpCountdown] = useState(0);
  const [otpCountdown, setOtpCountdown] = useState(300); // 5 minutes
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Fetch admin's profile photo on mount
    const adminUser = JSON.parse(localStorage.getItem("user"));
    if (adminUser && adminUser.id && adminUser.token) {
      fetch(buildApiUrl(`/profilePhoto/${adminUser.id}`), {
        headers: { Authorization: `Bearer ${adminUser.token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.photo) setAdminPhoto(data.photo);
        });
    }
    fetch(buildApiUrl('/api/admin/plans'))
      .then(res => res.json())
      .then(data => setPlans(data))
      .catch(() => setPlans([]));
  }, []);

  useEffect(() => {
    if (showEmailOtpModal) {
      setOtpCountdown(300);
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
    }
  }, [showEmailOtpModal, resendOtpDisabled]);

  const handleShowUsers = async () => {
    setView('users');
    setPlansPanel({ open: false, loading: false, error: '', plans: [] });
    setLoading(true);
    setError("");
    setSelectedUsers([]);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_USERS), {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUsers(data);
      // Fetch profile photos for all users
      const photoResults = await Promise.all(
        data.map(async (u) => {
          try {
            const res = await fetch(buildApiUrl(`/profilePhoto/${u.id}`), {
              headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
              const d = await res.json();
              return [u.id, d.photo || null];
            }
          } catch {}
          return [u.id, null];
        })
      );
      setUserPhotos(Object.fromEntries(photoResults));
    } catch (err) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    const confirm = window.confirm(`Are you sure you want to delete user '${username}'? This cannot be undone.`);
    if (!confirm) return;
    setPasswordPrompt({
      open: true,
      label: 'Please enter your admin password to confirm deletion:',
      onConfirm: async (adminPassword) => {
        setPasswordPrompt({ open: false, label: '', onConfirm: null });
        if (!adminPassword) return;
        setLoading(true);
        setError("");
        try {
          const adminUser = JSON.parse(localStorage.getItem("user"));
          const res = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN_USER}/${userId}`), {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminUser.token}`,
            },
            body: JSON.stringify({
              adminUsername: adminUser.username,
              adminPassword,
            }),
          });
          if (!res.ok) throw new Error(await res.text());
          setUsers(users => users.filter(u => u.id !== userId));
          setSelectedUsers(selectedUsers => selectedUsers.filter(id => id !== userId));
        } catch (err) {
          setError(err.message || "Failed to delete user");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(selected =>
      selected.includes(userId)
        ? selected.filter(id => id !== userId)
        : [...selected, userId]
    );
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    const confirm = window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This cannot be undone.`);
    if (!confirm) return;
    setPasswordPrompt({
      open: true,
      label: 'Please enter your admin password to confirm deletion:',
      onConfirm: async (adminPassword) => {
        setPasswordPrompt({ open: false, label: '', onConfirm: null });
        if (!adminPassword) return;
        setLoading(true);
        setError("");
        try {
          const adminUser = JSON.parse(localStorage.getItem("user"));
          for (const userId of selectedUsers) {
            const res = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN_USER}/${userId}`), {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminUser.token}`,
              },
              body: JSON.stringify({
                adminUsername: adminUser.username,
                adminPassword,
              }),
            });
            if (!res.ok) throw new Error(await res.text());
          }
          setUsers(users => users.filter(u => !selectedUsers.includes(u.id)));
          setSelectedUsers([]);
        } catch (err) {
          setError(err.message || "Failed to delete users");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditFields({
      username: user.username,
      email: user.email,
      role: user.role,
      plan_id: user.plan_id || null,
      subscription_expires: user.subscription_expires || ''
    });
  };

  const handleEditFieldChange = (field, value) => {
    setEditFields(fields => ({ ...fields, [field]: value }));
  };

  const handleEditCancel = () => {
    setEditingUserId(null);
    setEditFields({ username: '', email: '', role: 'user', plan_id: null, subscription_expires: '' });
  };

  // Modified handleEditSave to trigger OTP modal if verification is required
  const handleEditSave = async (userId) => {
    setPasswordPrompt({
      open: true,
      label: 'Please enter your admin password to confirm changes:',
      onConfirm: async (adminPassword) => {
        setPasswordPrompt({ open: false, label: '', onConfirm: null });
        if (!adminPassword) return;
        setLoading(true);
        setError("");
        try {
          const adminUser = JSON.parse(localStorage.getItem("user"));
          
          // Check if role is being changed
          const originalUser = users.find(u => u.id === userId);
          const isRoleChanged = originalUser && originalUser.role !== editFields.role;
          
          if (isRoleChanged) {
            // Show confirmation for role changes
            const isPromotingToAdmin = originalUser.role !== 'admin' && editFields.role === 'admin';
            const isDemotingFromAdmin = originalUser.role === 'admin' && editFields.role === 'user';
            
            let confirmMessage = '';
            if (isPromotingToAdmin) {
              confirmMessage = `Are you sure you want to promote ${originalUser.username} to admin? This will automatically upgrade them to premium plan.`;
            } else if (isDemotingFromAdmin) {
              confirmMessage = `Are you sure you want to demote ${originalUser.username} from admin to user? This will give them premium status for 1 month.`;
            } else {
              confirmMessage = `Are you sure you want to change ${originalUser.username}'s role from ${originalUser.role} to ${editFields.role}?`;
            }
            
            const confirmed = window.confirm(confirmMessage);
            if (!confirmed) {
              setLoading(false);
              return;
            }
            // Use the new role-specific endpoint for role changes
            const roleRes = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN_USER}/${userId}/role`), {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminUser.token}`,
              },
              body: JSON.stringify({ role: editFields.role }),
            });
            
            const roleText = await roleRes.text();
            if (!roleRes.ok) throw new Error(roleText);
            
            // Parse the response to get the success message
            let roleData;
            try {
              roleData = JSON.parse(roleText);
            } catch (e) {
              roleData = null;
            }
            
            if (roleData && roleData.success) {
              // Show success message for role change
              setError(""); // Clear any previous errors
              setSuccessMessage(roleData.message);
              // Clear success message after 5 seconds
              setTimeout(() => setSuccessMessage(""), 5000);
            }
          }
          
          // For other fields (username, email, plan_id, subscription_expires), use the original endpoint
          const requestBody = { ...editFields, adminUsername: adminUser.username, adminPassword };
          const res = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN_USER}/${userId}`), {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminUser.token}`,
            },
            body: JSON.stringify(requestBody),
          });
          
          const text = await res.text();
          
          if (!res.ok) throw new Error(text);
          
          // Try to parse as JSON to check for verificationRequired
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            data = null;
          }
          
          if (data && data.verificationRequired) {
            setShowEmailOtpModal(true);
            setOtpUserId(userId);
            setOtpNewEmail(data.pendingEmail || editFields.email);
            setOtpValue("");
            setOtpError("");
            setOtpLoading(false);
            // Start countdown for resend button
            setResendOtpDisabled(true);
            setResendOtpCountdown(60);
            const countdownInterval = setInterval(() => {
              setResendOtpCountdown(prev => {
                if (prev <= 1) {
                  clearInterval(countdownInterval);
                  setResendOtpDisabled(false);
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
            setEditingUserId(null);
            setEditFields({ username: '', email: '', role: 'user', plan_id: null, subscription_expires: '' });
            setLoading(false);
            return;
          }
          // Re-fetch users to get latest subscription/role changes
          await handleShowUsers();
          // If the current user was edited, update localStorage
          const currentUser = JSON.parse(localStorage.getItem('user'));
          if (currentUser && currentUser.id === userId) {
            // Fetch the latest user info from the backend
            const res = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN_USER}/${userId}`), {
              headers: { Authorization: `Bearer ${currentUser.token}` },
            });
            if (res.ok) {
              const updatedUser = await res.json();
              // Preserve the token
              updatedUser.token = currentUser.token;
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          }
          setEditingUserId(null);
          setEditFields({ username: '', email: '', role: 'user', plan_id: null, subscription_expires: '' });
        } catch (err) {
          setError(err.message || "Failed to update user");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Show drafts for a specific user in a side panel
  const handleShowUserDrafts = async (user) => {
    setUserDraftsPanel({ open: true, user, drafts: [], loading: true, error: "" });
    try {
      const adminUser = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(buildApiUrl(`/getDrafts/${user.id}`), {
        headers: { Authorization: `Bearer ${adminUser.token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // decode wall_data
      const decodedDrafts = data.map((draft) => {
        let decoded = {};
        try {
          decoded = JSON.parse(atob(draft.wall_data));
        } catch {}
        return {
          ...decoded,
          wall_id: draft.wall_id,
          timestamp: draft.timestamp,
          name: decoded.name || draft.wall_name || `Draft ${draft.wall_id}`,
        };
      });
      setUserDraftsPanel({ open: true, user, drafts: decodedDrafts, loading: false, error: "" });
    } catch (err) {
      setUserDraftsPanel({ open: true, user, drafts: [], loading: false, error: err.message || "Failed to fetch drafts" });
    }
  };

  // Add user handler (now triggers password prompt)
  const handleAddUser = async ({ username, email, role, password, setError }) => {
    setPendingAddUser({ username, email, role, password, setError });
    setPasswordPrompt({
      open: true,
      label: 'Please enter your admin password to add a new user:',
      onConfirm: async (adminPassword) => {
        setPasswordPrompt({ open: false, label: '', onConfirm: null });
        if (!adminPassword) return;
        setLoading(true);
        setError("");
        try {
          const adminUser = JSON.parse(localStorage.getItem("user"));
          const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_USER), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminUser.token}`,
            },
            body: JSON.stringify({
              username,
              email,
              role,
              password,
              adminUsername: adminUser.username,
              adminPassword,
            }),
          });
          if (!res.ok) {
            const errMsg = await res.text();
            setError(errMsg);
            setLoading(false);
            return;
          }
          const newUser = await res.json();
          setUsers(users => [...users, newUser]);
          setAddUserModal(false);
          // Show OTP modal for verification
          setShowAddUserOtpModal(true);
          setAddUserOtpEmail(email);
          setAddUserOtpValue("");
          setAddUserOtpError("");
          setAddUserOtpLoading(false);
        } catch (err) {
          setError(err.message || "Failed to add user");
        } finally {
          setLoading(false);
          setPendingAddUser(null);
        }
      }
    });
  };

  // Show all drafts in a side panel
  const handleShowAllDrafts = async () => {
    setView('drafts');
    setDrafts([]);
    setPlansPanel({ open: false, loading: false, error: '', plans: [] });
    setLoading(true);
    setError("");
    try {
      const adminUser = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_DRAFTS), {
        headers: { Authorization: `Bearer ${adminUser.token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // decode wall_data
      const decodedDrafts = data.map((draft) => {
        let decoded = {};
        try {
          decoded = JSON.parse(atob(draft.wall_data));
        } catch {}
        return {
          ...decoded,
          wall_id: draft.wall_id,
          timestamp: draft.timestamp,
          name: decoded.name || draft.wall_name || `Draft ${draft.wall_id}`,
          uid: draft.uid,
        };
      });
      setDrafts(decodedDrafts);
    } catch (err) {
      setError(err.message || "Failed to fetch drafts");
    } finally {
      setLoading(false);
    }
  };

  // Handler to show plans
  const handleShowPlans = async () => {
    setView('plans');
    setPlansPanel({ open: true, loading: true, error: '', plans: [] });
    try {
      const res = await fetch(buildApiUrl('/api/admin/plans'));
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPlansPanel({ open: true, loading: false, error: '', plans: data });
    } catch (err) {
      setPlansPanel({ open: true, loading: false, error: err.message || 'Failed to fetch plans', plans: [] });
    }
  };

  const handleShowDashboard = async () => {
    setView('dashboard');
    setError("");
    setLoading(true);
    
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
      // Load users data
      const usersRes = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_USERS), {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!usersRes.ok) throw new Error('Failed to fetch users');
      const usersData = await usersRes.json();
      setUsers(usersData);
      
      // Load drafts data
      const draftsRes = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_DRAFTS), {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!draftsRes.ok) throw new Error('Failed to fetch drafts');
      const draftsData = await draftsRes.json();
      setDrafts(draftsData);
      
      // Load plans data
      const plansRes = await fetch(buildApiUrl('/api/admin/plans'));
      if (!plansRes.ok) throw new Error('Failed to fetch plans');
      const plansData = await plansRes.json();
      setPlansPanel(prev => ({ ...prev, plans: plansData }));
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // Handler to fetch and show user details
  const handleShowUserDetails = async (userId) => {
    setUserDetailsPanel({ open: true, user: null, loading: true, error: "" });
    setUserDetailsPhoto(null);
    try {
      const adminUser = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN_USER}/${userId}`), {
        headers: { Authorization: `Bearer ${adminUser.token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const user = await res.json();
      setUserDetailsPanel({ open: true, user, loading: false, error: "" });
      // Fetch profile photo for user details
      try {
        const photoRes = await fetch(buildApiUrl(`/profilePhoto/${userId}`), {
          headers: { Authorization: `Bearer ${adminUser.token}` }
        });
        if (photoRes.ok) {
          const d = await photoRes.json();
          if (d && d.photo) setUserDetailsPhoto(d.photo);
        }
      } catch {}
    } catch (err) {
      setUserDetailsPanel({ open: true, user: null, loading: false, error: err.message || "Failed to fetch user details" });
    }
  };

  // Handle OTP submit for email change
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch(buildApiUrl("/mail-verification/verify-email-change"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: otpUserId, newEmail: otpNewEmail, otp: otpValue }),
      });
      const data = await res.json();
      if (!data.success) {
        setOtpError(data.error || "Failed to verify code");
        setOtpLoading(false);
        return;
      }
      setUsers(users => users.map(u => u.id === otpUserId ? { ...u, email: otpNewEmail } : u));
      setShowEmailOtpModal(false);
      setOtpUserId(null);
      setOtpNewEmail("");
      setOtpValue("");
      setOtpError("");
    } catch (err) {
      setOtpError("Something went wrong. Try again.");
    }
    setOtpLoading(false);
  };

  // Handle OTP submit for admin user creation
  const handleAddUserOtpSubmit = async (e) => {
    e.preventDefault();
    setAddUserOtpLoading(true);
    setAddUserOtpError("");
    try {
      const res = await fetch(buildApiUrl("/mail-verification/verify-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addUserOtpEmail, otp: addUserOtpValue }),
      });
      const data = await res.json();
      if (!data.success) {
        setAddUserOtpError(data.error || "Failed to verify code");
        setAddUserOtpLoading(false);
        return;
      }
      setShowAddUserOtpModal(false);
      setAddUserOtpEmail("");
      setAddUserOtpValue("");
      setAddUserOtpError("");
    } catch (err) {
      setAddUserOtpError("Something went wrong. Try again.");
    }
    setAddUserOtpLoading(false);
  };

  const handleResendOtp = async () => {
    setResendOtpLoading(true);
    setOtpError('');
    try {
      const adminUser = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_RESEND_EMAIL_CHANGE_OTP), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: JSON.stringify({ userId: pendingOtpUserId }),
      });
      const data = await res.json();
      if (!data.success) {
        setOtpError(data.error || "Failed to resend OTP");
        setResendOtpLoading(false);
        return;
      }
      // Start countdown
      setResendOtpDisabled(true);
      setResendOtpCountdown(60);
      const countdownInterval = setInterval(() => {
        setResendOtpCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setResendOtpDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      alert('OTP resent successfully!');
    } catch (err) {
      setOtpError("Something went wrong. Try again.");
    }
    setResendOtpLoading(false);
  };

  return (
    <div className="admin-container">
      {/* Modern Admin Header */}
      <header className="admin-page-header">
        <button
          className="admin-home-btn"
          onClick={() => navigate('/')}
          title="Go to Home"
        >
          <svg width="28" height="28" fill="#fff" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </button>
        <div className="admin-header-content">
          <div className="admin-header-logo">
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24" className="admin-logo-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="admin-header-title">Admin Dashboard</span>
          </div>
          <div className="admin-header-subtitle">
            Manage users, drafts, and system settings
          </div>
        </div>
      </header>

      <div className="admin-flex-row">
        <div className="admin-panel">
          <div className="admin-card">
            <div className="admin-header">
              <div className="admin-avatar" style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: '#e9eafc', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {adminPhoto ? (
                  <img
                    src={adminPhoto.startsWith('data:') ? adminPhoto : `data:image/*;base64,${adminPhoto}`}
                    alt="Admin Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  <svg width="72" height="72" fill="#b5b5d6" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="5" fill="#2196f3" />
                    <path d="M12 14c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5z" fill="#1769aa" />
                  </svg>
                )}
              </div>
              <div>
                <h1 className="admin-title">Admin Panel</h1>
                <h2 className="admin-subtitle">Manage Users & Drafts</h2>
              </div>
            </div>
            <div className="admin-btn-group">
              <button className="admin-btn" onClick={handleShowDashboard}>
                <span className="admin-btn-icon">📊</span> Dashboard
              </button>
              <button className="admin-btn" onClick={handleShowUsers}>
                <span className="admin-btn-icon">👤</span> Show All Users
              </button>
              <button className="admin-btn" onClick={handleShowAllDrafts}>
                <span className="admin-btn-icon">🗂️</span> Show All Drafts
              </button>
              <button className="admin-btn" onClick={handleShowPlans}>
                <span className="admin-btn-icon">📋</span> Manage Plans
              </button>
            </div>
            <div className="admin-section">
              {view === 'drafts' && <div className="admin-placeholder"></div>}
              {!view && <p className="admin-welcome">Welcome, Admin! Here you can manage the application.</p>}
            </div>
          </div>
        </div>
        <div className="admin-divider" />
        {view === 'dashboard' && (
          <div className="admin-dashboard-panel">
            <h2 className="admin-dashboard-heading">Admin Dashboard</h2>
            {loading && <div className="admin-placeholder">Loading dashboard data...</div>}
            {error && <div className="admin-placeholder admin-error">{error}</div>}
            {!loading && !error && (
              <>
                <div className="admin-dashboard-stats">
                  <div className="admin-stat-card">
                    <h3>Total Users</h3>
                    <p className="admin-stat-number">{users.length}</p>
                  </div>
                  <div className="admin-stat-card">
                    <h3>Total Drafts</h3>
                    <p className="admin-stat-number">{drafts.length}</p>
                  </div>
                  <div className="admin-stat-card">
                    <h3>Active Plans</h3>
                    <p className="admin-stat-number">{plansPanel.plans.length}</p>
                  </div>
                </div>
                <div className="admin-dashboard-actions">
                  <button className="admin-btn" onClick={handleShowUsers}>
                    <span className="admin-btn-icon">👤</span> Manage Users
                  </button>
                  <button className="admin-btn" onClick={handleShowAllDrafts}>
                    <span className="admin-btn-icon">🗂️</span> View All Drafts
                  </button>
                  <button className="admin-btn" onClick={handleShowPlans}>
                    <span className="admin-btn-icon">📋</span> Manage Plans
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {view === 'users' && (
          <div className="admin-users-panel">
            <h2 className="admin-users-heading">All Existing Users</h2>
            <input
              className="admin-users-search"
              type="text"
              placeholder="Search by username, email, or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="admin-btn" style={{marginLeft: '1em'}} onClick={() => setAddUserModal(true)}>Add User</button>
            {selectedUsers.length > 0 && (
              <button className="admin-bulk-delete-btn" onClick={handleBulkDelete} disabled={loading}>
                Delete Selected ({selectedUsers.length})
              </button>
            )}
            {loading && <div className="admin-placeholder">Loading users...</div>}
            {error && <div className="admin-placeholder admin-error">{error}</div>}
            {successMessage && <div className="admin-placeholder admin-success">{successMessage}</div>}
            {!loading && !error && users.length > 0 && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Subscription</th>
                    <th>Expiry</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(u => {
                      const q = search.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        u.username.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        String(u.id).includes(q)
                      );
                    })
                    .map(u => (
                    <tr key={u.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u.id)}
                          onChange={() => handleSelectUser(u.id)}
                        />
                      </td>
                      <td>{u.id}</td>
                      <td>
                          {editingUserId === u.id ? (
                            <input
                              className="admin-edit-input"
                              type="text"
                              value={editFields.username}
                              onChange={e => handleEditFieldChange('username', e.target.value)}
                              disabled={loading}
                            />
                          ) : u.username}
                      </td>
                      <td>
                        {editingUserId === u.id ? (
                          <input
                            className="admin-edit-input"
                            type="email"
                            value={editFields.email}
                            onChange={e => handleEditFieldChange('email', e.target.value)}
                            disabled={loading}
                          />
                        ) : u.email}
                      </td>
                      <td>
                        {editingUserId === u.id ? (
                          <select
                            className="admin-edit-input"
                            value={editFields.role}
                            onChange={e => handleEditFieldChange('role', e.target.value)}
                            disabled={loading}
                          >
                            <option value="admin">admin</option>
                            <option value="user">user</option>
                          </select>
                        ) : (
                          <span style={{
                            color: u.role === 'admin' ? '#1769aa' : '#666',
                            fontWeight: u.role === 'admin' ? '700' : '500',
                            background: u.role === 'admin' ? 'rgba(23, 105, 170, 0.1)' : 'transparent',
                            padding: u.role === 'admin' ? '4px 8px' : '0',
                            borderRadius: u.role === 'admin' ? '6px' : '0',
                            border: u.role === 'admin' ? '1px solid rgba(23, 105, 170, 0.3)' : 'none'
                          }}>
                            {u.role}
                            {u.role === 'admin' && ' 👑'}
                          </span>
                        )}
                      </td>
                        <td>
                          {editingUserId === u.id ? (
                            <select
                              className="admin-edit-input"
                              value={editFields.plan_id || ''}
                              onChange={e => handleEditFieldChange('plan_id', e.target.value)}
                              disabled={loading}
                              style={{ minWidth: 90 }}
                            >
                              {plans.map(plan => (
                                <option key={plan.id} value={plan.id}>
                                  {plan.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            u.plan_name ? (
                              <span className={`profile-subscription-badge${u.plan_name.toLowerCase() === 'premium' ? ' pro' : ''}`}>{u.plan_name}</span>
                            ) : (
                              <span className="profile-subscription-badge">None</span>
                            )
                          )}
                        </td>
                        <td>
                          {editingUserId === u.id ? (
                            <>
                              <input
                                className="admin-edit-input"
                                type="number"
                                placeholder="Expiry (ms since epoch)"
                                value={editFields.subscription_expires}
                                onChange={e => handleEditFieldChange('subscription_expires', e.target.value)}
                                disabled={loading}
                                style={{ maxWidth: 140 }}
                              />
                              <div style={{ fontSize: '0.95em', color: '#888' }}>
                                {editFields.subscription_expires && !isNaN(Number(editFields.subscription_expires))
                                  ? (new Date(Number(editFields.subscription_expires)).toLocaleString())
                                  : ''}
                              </div>
                            </>
                          ) : (
                            u.subscription_expires && !isNaN(Number(u.subscription_expires)) ?
                              <span style={{ color: '#888', fontSize: '0.98em' }}>{new Date(Number(u.subscription_expires)).toLocaleString()}</span>
                              : ''
                          )}
                        </td>
                      <td>
                        {editingUserId === u.id ? (
                          <>
                            <button className="admin-action-btn admin-edit-btn" onClick={() => handleEditSave(u.id)} disabled={loading}>Save</button>
                            <button className="admin-action-btn admin-delete-btn" onClick={handleEditCancel} disabled={loading}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="admin-action-btn admin-edit-btn" onClick={() => handleEditClick(u)} disabled={loading}>Edit</button>
                            <button className="admin-action-btn admin-delete-btn" onClick={() => handleDeleteUser(u.id, u.username)} disabled={loading}>Delete</button>
                            <button className="admin-action-btn admin-drafts-btn" onClick={() => handleShowUserDrafts(u)} disabled={loading}>Drafts</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && !error && users.length === 0 && (
              <div className="admin-placeholder">No users found.</div>
            )}
          </div>
        )}
        {view === 'drafts' && (
          <div className="admin-drafts-sidepanel">
            <div className="admin-drafts-panel">
              <div className="admin-drafts-header">
                <span>All Drafts in System</span>
              </div>
              {loading ? (
                <div className="admin-placeholder">Loading drafts...</div>
              ) : error ? (
                <div className="admin-placeholder admin-error">{error}</div>
              ) : drafts.length === 0 ? (
                <div className="admin-placeholder">No drafts found.</div>
              ) : (
                <ul className="admin-drafts-list">
                  {drafts.map((draft, idx) => (
                    <li key={draft.wall_id} className="admin-draft-item" style={{cursor:'pointer'}}>
                      <span onClick={() => setPreviewDraft(draft)} style={{flex: 1}}>
                        <b>{draft.name}</b> <span style={{color:'#b5b5d6'}}>({draft.timestamp})</span> <span style={{color:'#888', fontSize:'0.95em'}}>User ID: {draft.uid}</span>
                      </span>
                      <button
                        className="admin-user-details-btn"
                        style={{ marginLeft: '1em', background: '#2196f3', color: '#fff', border: 'none', borderRadius: '7px', padding: '0.4em 1.1em', fontWeight: 500, cursor: 'pointer', fontSize: '0.98em' }}
                        onClick={e => { e.stopPropagation(); handleShowUserDetails(draft.uid); }}
                      >
                        User Details
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        {/* User Drafts Side Panel */}
        {userDraftsPanel.open && !previewDraft && (
          <div className="admin-drafts-centerpanel">
            <div className="admin-drafts-panel">
              <div className="admin-drafts-header">
                <span>Drafts for <b>{userDraftsPanel.user.username}</b> (User ID: {userDraftsPanel.user.id})</span>
                <button className="admin-drafts-close" onClick={() => setUserDraftsPanel({ open: false, user: null, drafts: [], loading: false, error: "" })}>Close</button>
              </div>
              {userDraftsPanel.loading ? (
                <div className="admin-placeholder">Loading drafts...</div>
              ) : userDraftsPanel.error ? (
                <div className="admin-placeholder admin-error">{userDraftsPanel.error}</div>
              ) : userDraftsPanel.drafts.length === 0 ? (
                <div className="admin-placeholder">No drafts found for this user.</div>
              ) : (
                <>
                  <ul className="admin-drafts-list">
                    {userDraftsPanel.drafts.map((draft, idx) => (
                      <li key={draft.wall_id} className="admin-draft-item" style={{cursor:'pointer', background: previewDraft && previewDraft.wall_id === draft.wall_id ? '#e3e8f0' : undefined}} onClick={() => setPreviewDraft(draft)}>
                        <b>{draft.name}</b> <span style={{color:'#b5b5d6'}}>({draft.timestamp})</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
        {/* Show preview panel only if previewDraft is set */}
        {previewDraft && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content" style={{ maxWidth: '90vw', maxHeight: '90vh', width: 'auto', height: 'auto' }}>
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">Previewing Draft: <b>{previewDraft.name}</b></h2>
                <button className="admin-modal-close" onClick={() => {
                  setPreviewDraft(null);
                  setUserDraftsPanel(panel => panel.user ? { ...panel, open: true } : panel);
                }}>×</button>
              </div>
              <div className="wall-preview-wrapper" style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '12px', 
                padding: '1rem',
                border: '1px solid rgba(33, 150, 243, 0.1)'
              }}>
                <Wall
                  background={previewDraft.background}
                  width={previewDraft.width}
                  height={previewDraft.height}
                  images={previewDraft.images}
                />
              </div>
            </div>
          </div>
        )}
        {/* User Details Side Panel */}
        {userDetailsPanel.open && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content" style={{ maxWidth: '500px', width: '90%' }}>
              <div className="admin-modal-header">
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div style={{width: 54, height: 54, borderRadius: '50%', overflow: 'hidden', background: '#e9eafc', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {userDetailsPhoto ? (
                      <img
                        src={userDetailsPhoto.startsWith('data:') ? userDetailsPhoto : `data:image/*;base64,${userDetailsPhoto}`}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    ) : (
                      <svg width="32" height="32" fill="#b5b5d6" viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="6" fill="#fff" fillOpacity="0.18" />
                        <circle cx="12" cy="8" r="5" fill="#2196f3" />
                        <path d="M12 15c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5z" fill="#1769aa" />
                      </svg>
                    )}
                  </div>
                  <h2 className="admin-modal-title">User Details</h2>
                </div>
                <button className="admin-modal-close" onClick={() => setUserDetailsPanel({ open: false, user: null, loading: false, error: "" })}>×</button>
              </div>
              <div className="admin-modal-form">
                {userDetailsPanel.loading ? (
                  <div className="admin-placeholder">Loading user details...</div>
                ) : userDetailsPanel.error ? (
                  <div className="admin-modal-error">{userDetailsPanel.error}</div>
                ) : userDetailsPanel.user ? (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <div className="admin-modal-input-group">
                      <label className="admin-modal-label">User ID</label>
                      <div style={{background: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '1rem 1.2rem', border: '1px solid rgba(33, 150, 243, 0.1)', fontSize: '1.1em', color: '#22223b', fontWeight: '500'}}>
                        {userDetailsPanel.user.id}
                      </div>
                    </div>
                    <div className="admin-modal-input-group">
                      <label className="admin-modal-label">Username</label>
                      <div style={{background: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '1rem 1.2rem', border: '1px solid rgba(33, 150, 243, 0.1)', fontSize: '1.1em', color: '#22223b', fontWeight: '500'}}>
                        {userDetailsPanel.user.username}
                      </div>
                    </div>
                    <div className="admin-modal-input-group">
                      <label className="admin-modal-label">Email</label>
                      <div style={{background: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '1rem 1.2rem', border: '1px solid rgba(33, 150, 243, 0.1)', fontSize: '1.1em', color: '#22223b', fontWeight: '500'}}>
                        {userDetailsPanel.user.email}
                      </div>
                    </div>
                    <div className="admin-modal-input-group">
                      <label className="admin-modal-label">Role</label>
                      <div style={{background: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '1rem 1.2rem', border: '1px solid rgba(33, 150, 243, 0.1)', fontSize: '1.1em', color: '#22223b', fontWeight: '500'}}>
                        {userDetailsPanel.user.role}
                      </div>
                    </div>
                    {userDetailsPanel.user && (
                      <div className="admin-modal-input-group">
                        <label className="admin-modal-label">Subscription</label>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '1rem 1.2rem', border: '1px solid rgba(33, 150, 243, 0.1)'}}>
                          <span className={`profile-subscription-badge${userDetailsPanel.user.plan_name && userDetailsPanel.user.plan_name.toLowerCase() === 'premium' ? ' pro' : ''}`}>
                            {userDetailsPanel.user.plan_name || 'None'}
                          </span>
                          {userDetailsPanel.user.subscription_expires && !isNaN(Number(userDetailsPanel.user.subscription_expires)) && (
                            <span style={{ color: '#888', fontSize: '0.9em' }}>
                              (Expires: {new Date(Number(userDetailsPanel.user.subscription_expires)).toLocaleString()})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
                <div className="admin-modal-actions">
                  <button 
                    className="admin-modal-btn admin-modal-btn-secondary" 
                    onClick={() => setUserDetailsPanel({ open: false, user: null, loading: false, error: "" })}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <PasswordPromptModal
          open={passwordPrompt.open}
          label={passwordPrompt.label}
          onConfirm={passwordPrompt.onConfirm}
          onCancel={() => setPasswordPrompt({ open: false, label: '', onConfirm: null })}
        />
        <AddUserModal
          open={addUserModal && !passwordPrompt.open}
          onAdd={handleAddUser}
          onCancel={() => setAddUserModal(false)}
        />
        {/* OTP Modal for Email Change */}
        {showEmailOtpModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">Verify New Email</h2>
                <button className="admin-modal-close" onClick={() => setShowEmailOtpModal(false)}>×</button>
              </div>
              <form onSubmit={handleOtpSubmit} className="admin-modal-form">
                <div className="admin-modal-input-group">
                  <label className="admin-modal-label">
                    Enter the code sent to <b>{otpNewEmail}</b>
                  </label>
                  <input
                    type="text"
                    className="admin-modal-input"
                    placeholder="Enter 6-digit OTP code"
                    value={otpValue}
                    onChange={e => setOtpValue(e.target.value)}
                    required
                    maxLength={6}
                    autoFocus
                    style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: '1.2em' }}
                  />
                </div>
                {otpError && <div className="admin-modal-error">{otpError}</div>}
                <div className="admin-modal-actions">
                  <button 
                    type="button" 
                    className="admin-modal-btn admin-modal-btn-secondary" 
                    onClick={() => setShowEmailOtpModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="admin-modal-btn admin-modal-btn-primary" 
                    disabled={otpLoading || !otpValue.trim()}
                  >
                    {otpLoading ? 'Verifying...' : 'Verify & Update Email'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* OTP Modal for Admin User Creation */}
        {showAddUserOtpModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">Verify New User Email</h2>
                <button className="admin-modal-close" onClick={() => setShowAddUserOtpModal(false)}>×</button>
              </div>
              <form onSubmit={handleAddUserOtpSubmit} className="admin-modal-form">
                <div className="admin-modal-input-group">
                  <label className="admin-modal-label">
                    Enter the code sent to <b>{addUserOtpEmail}</b>
                  </label>
                  <input
                    type="text"
                    className="admin-modal-input"
                    placeholder="Enter 6-digit OTP code"
                    value={addUserOtpValue}
                    onChange={e => setAddUserOtpValue(e.target.value)}
                    required
                    maxLength={6}
                    autoFocus
                    style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: '1.2em' }}
                  />
                </div>
                {addUserOtpError && <div className="admin-modal-error">{addUserOtpError}</div>}
                <div className="admin-modal-actions">
                  <button 
                    type="button" 
                    className="admin-modal-btn admin-modal-btn-secondary" 
                    onClick={() => setShowAddUserOtpModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="admin-modal-btn admin-modal-btn-primary" 
                    disabled={addUserOtpLoading || !addUserOtpValue.trim()}
                  >
                    {addUserOtpLoading ? 'Verifying...' : 'Verify & Activate User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showOtpModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">Verify Email Change</h2>
                <button className="admin-modal-close" onClick={() => setShowOtpModal(false)}>×</button>
              </div>
              <div className="admin-modal-form">
                <div className="admin-modal-input-group">
                  <label className="admin-modal-label">
                    Enter the OTP sent to <b>{pendingOtpEmail}</b>
                  </label>
                  <input
                    type="text"
                    className="admin-modal-input"
                    placeholder="Enter 6-digit OTP code"
                    value={otpValue}
                    onChange={e => setOtpValue(e.target.value)}
                    autoFocus
                    maxLength={6}
                    style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: '1.2em' }}
                  />
                </div>
                {otpError && <div className="admin-modal-error">{otpError}</div>}
                <div className="admin-modal-actions">
                  <button
                    className="admin-modal-btn admin-modal-btn-secondary"
                    onClick={handleResendOtp}
                    disabled={resendOtpLoading || resendOtpDisabled}
                  >
                    {resendOtpLoading ? 'Sending...' : resendOtpDisabled ? `Resend (${resendOtpCountdown}s)` : 'Resend OTP'}
                  </button>
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <button 
                      className="admin-modal-btn admin-modal-btn-secondary" 
                      onClick={() => setShowOtpModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="admin-modal-btn admin-modal-btn-primary"
                      onClick={async () => {
                        setOtpLoading(true);
                        setOtpError('');
                        try {
                          const adminUser = JSON.parse(localStorage.getItem("user"));
                          const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_VERIFY_EMAIL_CHANGE), {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${adminUser.token}`,
                            },
                            body: JSON.stringify({ userId: pendingOtpUserId, otp: otpValue }),
                          });
                          const data = await res.json();
                          if (!data.success) {
                            setOtpError(data.error || "Failed to verify OTP");
                            setOtpLoading(false);
                            return;
                          }
                          setShowOtpModal(false);
                          setPendingOtpUserId(null);
                          setPendingOtpEmail('');
                          setOtpValue('');
                          setOtpError('');
                          // Optionally, refresh user list or details here
                          alert('Email change verified and completed!');
                        } catch (err) {
                          setOtpError("Something went wrong. Try again.");
                        }
                        setOtpLoading(false);
                      }}
                      disabled={otpLoading || !otpValue.trim()}
                    >
                      {otpLoading ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Plans Panel */}
        {view === 'plans' && (
          <div className="admin-sidepanel" style={{flex: 1, height: '100vh', background: '#f8fafc', boxShadow: '-2px 0 24px rgba(33,150,243,0.13)', zIndex: 2000, padding: '2.5em 2em 1.5em 2em', display: 'flex', flexDirection: 'column', borderTopLeftRadius: '24px', borderBottomLeftRadius: '24px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2em'}}>
              <h2 className="admin-users-heading" style={{margin: 0}}>All Plans & Feature Assignment</h2>
              <button className="admin-drafts-close" style={{fontSize: '1.1em', padding: '0.5em 1.3em', borderRadius: '9px'}} onClick={() => { setView(null); setPlansPanel({ open: false, loading: false, error: '', plans: [] }); }}>Close</button>
            </div>
            <AddPlanForm onPlanAdded={handleShowPlans} />
            {plansPanel.loading ? (
              <div className="admin-placeholder">Loading plans...</div>
            ) : plansPanel.error ? (
              <div className="admin-placeholder admin-error">{plansPanel.error}</div>
            ) : plansPanel.plans.length === 0 ? (
              <div className="admin-placeholder">No plans found.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plansPanel.plans.map(plan => (
                    <PlanRow key={plan.id} plan={plan} onPlanUpdated={handleShowPlans} onPlanDeleted={handleShowPlans} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Add Plan Form
function AddPlanForm({ onPlanAdded }) {
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [focus, setFocus] = React.useState({});
  const inputStyle = {
    padding: 10,
    borderRadius: 8,
    border: '1.5px solid #b7cfc9',
    background: '#f0f4ff',
    fontSize: '1em',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  };
  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 2px 12px rgba(33,150,243,0.08)',
      padding: '1.5em 1.5em 1em 1.5em',
      marginBottom: 24,
      maxWidth: 420,
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: 0
    }}>
      <form style={{display: 'flex', flexDirection: 'column', gap: 16}} onSubmit={async e => {
        e.preventDefault();
        setLoading(true); setError("");
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_PLANS), {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ name, price, duration })
          });
          if (!res.ok) throw new Error(await res.text());
          setName(""); setPrice(""); setDuration("");
          if (onPlanAdded) onPlanAdded();
        } catch (err) { setError(err.message); }
        setLoading(false);
      }}>
        <div style={{fontWeight: 700, fontSize: '1.13em', color: '#1769aa', marginBottom: 2}}>Add New Plan</div>
        <label style={{fontWeight: 500, color: '#22223b'}}>Plan Name
          <input required placeholder="Plan Name" value={name} onChange={e => setName(e.target.value)}
            style={{...inputStyle, border: focus.name ? '2px solid #7c3aed' : inputStyle.border}}
            onFocus={() => setFocus(f => ({...f, name: true}))}
            onBlur={() => setFocus(f => ({...f, name: false}))}
          />
        </label>
        <label style={{fontWeight: 500, color: '#22223b'}}>Price
          <input required type="number" min="0" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)}
            style={{...inputStyle, border: focus.price ? '2px solid #7c3aed' : inputStyle.border}}
            onFocus={() => setFocus(f => ({...f, price: true}))}
            onBlur={() => setFocus(f => ({...f, price: false}))}
          />
        </label>
        <label style={{fontWeight: 500, color: '#22223b'}}>Duration
          <input required placeholder="Duration (e.g. monthly)" value={duration} onChange={e => setDuration(e.target.value)}
            style={{...inputStyle, border: focus.duration ? '2px solid #7c3aed' : inputStyle.border}}
            onFocus={() => setFocus(f => ({...f, duration: true}))}
            onBlur={() => setFocus(f => ({...f, duration: false}))}
          />
        </label>
        <button className="admin-btn" type="submit" disabled={loading} style={{background: '#43e97b', color: '#1769aa', fontWeight: 700, fontSize: '1.08em', borderRadius: 8, marginTop: 8}}>{loading ? 'Adding...' : 'Add Plan'}</button>
        {error && <span style={{color: 'red', marginTop: 6}}>{error}</span>}
      </form>
    </div>
  );
}



// Plan Row (with edit/delete and features button)
function PlanRow({ plan, onPlanUpdated, onPlanDeleted }) {
  const navigate = useNavigate();
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(plan.name);
  const [price, setPrice] = React.useState(plan.price);
  const [duration, setDuration] = React.useState(plan.duration);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Reset local state if plan prop changes (e.g., after save)
  React.useEffect(() => {
    setName(plan.name);
    setPrice(plan.price);
    setDuration(plan.duration);
    setEditing(false);
    setError("");
  }, [plan.id, plan.name, plan.price, plan.duration]);
  
  return (
    <tr>
      <td>{plan.id}</td>
      <td className="admin-plan-table-cell">
        {editing ? (
          <input 
            className="admin-plan-edit-input"
            value={name} 
            onChange={e => setName(e.target.value)}
            placeholder="Plan name"
          />
        ) : (
          plan.name
        )}
      </td>
      <td className="admin-plan-table-cell">
        {editing ? (
          <input 
            className="admin-plan-edit-input"
            type="number" 
            value={price} 
            onChange={e => setPrice(e.target.value)}
            placeholder="Price"
            min="0"
          />
        ) : (
          `₹${plan.price}`
        )}
      </td>
      <td className="admin-plan-table-cell">
        {editing ? (
          <input 
            className="admin-plan-edit-input"
            value={duration} 
            onChange={e => setDuration(e.target.value)}
            placeholder="Duration (e.g. monthly)"
            name="duration"
          />
        ) : (
          plan.duration
        )}
      </td>
      <td>
        {editing ? (
          <>
            <button 
              className="admin-plan-action-btn admin-plan-edit-save-btn" 
              disabled={loading} 
              onClick={async () => {
                setLoading(true); 
                setError("");
                try {
                  const user = JSON.parse(localStorage.getItem("user"));
                  const res = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN_PLANS}/${plan.id}`), {
                    method: 'PUT',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ name, price, duration })
                  });
                  if (!res.ok) throw new Error(await res.text());
                  if (onPlanUpdated) await onPlanUpdated(); // Always re-fetch plans after save
                  setEditing(false);
                } catch (err) { setError(err.message); }
                setLoading(false);
              }}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button 
              className="admin-plan-action-btn admin-plan-edit-cancel-btn" 
              disabled={loading} 
              onClick={() => { 
                setEditing(false); 
                setName(plan.name); 
                setPrice(plan.price); 
                setDuration(plan.duration); 
              }}
            >
              Cancel
            </button>
            {error && <span className="admin-plan-error">{error}</span>}
          </>
        ) : (
          <>
            <button 
              className="admin-plan-action-btn admin-plan-edit-save-btn" 
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button 
              className="admin-plan-action-btn admin-plan-delete-btn" 
              onClick={async () => {
                if (!window.confirm('Delete this plan?')) return;
                setLoading(true); 
                setError("");
                try {
                  const user = JSON.parse(localStorage.getItem("user"));
                  const res = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN_PLANS}/${plan.id}`), { 
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${user.token}` }
                  });
                  if (!res.ok) throw new Error(await res.text());
                  if (onPlanDeleted) onPlanDeleted();
                } catch (err) { setError(err.message); }
                setLoading(false);
              }}
            >
              Delete
            </button>
            <button
              className="admin-plan-action-btn admin-plan-features-btn"
              onClick={() => navigate(`/admin/plan-features/${plan.id}`)}
            >
              Features
            </button>
            {error && <span className="admin-plan-error">{error}</span>}
          </>
        )}
      </td>
    </tr>
  );
}


