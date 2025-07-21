import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsBtnRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const navigate = useNavigate();
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

  // Helper to validate email
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Function to generate and show public share link
  const handlePublicShare = async (wall_id) => {
    try {
      const res = await fetch(`http://localhost:8080/shareDraft/${wall_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": user?.token ? `Bearer ${user.token}` : undefined,
        },
      });
      if (!res.ok) {
        alert("Failed to generate share link");
        return;
      }
      const data = await res.json();
      setGeneratedUnauthorizedViewLink(data.shareUrl);
    } catch (err) {
      alert("Error generating share link");
    }
  };
  // Function to generate and show edit link
  const handleEditShare = async (wall_id) => {
    try {
      const res = await fetch(`http://localhost:8080/editShareDraft/${wall_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": user?.token ? `Bearer ${user.token}` : undefined,
        },
      });
      if (!res.ok) {
        alert("Failed to generate edit link");
        return;
      }
      const data = await res.json();
      setGeneratedUnauthorizedEditLink(data.editUrl);
    } catch (err) {
      alert("Error generating edit link");
    }
  };

  // Function to generate and show authorized view-only link
  const handleAuthorizedViewShare = async (wall_id, emails) => {
    setViewLinkLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/authViewShareDraft/${wall_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": user?.token ? `Bearer ${user.token}` : undefined,
        },
        body: JSON.stringify({ emails }),
      });
      if (!res.ok) {
        alert("Failed to generate authorized view link");
        setViewLinkLoading(false);
        return;
      }
      const data = await res.json();
      setGeneratedViewLink(data.viewUrl);
    } catch (err) {
      alert("Error generating authorized view link");
    } finally {
      setViewLinkLoading(false);
    }
  };

  // Function to generate and show authorized edit link
  const handleAuthorizedEditShare = async (wall_id, emails) => {
    setEditLinkLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/authEditShareDraft/${wall_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": user?.token ? `Bearer ${user.token}` : undefined,
        },
        body: JSON.stringify({ emails }),
      });
      if (!res.ok) {
        alert("Failed to generate authorized edit link");
        setEditLinkLoading(false);
        return;
      }
      const data = await res.json();
      setGeneratedEditLink(data.editUrl);
    } catch (err) {
      alert("Error generating authorized edit link");
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
        const res = await fetch(`http://localhost:8080/profilePhoto/${userObj.id}`, {
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
          `http://localhost:8080/getDrafts/${userObj.id}`,
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
      const res = await fetch(`http://localhost:8080/deleteDraft/${wall_id}`, {
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
        alert("Failed to delete draft: " + error);
        return;
      }

      const updatedDrafts = drafts.filter((d) => d.wall_id !== wall_id);
      setDrafts(updatedDrafts);
    } catch (err) {
      console.error("Delete draft error:", err);
      alert("Something went wrong while deleting the draft.");
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
  // Handle password submit and update user
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const res = await fetch("http://localhost:8080/updateUser", {
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

  // Function to handle photo upload to backend
  const handleSavePhoto = async () => {
    if (!profilePhotoPreview) return;
    try {
      const res = await fetch("http://localhost:8080/uploadProfilePhoto", {
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
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            background: "linear-gradient(120deg, #f0f4fd 0%, #e9eafc 100%)",
          }}
        >
          <div
            style={{
              marginLeft: "5vw",
              border: "4px solid #e9eafc",
              borderTop: "4px solid #2196f3",
              borderRadius: "50%",
              width: 48,
              height: 48,
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      </>
    );
  }

  if (!user) return null;

  // SVG icon for link
  const LinkIcon = () => (
    <svg width="22" height="22" fill="#2196f3" viewBox="0 0 24 24" style={{marginRight: 8, verticalAlign: 'middle'}}><path d="M17 7a5 5 0 0 0-7.07 0l-4.24 4.24a5 5 0 0 0 7.07 7.07l1.06-1.06a1 1 0 1 0-1.42-1.42l-1.06 1.06a3 3 0 1 1-4.24-4.24l4.24-4.24a3 3 0 0 1 4.24 4.24l-.88.88a1 1 0 1 0 1.42 1.42l.88-.88A5 5 0 0 0 17 7z"/></svg>
  );

  return (
    <>
      <div className="appHeader" style={{ position: 'relative' }}>
        Altar Designer
        <span>Design your own altar with custom backgrounds and sacred decor</span>
        <button
          className="profile-settings-btn"
          ref={settingsBtnRef}
          style={{
            position: 'absolute',
            top: 18,
            right: 32,
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #2196f3 60%, #1769aa 100%)',
            border: 'none',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(33,150,243,0.13)',
            cursor: 'pointer',
            padding: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
          title="Settings"
          onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #1769aa 60%, #2196f3 100%)'}
          onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(135deg, #2196f3 60%, #1769aa 100%)'}
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
            style={{
              position: 'absolute',
              top: 58,
              right: 32,
              minWidth: 110,
              background: 'linear-gradient(120deg, #f0f4fd 0%, #e9eafc 100%)',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(33,150,243,0.10)',
              zIndex: 20,
              padding: '0.2em 0.05em',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.07em',
              border: '1.5px solid #e5e7eb',
              backdropFilter: 'blur(1px)',
            }}
          >
            <button style={{
              background: 'none',
              border: 'none',
              textAlign: 'left',
              padding: '0.35em 0.7em',
              fontSize: '0.65em',
              color: '#1769aa',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3em',
              transition: 'background 0.18s, color 0.18s',
            }}
            onMouseOver={e => {e.currentTarget.style.background = '#e3e8f0'; e.currentTarget.style.color = '#2196f3';}}
            onMouseOut={e => {e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#1769aa';}}
            onClick={() => {setSettingsOpen(false); openEditModal();}}>
              <svg width="12" height="12" fill="#2196f3" viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>
              Edit User
            </button>
            <button style={{
              background: 'none',
              border: 'none',
              textAlign: 'left',
              padding: '0.35em 0.7em',
              fontSize: '0.65em',
              color: '#1769aa',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3em',
              transition: 'background 0.18s, color 0.18s',
            }}
            onMouseOver={e => {e.currentTarget.style.background = '#e3e8f0'; e.currentTarget.style.color = '#2196f3';}}
            onMouseOut={e => {e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#1769aa';}}
            onClick={() => {setSettingsOpen(false); setChangePwdModalOpen(true); setChangePwdError(""); setChangePwdSuccess(""); setOldPassword(""); setNewPassword(""); setConfirmNewPassword("");}}>
              <svg width="12" height="12" fill="#2196f3" viewBox="0 0 24 24"><path d="M12 17a2 2 0 0 0 2-2v-2a2 2 0 0 0-4 0v2a2 2 0 0 0 2 2zm6-6V9a6 6 0 0 0-12 0v2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2zm-8-2a4 4 0 0 1 8 0v2H6V9z"/></svg>
              Change Password
            </button>
            <button style={{
              background: 'none',
              border: 'none',
              textAlign: 'left',
              padding: '0.35em 0.7em',
              fontSize: '0.65em',
              color: '#1769aa',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3em',
              transition: 'background 0.18s, color 0.18s',
            }}
            onMouseOver={e => {e.currentTarget.style.background = '#e3e8f0'; e.currentTarget.style.color = '#2196f3';}}
            onMouseOut={e => {e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#1769aa';}}
            onClick={() => {setSettingsOpen(false); /* TODO: Open subscriptions page */}}>
              <svg width="12" height="12" fill="#2196f3" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              Subscriptions
            </button>
          </div>
        )}
      </div>
      {/* Edit User Modal */}
      {editModalOpen && (
        <div className="admin-draft-preview-modal" style={{zIndex: 2000}}>
          <div className="admin-draft-preview-content" style={{minWidth: 320, maxWidth: 400}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
              <span style={{fontWeight: 700, color: '#1769aa', fontSize: '1.15em'}}>Edit User</span>
              <button onClick={() => { setEditModalOpen(false); setEditError(""); }} style={{background: 'none', border: 'none', fontSize: 22, color: '#b5b5d6', cursor: 'pointer'}}>×</button>
            </div>
            <form onSubmit={handleEditSubmit} style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '1.1em', marginTop: '1.2em'}}>
              <label style={{color: '#1769aa', fontWeight: 600}}>Username
                <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} className="admin-edit-input" style={{width: '100%', marginTop: 4}} required />
              </label>
              <label style={{color: '#1769aa', fontWeight: 600}}>Email
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="admin-edit-input" style={{width: '100%', marginTop: 4}} required />
              </label>
              {editError && <div style={{color: '#b71c1c', fontWeight: 500, fontSize: '0.98em'}}>{editError}</div>}
              <button type="submit" className="admin-drafts-btn" style={{marginTop: 8}}>Submit</button>
            </form>
          </div>
        </div>
      )}
      {/* Password Prompt Modal */}
      {passwordPromptOpen && (
        <div className="admin-draft-preview-modal" style={{zIndex: 2100}}>
          <div className="admin-draft-preview-content" style={{minWidth: 320, maxWidth: 400}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
              <span style={{fontWeight: 700, color: '#1769aa', fontSize: '1.1em'}}>Enter Password</span>
              <button onClick={() => { setPasswordPromptOpen(false); setEditLoading(false); setEditPassword(""); setEditError(""); }} style={{background: 'none', border: 'none', fontSize: 22, color: '#b5b5d6', cursor: 'pointer'}}>×</button>
            </div>
            <form onSubmit={handlePasswordSubmit} style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '1.1em', marginTop: '1.2em'}}>
              <label style={{color: '#1769aa', fontWeight: 600}}>Password
                <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} className="admin-edit-input" style={{width: '100%', marginTop: 4}} required autoFocus />
              </label>
              {editError && <div style={{color: '#b71c1c', fontWeight: 500, fontSize: '0.98em'}}>{editError}</div>}
              <button type="submit" className="admin-drafts-btn" style={{marginTop: 8}} disabled={editLoading}>{editLoading ? 'Updating...' : 'Confirm & Update'}</button>
            </form>
          </div>
        </div>
      )}
      {/* Change Password Modal */}
      {changePwdModalOpen && (
        <div className="admin-draft-preview-modal" style={{zIndex: 2200}}>
          <div className="admin-draft-preview-content" style={{minWidth: 320, maxWidth: 400}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
              <span style={{fontWeight: 700, color: '#1769aa', fontSize: '1.1em'}}>Change Password</span>
              <button onClick={() => { setChangePwdModalOpen(false); setChangePwdError(""); setChangePwdSuccess(""); }} style={{background: 'none', border: 'none', fontSize: 22, color: '#b5b5d6', cursor: 'pointer'}}>×</button>
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
              if (newPassword.length < 6) {
                setChangePwdError("New password must be at least 6 characters");
                return;
              }
              setChangePwdLoading(true);
              try {
                const res = await fetch("http://localhost:8080/changePassword", {
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
            }} style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '1.1em', marginTop: '1.2em'}}>
              <label style={{color: '#1769aa', fontWeight: 600}}>Old Password
                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="admin-edit-input" style={{width: '100%', marginTop: 4}} required autoFocus />
              </label>
              <label style={{color: '#1769aa', fontWeight: 600}}>New Password
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="admin-edit-input" style={{width: '100%', marginTop: 4}} required />
              </label>
              <label style={{color: '#1769aa', fontWeight: 600}}>Confirm New Password
                <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="admin-edit-input" style={{width: '100%', marginTop: 4}} required />
              </label>
              {changePwdError && <div style={{color: '#b71c1c', fontWeight: 500, fontSize: '0.98em'}}>{changePwdError}</div>}
              {changePwdSuccess && <div style={{color: '#388e3c', fontWeight: 600, fontSize: '0.98em'}}>{changePwdSuccess}</div>}
              <button type="submit" className="admin-drafts-btn" style={{marginTop: 8}} disabled={changePwdLoading}>{changePwdLoading ? 'Updating...' : 'Change Password'}</button>
            </form>
          </div>
        </div>
      )}
      {/* Email Modal for Authorized View Only */}
      {showEmailModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px rgba(33,150,243,0.13)' }}>
            <h3 style={{ color: '#1769aa', fontWeight: 700, marginBottom: 16 }}>Enter allowed emails (press Enter after each)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {viewEmails.map((email, idx) => (
                <span key={idx} style={{ background: '#e9eafc', color: '#1769aa', padding: '4px 10px', borderRadius: 16, display: 'flex', alignItems: 'center', fontSize: 15 }}>
                  {email}
                  <button onClick={() => {
                    const newEmails = viewEmails.filter((e, i) => i !== idx);
                    setViewEmails(newEmails);
                    if (newEmails.length === 0) setGeneratedViewLink("");
                  }} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#b71c1c', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>&times;</button>
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
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1.5px solid #e5e7eb', fontSize: 16, marginBottom: 8, background: '#fff', color: '#1769aa' }}
            />
            {viewEmailError && <div style={{ color: '#b71c1c', marginBottom: 8 }}>{viewEmailError}</div>}
            {generatedViewLink && (
              <div style={{ margin: '16px 0 8px 0', wordBreak: 'break-all', background: '#f0f4fd', padding: 18, borderRadius: 12, boxShadow: '0 2px 8px rgba(33,150,243,0.10)' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <LinkIcon />
                  <span style={{ fontSize: 16, color: '#1769aa', fontWeight: 700 }}>Invite-Only View Link</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 15, marginBottom: 14, wordBreak: 'break-all', color: '#1769aa', border: '1.5px solid #e5e7eb', background: '#fff', padding: 10, borderRadius: 8 }}>{generatedViewLink}</div>
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedViewLink); setCopyMsg('Copied!'); setTimeout(() => setCopyMsg(''), 1200); }}
                  style={{ padding: '0.7em 2em', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16, boxShadow: '0 2px 8px rgba(33,150,243,0.10)', transition: 'background 0.2s, color 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1769aa 0%, #2196f3 100%)'}
                  onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)'}
                >Copy</button>
                {copyMsg && <span style={{ color: '#43e97b', marginLeft: 10, fontWeight: 600 }}>{copyMsg}</span>}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowEmailModal(false); setViewEmails([]); setEmailInput(""); setViewEmailError(""); setGeneratedViewLink(""); setViewLinkLoading(false); setPendingWallId(null); }} style={{ padding: '0.6em 1.5em', borderRadius: 8, border: 'none', background: '#e0e0e0', color: '#1769aa', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
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
                style={{ padding: '0.6em 1.5em', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                disabled={viewLinkLoading}
              >
                {viewLinkLoading ? 'Generating...' : 'Generate Link'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Email Modal for Authorized Edit Only */}
      {showEditEmailModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px rgba(33,150,243,0.13)' }}>
            <h3 style={{ color: '#1769aa', fontWeight: 700, marginBottom: 16 }}>Enter allowed emails for editing (press Enter after each)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {editEmails.map((email, idx) => (
                <span key={idx} style={{ background: '#e9eafc', color: '#1769aa', padding: '4px 10px', borderRadius: 16, display: 'flex', alignItems: 'center', fontSize: 15 }}>
                  {email}
                  <button onClick={() => {
                    const newEmails = editEmails.filter((e, i) => i !== idx);
                    setEditEmails(newEmails);
                    if (newEmails.length === 0) setGeneratedEditLink("");
                  }} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#b71c1c', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>&times;</button>
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
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1.5px solid #e5e7eb', fontSize: 16, marginBottom: 8, background: '#fff', color: '#1769aa' }}
            />
            {editEmailError && <div style={{ color: '#b71c1c', marginBottom: 8 }}>{editEmailError}</div>}
            {generatedEditLink && (
              <div style={{ margin: '16px 0 8px 0', wordBreak: 'break-all', background: '#f0f4fd', padding: 18, borderRadius: 12, boxShadow: '0 2px 8px rgba(33,243,150,0.10)' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <LinkIcon />
                  <span style={{ fontSize: 16, color: '#1769aa', fontWeight: 700 }}>Invite-Only Edit Link</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 15, marginBottom: 14, wordBreak: 'break-all', color: '#1769aa', border: '1.5px solid #e5e7eb', background: '#fff', padding: 10, borderRadius: 8 }}>{generatedEditLink}</div>
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedEditLink); setCopyMsg('Copied!'); setTimeout(() => setCopyMsg(''), 1200); }}
                  style={{ padding: '0.7em 2em', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#1769aa', fontWeight: 700, cursor: 'pointer', fontSize: 16, boxShadow: '0 2px 8px rgba(33,243,150,0.10)', transition: 'background 0.2s, color 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)'}
                  onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'}
                >Copy</button>
                {copyMsg && <span style={{ color: '#43e97b', marginLeft: 10, fontWeight: 600 }}>{copyMsg}</span>}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowEditEmailModal(false); setEditEmails([]); setEditEmailInput(""); setEditEmailError(""); setGeneratedEditLink(""); setEditLinkLoading(false); setPendingEditWallId(null); }} style={{ padding: '0.6em 1.5em', borderRadius: 8, border: 'none', background: '#e0e0e0', color: '#1769aa', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
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
                style={{ padding: '0.6em 1.5em', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#1769aa', fontWeight: 700, cursor: 'pointer' }}
                disabled={editLinkLoading}
              >
                {editLinkLoading ? 'Generating...' : 'Generate Link'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Unauthorized View Link Modal */}
      {generatedUnauthorizedViewLink && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 36, minWidth: 340, maxWidth: 420, boxShadow: '0 8px 32px rgba(33,150,243,0.13)', position: 'relative', width: '90vw' }}>
           <button onClick={() => setGeneratedUnauthorizedViewLink("")} style={{ position: 'absolute', top: 14, right: 18, background: 'none', border: 'none', fontSize: 26, color: '#b5b5d6', cursor: 'pointer', fontWeight: 700, zIndex: 2 }} title="Close">×</button>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
             <LinkIcon />
              <span style={{ fontSize: 18, color: '#1769aa', fontWeight: 700 }}>Shareable Link</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 15, marginBottom: 14, wordBreak: 'break-all', background: '#f0f4fd', padding: 12, borderRadius: 8, color: '#1769aa', border: '1.5px solid #e5e7eb' }}>{generatedUnauthorizedViewLink}</div>
            <button
              onClick={() => { navigator.clipboard.writeText(generatedUnauthorizedViewLink); setCopyMsg('Copied!'); setTimeout(() => setCopyMsg(''), 1200); }}
              style={{ padding: '0.7em 2em', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16, boxShadow: '0 2px 8px rgba(33,150,243,0.10)', transition: 'background 0.2s, color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1769aa 0%, #2196f3 100%)'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)'}
            >Copy</button>
            {copyMsg && <span style={{ color: '#43e97b', marginLeft: 10, fontWeight: 600 }}>{copyMsg}</span>}
          </div>
        </div>
      )}
      {/* Unauthorized Edit Link Modal */}
      {generatedUnauthorizedEditLink && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 36, minWidth: 340, maxWidth: 420, boxShadow: '0 8px 32px rgba(33,243,150,0.13)', position: 'relative', width: '90vw' }}>
           <button onClick={() => setGeneratedUnauthorizedEditLink("")} style={{ position: 'absolute', top: 14, right: 18, background: 'none', border: 'none', fontSize: 26, color: '#b5b5d6', cursor: 'pointer', fontWeight: 700, zIndex: 2 }} title="Close">×</button>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
             <LinkIcon />
              <span style={{ fontSize: 18, color: '#1769aa', fontWeight: 700 }}>Shareable Link</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 15, marginBottom: 14, wordBreak: 'break-all', background: '#f0f4fd', padding: 12, borderRadius: 8, color: '#1769aa', border: '1.5px solid #e5e7eb' }}>{generatedUnauthorizedEditLink}</div>
            <button
              onClick={() => { navigator.clipboard.writeText(generatedUnauthorizedEditLink); setCopyMsg('Copied!'); setTimeout(() => setCopyMsg(''), 1200); }}
              style={{ padding: '0.7em 2em', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#1769aa', fontWeight: 700, cursor: 'pointer', fontSize: 16, boxShadow: '0 2px 8px rgba(33,243,150,0.10)', transition: 'background 0.2s, color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'}
            >Copy</button>
            {copyMsg && <span style={{ color: '#43e97b', marginLeft: 10, fontWeight: 600 }}>{copyMsg}</span>}
          </div>
        </div>
      )}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          background: "linear-gradient(120deg, #f0f4fd 0%, #e9eafc 100%)",
        }}
      >
        {/* Profile Card */}
        <div
          style={{
            marginLeft: "5vw",
            height: "100vh",
            background: "linear-gradient(135deg, #fff 60%, #e9eafc 100%)",
            boxShadow: "0 8px 32px rgba(33,150,243,0.13)",
            borderRadius: "22px",
            padding: "2.5rem 2.8rem",
            maxWidth: 420,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5em",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5em",
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: !profilePhotoPreview
                  ? "linear-gradient(135deg, #2196f3 60%, #1769aa 100%)"
                  : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "0.5em",
                boxShadow: isPhotoHover ? "0 0 0 4px #2196f3, 0 2px 12px rgba(33,150,243,0.13)" : "0 2px 12px rgba(33,150,243,0.10)",
                position: 'relative',
                overflow: 'hidden',
                border: isPhotoHover ? '2.5px solid #2196f3' : '2.5px solid #e9eafc',
                transition: 'box-shadow 0.2s, border 0.2s',
                cursor: 'pointer',
              }}
              title="Profile Photo"
              onMouseEnter={() => setIsPhotoHover(true)}
              onMouseLeave={() => setIsPhotoHover(false)}
            >
              {profilePhotoPreview ? (
                <img
                  src={profilePhotoPreview.startsWith('data:') ? profilePhotoPreview : `data:image/*;base64,${profilePhotoPreview}`}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
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
              style={{
                marginTop: 0,
                marginBottom: '0.5em',
                background: 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '1em',
                boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
                letterSpacing: '0.01em',
                padding: '0.7em 1.5em',
                transition: 'background 0.2s, color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24" style={{marginRight: 6}}>
                <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm8-10h-3.17l-1.84-2.63A2 2 0 0 0 13.42 3h-2.84a2 2 0 0 0-1.57.87L7.17 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm-8 10a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"/>
              </svg>
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
              style={{
                background: profilePhotoPreview ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' : '#e0e0e0',
                color: profilePhotoPreview ? '#1769aa' : '#b5b5d6',
                fontWeight: 700,
                border: 'none',
                borderRadius: '10px',
                cursor: profilePhotoPreview ? 'pointer' : 'not-allowed',
                fontSize: '1em',
                boxShadow: profilePhotoPreview ? '0 2px 8px rgba(33,243,150,0.10)' : 'none',
                letterSpacing: '0.01em',
                padding: '0.7em 1.5em',
                marginBottom: '1em',
                transition: 'background 0.2s, color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="20" height="20" fill={profilePhotoPreview ? '#1769aa' : '#b5b5d6'} viewBox="0 0 24 24" style={{marginRight: 6}}>
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Save Photo
            </button>
            <h1
              style={{
                color: "#1769aa",
                fontWeight: 800,
                fontSize: "2em",
                marginBottom: "0.2em",
                letterSpacing: "0.01em",
              }}
            >
              Profile
            </h1>
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "1.2em",
              }}
            >
              <div
                style={{
                  background: "#e9eafc",
                  padding: "1.1em",
                  borderRadius: "10px",
                  boxShadow: "0 1px 4px rgba(33,150,243,0.06)",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    color: "#1769aa",
                    fontWeight: 700,
                    fontSize: "1.08em",
                  }}
                >
                  User ID
                </span>
                <div
                  style={{
                    fontSize: "1.13em",
                    marginTop: "0.3em",
                    fontWeight: 500,
                  }}
                >
                  {user.id}
                </div>
              </div>
              <div
                style={{
                  background: "#e9eafc",
                  padding: "1.1em",
                  borderRadius: "10px",
                  boxShadow: "0 1px 4px rgba(33,150,243,0.06)",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    color: "#1769aa",
                    fontWeight: 700,
                    fontSize: "1.08em",
                  }}
                >
                  Username
                </span>
                <div
                  style={{
                    fontSize: "1.13em",
                    marginTop: "0.3em",
                    fontWeight: 500,
                  }}
                >
                  {user.username}
                </div>
              </div>
              <div
                style={{
                  background: "#e9eafc",
                  padding: "1.1em",
                  borderRadius: "10px",
                  boxShadow: "0 1px 4px rgba(33,150,243,0.06)",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    color: "#1769aa",
                    fontWeight: 700,
                    fontSize: "1.08em",
                  }}
                >
                  Email
                </span>
                <div
                  style={{
                    fontSize: "1.13em",
                    marginTop: "0.3em",
                    fontWeight: 500,
                  }}
                >
                  {user.email}
                </div>
              </div>
            </div>
          </div>
          {/* Button Group: Delete User and Logout */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.7em", marginTop: "1.5em" }}>
            <button
              onClick={async () => {
                const password = prompt("Please enter your password to delete your account:");
                if (!password) return;
                try {
                  const res = await fetch("http://localhost:8080/deleteUser", {
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
              style={{
                width: "100%",
                padding: "1em 2.2em",
                background: "linear-gradient(90deg, #b71c1c 0%, #ff4d4d 100%)",
                color: "#fff",
                fontWeight: 700,
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "1.13em",
                boxShadow: "0 2px 8px rgba(183,28,28,0.10)",
                letterSpacing: "0.01em",
                transition: "background 0.2s, color 0.2s, transform 0.15s",
              }}
              onMouseOver={e => (e.currentTarget.style.background = "linear-gradient(90deg, #ff4d4d 0%, #b71c1c 100%)")}
              onMouseOut={e => (e.currentTarget.style.background = "linear-gradient(90deg, #b71c1c 0%, #ff4d4d 100%)")}
            >
              Delete User
            </button>
          <button
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/Login");
            }}
            style={{
                width: "100%",
              padding: "1em 2.2em",
              background: "linear-gradient(90deg, #ff4d4d 0%, #ff7b7b 100%)",
              color: "#fff",
              fontWeight: 700,
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "1.13em",
              boxShadow: "0 2px 8px rgba(255,77,77,0.10)",
              letterSpacing: "0.01em",
              transition: "background 0.2s, color 0.2s, transform 0.15s",
            }}
              onMouseOver={e => (e.currentTarget.style.background = "linear-gradient(90deg, #ff7b7b 0%, #ff4d4d 100%)")}
              onMouseOut={e => (e.currentTarget.style.background = "linear-gradient(90deg, #ff4d4d 0%, #ff7b7b 100%)")}
          >
            Logout
          </button>
          </div>
        </div>
        {/* Drafts Section OUTSIDE profile card */}
        <div
          style={{
            flex: 1,
            marginLeft: "3vw",
            marginTop: "2.5em",
            maxWidth: 700,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              boxShadow: "0 2px 12px rgba(33,150,243,0.08)",
              padding: "2.2em 2.5em",
              border: "1.5px solid #e5e7eb",
              width: "100%",
            }}
          >
            <h2
              style={{
                color: "#1769aa",
                fontWeight: 800,
                fontSize: "1.5em",
                marginBottom: "1.2em",
              }}
            >
              Your Drafts
            </h2>
            {drafts.length === 0 ? (
              <div style={{ color: "#b5b5d6", fontStyle: "italic" }}>
                No drafts saved yet.
              </div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {drafts.map((draft, idx) => (
                  <li
                    key={draft.timestamp}
                    style={{
                      background: "#f0f4fd",
                      marginBottom: "0.7em",
                      borderRadius: "8px",
                      padding: "0.8em 1em",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow: "0 1px 4px rgba(33,150,243,0.06)",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#1769aa" }}>
                      {draft.name || `Draft ${idx + 1}`}
                    </span>
                    <div style={{ display: "flex", gap: "0.7em" }}>
                      <button
                        style={{
                          padding: "0.5em 1.2em",
                          background:
                            "linear-gradient(90deg, #2196f3 0%, #1769aa 100%)",
                          color: "#fff",
                          fontWeight: 600,
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "1em",
                          boxShadow: "0 2px 8px rgba(33,150,243,0.10)",
                        }}
                        onClick={() =>
                          navigate("/mainWall", { state: { draft } })
                        }
                      >
                        Load
                      </button>
                      <button
                        style={{
                          padding: "0.5em 1.2em",
                          background:
                            "linear-gradient(90deg, #ff4d4d 0%, #ff7b7b 100%)",
                          color: "#fff",
                          fontWeight: 600,
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "1em",
                          boxShadow: "0 2px 8px rgba(255,77,77,0.10)",
                        }}
                        onClick={() => handleDeleteDraft(draft.wall_id)}
                      >
                        Delete
                      </button>
                      <button
                        style={{
                          padding: "0.5em 1.2em",
                          background:
                            "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
                          color: "#1769aa",
                          fontWeight: 600,
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "1em",
                          boxShadow: "0 2px 8px rgba(33,243,150,0.10)",
                          position: 'relative',
                        }}
                        onClick={() => setShareMenuOpen(draft.wall_id)}
                      >
                        Share
                        {shareMenuOpen === draft.wall_id && (
                          <div
                            ref={shareMenuRef}
                            style={{
                              position: 'absolute',
                              top: '110%',
                              right: 0,
                              background: '#fff',
                              border: '1.5px solid #e5e7eb',
                              borderRadius: 8,
                              boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
                              zIndex: 100,
                              minWidth: 120,
                              padding: '0.3em 0',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.1em',
                            }}
                          >
                            {authorizedSubMenuOpen === draft.wall_id ? (
                              <>
                                <button
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    textAlign: 'left',
                                    padding: '0.5em 1.2em',
                                    color: '#1769aa',
                                    fontWeight: 600,
                                    fontSize: '1em',
                                    cursor: 'pointer',
                                    borderRadius: 6,
                                    transition: 'background 0.18s, color 0.18s',
                                  }}
                                  onClick={() => {
                                    setShowEmailModal(true);
                                    setPendingWallId(draft.wall_id);
                                    setShareMenuOpen(null);
                                    setAuthorizedSubMenuOpen(null);
                                    setUnauthorizedSubMenuOpen(null);
                                  }}
                                >
                                  View Only
                                </button>
                                <button
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    textAlign: 'left',
                                    padding: '0.5em 1.2em',
                                    color: '#1769aa',
                                    fontWeight: 600,
                                    fontSize: '1em',
                                    cursor: 'pointer',
                                    borderRadius: 6,
                                    transition: 'background 0.18s, color 0.18s',
                                  }}
                                  onClick={() => {
                                    setShowEditEmailModal(true);
                                    setPendingEditWallId(draft.wall_id);
                                    setShareMenuOpen(null);
                                    setAuthorizedSubMenuOpen(null);
                                    setUnauthorizedSubMenuOpen(null);
                                  }}
                                >
                                  Edit Draft
                                </button>
                              </>
                            ) : unauthorizedSubMenuOpen === draft.wall_id ? (
                              <>
                                <button
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    textAlign: 'left',
                                    padding: '0.5em 1.2em',
                                    color: '#1769aa',
                                    fontWeight: 600,
                                    fontSize: '1em',
                                    cursor: 'pointer',
                                    borderRadius: 6,
                                    transition: 'background 0.18s, color 0.18s',
                                  }}
                                  onClick={() => {
                                    setShareMenuOpen(null);
                                    setAuthorizedSubMenuOpen(null);
                                    setUnauthorizedSubMenuOpen(null);
                                    handlePublicShare(draft.wall_id);
                                  }}
                                >
                                  View Only
                                </button>
                                <button
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    textAlign: 'left',
                                    padding: '0.5em 1.2em',
                                    color: '#1769aa',
                                    fontWeight: 600,
                                    fontSize: '1em',
                                    cursor: 'pointer',
                                    borderRadius: 6,
                                    transition: 'background 0.18s, color 0.18s',
                                  }}
                                  onClick={() => {
                                    setShareMenuOpen(null);
                                    setAuthorizedSubMenuOpen(null);
                                    setUnauthorizedSubMenuOpen(null);
                                    handleEditShare(draft.wall_id);
                                  }}
                                >
                                  Edit Draft
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    textAlign: 'left',
                                    padding: '0.5em 1.2em',
                                    color: '#1769aa',
                                    fontWeight: 600,
                                    fontSize: '1em',
                                    cursor: 'pointer',
                                    borderRadius: 6,
                                    transition: 'background 0.18s, color 0.18s',
                                  }}
                                  onClick={() => { setAuthorizedSubMenuOpen(draft.wall_id); setUnauthorizedSubMenuOpen(null); }}
                                >
                                  Authorized
                                </button>
                                <button
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    textAlign: 'left',
                                    padding: '0.5em 1.2em',
                                    color: '#1769aa',
                                    fontWeight: 600,
                                    fontSize: '1em',
                                    cursor: 'pointer',
                                    borderRadius: 6,
                                    transition: 'background 0.18s, color 0.18s',
                                  }}
                                  onClick={() => { setUnauthorizedSubMenuOpen(draft.wall_id); setAuthorizedSubMenuOpen(null); }}
                                >
                                  Unauthorized
                                </button>
                              </>
                            )}
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
