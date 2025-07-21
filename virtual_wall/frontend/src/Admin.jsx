import React, { useState, useEffect } from "react";
import Wall from "./wall.jsx";

function PasswordPromptModal({ open, onConfirm, onCancel, label }) {
  const [password, setPassword] = useState("");
  if (!open) return null;
  return (
    <div className="admin-draft-preview-modal" style={{zIndex: 2000}}>
      <div className="admin-draft-preview-content" style={{minWidth: 320, maxWidth: 400}}>
        <div className="admin-draft-preview-header">
          <span>{label || "Enter Password"}</span>
        </div>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "0.9em 1.1em",
            borderRadius: "8px",
            border: "1.5px solid #e5e7eb",
            fontSize: "1em",
            outline: "none",
            background: "#f9fafb",
            marginBottom: "1.2em",
            transition: "border-color 0.2s"
          }}
        />
        <div style={{display: 'flex', gap: '1em', justifyContent: 'flex-end'}}>
          <button className="admin-drafts-close" onClick={onCancel}>Cancel</button>
          <button className="admin-btn" onClick={() => { onConfirm(password); setPassword(""); }}>Confirm</button>
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
  if (!open) return null;
  return (
    <div className="admin-draft-preview-modal" style={{zIndex: 2000}}>
      <div className="admin-draft-preview-content" style={{minWidth: 340, maxWidth: 420}}>
        <div className="admin-draft-preview-header">
          <span>Add New User</span>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1em', width: '100%'}}>
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{padding: '0.9em 1.1em', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '1em', outline: 'none', background: '#f9fafb'}} />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{padding: '0.9em 1.1em', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '1em', outline: 'none', background: '#f9fafb'}} />
          <select value={role} onChange={e => setRole(e.target.value)} style={{padding: '0.9em 1.1em', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '1em', outline: 'none', background: '#f9fafb'}}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{padding: '0.9em 1.1em', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '1em', outline: 'none', background: '#f9fafb'}} />
          {error && <div className="admin-error" style={{marginTop: '-0.5em'}}>{error}</div>}
        </div>
        <div style={{display: 'flex', gap: '1em', justifyContent: 'flex-end', marginTop: '1.2em'}}>
          <button className="admin-drafts-close" onClick={onCancel}>Cancel</button>
          <button className="admin-btn" onClick={async () => {
            setError("");
            if (!username || !email || !role || !password) {
              setError("All fields are required");
              return;
            }
            await onAdd({ username, email, role, password, setError });
          }}>Add User</button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [view, setView] = useState(null); // 'users' or 'drafts'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const allSelected = users.length > 0 && selectedUsers.length === users.length;
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFields, setEditFields] = useState({ username: '', email: '', role: 'user' });
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
  useEffect(() => {
    // Fetch admin's profile photo on mount
    const adminUser = JSON.parse(localStorage.getItem("user"));
    if (adminUser && adminUser.id && adminUser.token) {
      fetch(`http://localhost:8080/profilePhoto/${adminUser.id}`, {
        headers: { Authorization: `Bearer ${adminUser.token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.photo) setAdminPhoto(data.photo);
        });
    }
  }, []);

  const handleShowUsers = async () => {
    setView('users');
    setLoading(true);
    setError("");
    setSelectedUsers([]);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await fetch("http://localhost:8080/admin/users", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUsers(data);
      // Fetch profile photos for all users
      const photoResults = await Promise.all(
        data.map(async (u) => {
          try {
            const res = await fetch(`http://localhost:8080/profilePhoto/${u.id}`, {
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
          const res = await fetch(`http://localhost:8080/admin/user/${userId}`, {
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
            const res = await fetch(`http://localhost:8080/admin/user/${userId}`, {
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
    setEditFields({ username: user.username, email: user.email, role: user.role });
  };

  const handleEditFieldChange = (field, value) => {
    setEditFields(fields => ({ ...fields, [field]: value }));
  };

  const handleEditCancel = () => {
    setEditingUserId(null);
    setEditFields({ username: '', email: '', role: 'user' });
  };

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
          const res = await fetch(`http://localhost:8080/admin/user/${userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminUser.token}`,
            },
            body: JSON.stringify({ ...editFields, adminUsername: adminUser.username, adminPassword }),
          });
          if (!res.ok) throw new Error(await res.text());
          setUsers(users => users.map(u => u.id === userId ? { ...u, ...editFields } : u));
          setEditingUserId(null);
          setEditFields({ username: '', email: '', role: 'user' });
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
      const res = await fetch(`http://localhost:8080/getDrafts/${user.id}`, {
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
          const res = await fetch("http://localhost:8080/admin/user", {
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
    setLoading(true);
    setError("");
    try {
      const adminUser = JSON.parse(localStorage.getItem("user"));
      const res = await fetch("http://localhost:8080/admin/drafts", {
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

  // Handler to fetch and show user details
  const handleShowUserDetails = async (userId) => {
    setUserDetailsPanel({ open: true, user: null, loading: true, error: "" });
    setUserDetailsPhoto(null);
    try {
      const adminUser = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(`http://localhost:8080/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${adminUser.token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const user = await res.json();
      setUserDetailsPanel({ open: true, user, loading: false, error: "" });
      // Fetch profile photo for user details
      try {
        const photoRes = await fetch(`http://localhost:8080/profilePhoto/${userId}`, {
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

  return (
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
            <button className="admin-btn" onClick={handleShowUsers}>
              <span className="admin-btn-icon">👤</span> Show All Users
            </button>
            <button className="admin-btn" onClick={handleShowAllDrafts}>
              <span className="admin-btn-icon">🗂️</span> Show All Drafts
            </button>
          </div>
          <div className="admin-section">
            {view === 'drafts' && <div className="admin-placeholder"></div>}
            {!view && <p className="admin-welcome">Welcome, Admin! Here you can manage the application.</p>}
          </div>
        </div>
      </div>
      <div className="admin-divider" />
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ display: 'inline-block', width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', background: '#e9eafc', border: '1.5px solid #e5e7eb' }}>
                          {userPhotos[u.id] ? (
                            <img
                              src={userPhotos[u.id].startsWith('data:') ? userPhotos[u.id] : `data:image/*;base64,${userPhotos[u.id]}`}
                              alt="Profile"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                          ) : (
                            <svg width="38" height="38" fill="#b5b5d6" viewBox="0 0 24 24">
                              <circle cx="12" cy="8" r="5" fill="#b5b5d6" />
                              <path d="M12 14c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5z" fill="#e9eafc" />
                            </svg>
                          )}
                        </span>
                        {editingUserId === u.id ? (
                          <input
                            className="admin-edit-input"
                            type="text"
                            value={editFields.username}
                            onChange={e => handleEditFieldChange('username', e.target.value)}
                            disabled={loading}
                          />
                        ) : u.username}
                      </div>
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
                      ) : u.role}
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
        <div className="admin-draft-preview-modal">
          <div className="admin-draft-preview-content">
            <div className="admin-draft-preview-header">
              <span>Previewing Draft: <b>{previewDraft.name}</b></span>
              <button className="admin-drafts-close" onClick={() => {
                setPreviewDraft(null);
                setUserDraftsPanel(panel => panel.user ? { ...panel, open: true } : panel);
              }}>Close</button>
            </div>
            <div className="wall-preview-wrapper">
              <Wall
                background={
                  previewDraft.background &&
                  (previewDraft.background.startsWith('url(') || previewDraft.background.includes('gradient'))
                    ? previewDraft.background
                    : `url(${previewDraft.background})`
                }
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
        <div className="admin-user-details-panel" style={{position: 'fixed', top: 0, right: 0, width: 400, height: '100vh', background: '#f8fafc', boxShadow: '-2px 0 24px rgba(33,150,243,0.13)', zIndex: 2000, padding: '2.5em 2em 1.5em 2em', display: 'flex', flexDirection: 'column', borderTopLeftRadius: '24px', borderBottomLeftRadius: '24px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2em'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1em'}}>
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
              <span style={{fontWeight: 800, color: '#1769aa', fontSize: '1.45em', letterSpacing: '0.01em'}}>User Details</span>
            </div>
            <button className="admin-drafts-close" style={{fontSize: '1.1em', padding: '0.5em 1.3em', borderRadius: '9px'}} onClick={() => setUserDetailsPanel({ open: false, user: null, loading: false, error: "" })}>Close</button>
          </div>
          {userDetailsPanel.loading ? (
            <div className="admin-placeholder">Loading user details...</div>
          ) : userDetailsPanel.error ? (
            <div className="admin-placeholder admin-error">{userDetailsPanel.error}</div>
          ) : userDetailsPanel.user ? (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5em'}}>
              <div style={{background: '#fff', borderRadius: '12px', boxShadow: '0 1px 6px rgba(33,150,243,0.07)', padding: '1.1em 1.3em', display: 'flex', flexDirection: 'column', gap: '0.4em'}}>
                <div style={{fontWeight: 700, color: '#1769aa', fontSize: '1.08em'}}>ID</div>
                <div style={{fontSize: '1.13em', color: '#22223b'}}>{userDetailsPanel.user.id}</div>
              </div>
              <div style={{background: '#fff', borderRadius: '12px', boxShadow: '0 1px 6px rgba(33,150,243,0.07)', padding: '1.1em 1.3em', display: 'flex', flexDirection: 'column', gap: '0.4em'}}>
                <div style={{fontWeight: 700, color: '#1769aa', fontSize: '1.08em'}}>Username</div>
                <div style={{fontSize: '1.13em', color: '#22223b'}}>{userDetailsPanel.user.username}</div>
              </div>
              <div style={{background: '#fff', borderRadius: '12px', boxShadow: '0 1px 6px rgba(33,150,243,0.07)', padding: '1.1em 1.3em', display: 'flex', flexDirection: 'column', gap: '0.4em'}}>
                <div style={{fontWeight: 700, color: '#1769aa', fontSize: '1.08em'}}>Email</div>
                <div style={{fontSize: '1.13em', color: '#22223b'}}>{userDetailsPanel.user.email}</div>
              </div>
              <div style={{background: '#fff', borderRadius: '12px', boxShadow: '0 1px 6px rgba(33,150,243,0.07)', padding: '1.1em 1.3em', display: 'flex', flexDirection: 'column', gap: '0.4em'}}>
                <div style={{fontWeight: 700, color: '#1769aa', fontSize: '1.08em'}}>Role</div>
                <div style={{fontSize: '1.13em', color: '#22223b'}}>{userDetailsPanel.user.role}</div>
              </div>
            </div>
          ) : null}
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
    </div>
  );
}
