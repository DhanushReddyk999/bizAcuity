import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buildApiUrl } from './config/api';

// Example feature tree config (replace with your actual features)
const featureTree = [
  { key: 'edit_wall', label: 'Edit Wall' },
  { key: 'save_wall', label: 'Save Wall' },
  { key: 'download_wall', label: 'Download Wall' },
  {
    key: 'stickers', label: 'Stickers', children: [
      { key: 'stickers_tables', label: 'Tables' },
      { key: 'stickers_garlands', label: 'Garlands' },
      { key: 'stickers_frames', label: 'Frames' },
      { key: 'stickers_candles', label: 'Candles' },
      { key: 'stickers_flowers', label: 'Flowers' },
      { key: 'stickers_fruits', label: 'Fruits' },
      { key: 'stickers_others', label: 'Others' },
    ]
  },
  {
    key: 'share_wall', label: 'Share Wall', children: [
      {
        key: 'share_authorized', label: 'Authorized', children: [
          { key: 'share_authorized_view', label: 'View' },
          { key: 'share_authorized_edit', label: 'Edit' },
        ]
      },
      {
        key: 'share_unauthorized', label: 'Unauthorized', children: [
          { key: 'share_unauthorized_view', label: 'View' },
          { key: 'share_unauthorized_edit', label: 'Edit' },
        ]
      },
    ]
  },
  {
    key: 'change_background', label: 'Change Background', children: [
      { key: 'background_fill_style', label: 'Fill Style' },
      { key: 'background_custom_image', label: 'Custom Background Image' },
    ]
  },
  { key: 'add_image', label: 'Add Image' },
  { key: 'remove_image', label: 'Remove Image' },
  { key: 'resize_wall', label: 'Resize Wall' },
];

function FeatureToggleTree({ tree, checked, onToggle, parentEnabled, level = 0 }) {
  return (
    <ul style={{ listStyle: 'none', paddingLeft: level === 0 ? 0 : 22, margin: 0 }}>
      {tree.map((node) => {
        const isChecked = checked.includes(node.key);
        return (
          <li key={node.key} style={{ marginBottom: 10, background: isChecked && node.children ? '#f0f4ff' : 'transparent', borderRadius: 8, padding: node.children ? '4px 0 4px 0' : 0, transition: 'background 0.18s' }}>
            <label style={{
              fontWeight: 500,
              color: parentEnabled ? '#22223b' : '#b5b5d6',
              cursor: parentEnabled ? 'pointer' : 'not-allowed',
              fontSize: '1.08em',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '2px 0',
              borderLeft: level > 0 ? '2.5px solid #e9eafc' : 'none',
              marginLeft: level > 0 ? 6 : 0,
            }}>
              <input
                type="checkbox"
                checked={isChecked}
                disabled={!parentEnabled}
                onChange={() => onToggle(node.key, !isChecked)}
                style={{ marginRight: 8, width: 20, height: 20, accentColor: '#7c3aed', cursor: parentEnabled ? 'pointer' : 'not-allowed' }}
              />
              {node.label}
            </label>
            {node.children && isChecked && (
              <FeatureToggleTree
                tree={node.children}
                checked={checked}
                onToggle={onToggle}
                parentEnabled={isChecked && parentEnabled}
                level={level + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function PlanFeatures() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [downloadWallEnabled, setDownloadWallEnabled] = useState(false);
  const [customBgEnabled, setCustomBgEnabled] = useState(false);
  // Share Wall state
  const [shareAuthView, setShareAuthView] = useState(false);
  const [shareAuthEdit, setShareAuthEdit] = useState(false);
  const [shareUnauthView, setShareUnauthView] = useState(false);
  const [shareUnauthEdit, setShareUnauthEdit] = useState(false);
  // Max Drafts
  const [maxDrafts, setMaxDrafts] = useState("");
  const [initialMaxDrafts, setInitialMaxDrafts] = useState("");
  const [uploadImageEnabled, setUploadImageEnabled] = useState(false);
  // Stickers
  const [maxStickers, setMaxStickers] = useState(2);
  const [initialMaxStickers, setInitialMaxStickers] = useState(2);

  useEffect(() => {
    async function fetchPlanAndFeatures() {
      setLoading(true);
      setError("");
      
      // Get user token for authentication
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch(buildApiUrl('/api/admin/plans'), {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (res.status === 401 || res.status === 403) {
          setError("Authentication failed. Please log in again.");
          setLoading(false);
          return;
        }
        
        const plans = await res.json();
        const thisPlan = plans.find(p => String(p.id) === String(planId));
        setPlan(thisPlan);
        setDownloadWallEnabled(thisPlan?.download_wall_enabled === 1);
        setCustomBgEnabled(thisPlan?.custom_bg_enabled === 1);
        setUploadImageEnabled(thisPlan?.upload_image_enabled === 1);
        setMaxDrafts(thisPlan?.max_drafts ?? "");
        setInitialMaxDrafts(thisPlan?.max_drafts ?? "");
        setMaxStickers(thisPlan?.stickers_limit ?? 2);
        setInitialMaxStickers(thisPlan?.stickers_limit ?? 2);
        setShareAuthView(thisPlan?.share_authorized_view_enabled === 1);
        setShareAuthEdit(thisPlan?.share_authorized_edit_enabled === 1);
        setShareUnauthView(thisPlan?.share_unauthorized_view_enabled === 1);
        setShareUnauthEdit(thisPlan?.share_unauthorized_edit_enabled === 1);
      } catch (err) {
        setError("Failed to load plan");
      }
      setLoading(false);
    }
    fetchPlanAndFeatures();
  }, [planId]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    
    // Get user token for authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      setError("Authentication required");
      setSaving(false);
      return;
    }
    
    try {
      // Save feature toggles (download, custom bg, upload image)
      await fetch(buildApiUrl(`/api/admin/plans/${planId}/feature-toggles`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          download_wall_enabled: downloadWallEnabled,
          custom_bg_enabled: customBgEnabled,
          upload_image_enabled: uploadImageEnabled,
        }),
      });
      // Save max drafts if changed
      if (String(maxDrafts) !== String(initialMaxDrafts)) {
        await fetch(buildApiUrl(`/api/admin/plans/${planId}/max-drafts`), {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ maxDrafts: maxDrafts === "" ? null : Number(maxDrafts) }),
        });
        setInitialMaxDrafts(maxDrafts);
      }
      // Save max stickers if changed
      if (String(maxStickers) !== String(initialMaxStickers)) {
        await fetch(buildApiUrl(`/api/admin/plans/${planId}/sticker-limit`), {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ stickers_limit: maxStickers }),
        });
        setInitialMaxStickers(maxStickers);
      }
      // Save share toggles
      await fetch(buildApiUrl(`/api/admin/plans/${planId}/share-toggles`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          share_authorized_view_enabled: shareAuthView ? 1 : 0,
          share_authorized_edit_enabled: shareAuthEdit ? 1 : 0,
          share_unauthorized_view_enabled: shareUnauthView ? 1 : 0,
          share_unauthorized_edit_enabled: shareUnauthEdit ? 1 : 0,
        }),
      });
      setSuccess("Features updated successfully!");
    } catch (err) {
      setError("Failed to save features");
    }
    setSaving(false);
  };

  const saveDisabled =
    saving ||
    (String(maxDrafts) === String(initialMaxDrafts)) &&
    (String(maxStickers) === String(initialMaxStickers)) &&
    !downloadWallEnabled &&
    !customBgEnabled &&
    !uploadImageEnabled &&
    !shareAuthView &&
    !shareAuthEdit &&
    !shareUnauthView &&
    !shareUnauthEdit;

  if (loading) return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 25%, #dee2e6 50%, #e9ecef 75%, #f8f9fa 100%)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#1769aa',
      fontSize: '1.2rem',
      fontWeight: '600'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        padding: '2rem 3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        Loading plan features...
      </div>
    </div>
  );
  
  if (!plan) return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 25%, #dee2e6 50%, #e9ecef 75%, #f8f9fa 100%)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#1769aa',
      fontSize: '1.2rem',
      fontWeight: '600'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        padding: '2rem 3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        Plan not found
      </div>
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 25%, #dee2e6 50%, #e9ecef 75%, #f8f9fa 100%)',
      position: 'relative',
      overflowX: 'hidden',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Home page background pattern */}
      <div style={{
        content: '',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(ellipse 80% 20% at 20% 20%, rgba(200,200,200,0.3) 0%, transparent 50%),
          radial-gradient(ellipse 70% 15% at 80% 30%, rgba(200,200,200,0.25) 0%, transparent 45%),
          radial-gradient(ellipse 90% 25% at 40% 50%, rgba(150,200,255,0.4) 0%, transparent 55%),
          radial-gradient(ellipse 60% 20% at 70% 60%, rgba(100,150,255,0.5) 0%, transparent 50%),
          radial-gradient(ellipse 85% 30% at 10% 70%, rgba(50,100,255,0.6) 0%, transparent 60%),
          radial-gradient(ellipse 75% 25% at 90% 80%, rgba(0,100,255,0.7) 0%, transparent 65%),
          radial-gradient(ellipse 95% 35% at 30% 85%, rgba(0,150,255,0.8) 0%, transparent 70%),
          radial-gradient(ellipse 65% 20% at 60% 90%, rgba(0,200,255,0.9) 0%, transparent 75%),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 20px,
            rgba(200,200,200,0.1) 20px,
            rgba(200,200,200,0.1) 22px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 40px,
            rgba(150,200,255,0.15) 40px,
            rgba(150,200,255,0.15) 42px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 60px,
            rgba(100,150,255,0.2) 60px,
            rgba(100,150,255,0.2) 62px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 80px,
            rgba(50,100,255,0.25) 80px,
            rgba(50,100,255,0.25) 82px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 100px,
            rgba(0,100,255,0.3) 100px,
            rgba(0,100,255,0.3) 102px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 120px,
            rgba(0,150,255,0.35) 120px,
            rgba(0,150,255,0.35) 122px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 140px,
            rgba(0,200,255,0.4) 140px,
            rgba(0,200,255,0.4) 142px
          )
        `,
        zIndex: -1,
        opacity: 0.9
      }} />
      {/* Header Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '2.5rem',
        marginBottom: '2rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <div>
            <h1 style={{
              color: '#1769aa',
              fontWeight: '800',
              fontSize: '2.5rem',
              margin: '0 0 0.5rem 0'
            }}>
              Plan Features Management
            </h1>
            <p style={{
              color: '#666',
              fontSize: '1.1rem',
              margin: '0',
              fontWeight: '500'
            }}>
              Configure features for <span style={{ fontWeight: '700', color: '#1769aa' }}>{plan.name}</span> plan
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #1769aa 0%, #2196f3 100%)',
            color: 'white',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '1.1rem',
            boxShadow: '0 8px 24px rgba(23, 105, 170, 0.3)'
          }}>
            Plan ID: {plan.id}
          </div>
        </div>
        
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            marginTop: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        {success && (
          <div style={{
            background: 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            marginTop: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ✅ {success}
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Core Features */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3 style={{
            color: '#1a1a2e',
            fontWeight: '700',
            fontSize: '1.5rem',
            margin: '0 0 1.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🚀 Core Features
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                         <label style={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               padding: '1rem',
               background: downloadWallEnabled ? 'rgba(23, 105, 170, 0.1)' : 'rgba(0, 0, 0, 0.05)',
               borderRadius: '12px',
               border: downloadWallEnabled ? '2px solid #1769aa' : '2px solid transparent',
               cursor: 'pointer',
               transition: 'all 0.3s ease'
             }}>
               <div>
                 <div style={{ fontWeight: '600', color: '#1769aa', fontSize: '1.1rem' }}>
                   Download Wall
                 </div>
                 <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                   Allow users to download their wall designs
                 </div>
               </div>
               <input
                 type="checkbox"
                 checked={downloadWallEnabled}
                 onChange={e => setDownloadWallEnabled(e.target.checked)}
                 style={{
                   width: '24px',
                   height: '24px',
                   accentColor: '#1769aa',
                   cursor: 'pointer'
                 }}
               />
             </label>

             <label style={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               padding: '1rem',
               background: customBgEnabled ? 'rgba(23, 105, 170, 0.1)' : 'rgba(0, 0, 0, 0.05)',
               borderRadius: '12px',
               border: customBgEnabled ? '2px solid #1769aa' : '2px solid transparent',
               cursor: 'pointer',
               transition: 'all 0.3s ease'
             }}>
               <div>
                 <div style={{ fontWeight: '600', color: '#1769aa', fontSize: '1.1rem' }}>
                   Custom Background
                 </div>
                 <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                   Allow users to upload custom background images
                 </div>
               </div>
               <input
                 type="checkbox"
                 checked={customBgEnabled}
                 onChange={e => setCustomBgEnabled(e.target.checked)}
                 style={{
                   width: '24px',
                   height: '24px',
                   accentColor: '#1769aa',
                   cursor: 'pointer'
                 }}
               />
             </label>

             <label style={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               padding: '1rem',
               background: uploadImageEnabled ? 'rgba(23, 105, 170, 0.1)' : 'rgba(0, 0, 0, 0.05)',
               borderRadius: '12px',
               border: uploadImageEnabled ? '2px solid #1769aa' : '2px solid transparent',
               cursor: 'pointer',
               transition: 'all 0.3s ease'
             }}>
               <div>
                 <div style={{ fontWeight: '600', color: '#1769aa', fontSize: '1.1rem' }}>
                   Upload Images
                 </div>
                 <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                   Allow users to upload custom images to their walls
                 </div>
               </div>
               <input
                 type="checkbox"
                 checked={uploadImageEnabled}
                 onChange={e => setUploadImageEnabled(e.target.checked)}
                 style={{
                   width: '24px',
                   height: '24px',
                   accentColor: '#1769aa',
                   cursor: 'pointer'
                 }}
               />
             </label>
          </div>
        </div>

        {/* Limits & Restrictions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3 style={{
            color: '#1a1a2e',
            fontWeight: '700',
            fontSize: '1.5rem',
            margin: '0 0 1.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📊 Limits & Restrictions
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '12px'
            }}>
              <label style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'block' }}>
                Max Stickers
              </label>
              <input
                type="number"
                min="0"
                value={maxStickers}
                onChange={e => setMaxStickers(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  background: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                placeholder="2"
              />
              <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                Maximum number of stickers allowed per wall
              </div>
            </div>

            <div style={{
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '12px'
            }}>
              <label style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'block' }}>
                Max Drafts
              </label>
              <input
                type="number"
                min="0"
                value={maxDrafts}
                onChange={e => setMaxDrafts(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  background: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                placeholder="Unlimited"
              />
              <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                Maximum number of saved drafts (leave empty for unlimited)
              </div>
            </div>
          </div>
        </div>

        {/* Sharing Permissions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3 style={{
            color: '#1a1a2e',
            fontWeight: '700',
            fontSize: '1.5rem',
            margin: '0 0 1.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🔗 Sharing Permissions
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '12px'
            }}>
              <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '1.1rem', marginBottom: '1rem' }}>
                Authorized Users
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                 <label style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'space-between',
                   padding: '0.8rem',
                   background: shareAuthView ? 'rgba(23, 105, 170, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                   borderRadius: '8px',
                   border: shareAuthView ? '2px solid #1769aa' : '2px solid transparent',
                   cursor: 'pointer',
                   transition: 'all 0.3s ease'
                 }}>
                   <span style={{ fontWeight: '500', color: '#1769aa' }}>View Access</span>
                   <input
                     type="checkbox"
                     checked={shareAuthView}
                     onChange={e => setShareAuthView(e.target.checked)}
                     style={{
                       width: '20px',
                       height: '20px',
                       accentColor: '#1769aa',
                       cursor: 'pointer'
                     }}
                   />
                 </label>
                 <label style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'space-between',
                   padding: '0.8rem',
                   background: shareAuthEdit ? 'rgba(23, 105, 170, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                   borderRadius: '8px',
                   border: shareAuthEdit ? '2px solid #1769aa' : '2px solid transparent',
                   cursor: 'pointer',
                   transition: 'all 0.3s ease'
                 }}>
                   <span style={{ fontWeight: '500', color: '#1769aa' }}>Edit Access</span>
                   <input
                     type="checkbox"
                     checked={shareAuthEdit}
                     onChange={e => setShareAuthEdit(e.target.checked)}
                     style={{
                       width: '20px',
                       height: '20px',
                       accentColor: '#1769aa',
                       cursor: 'pointer'
                     }}
                   />
                 </label>
              </div>
            </div>

            <div style={{
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '12px'
            }}>
              <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '1.1rem', marginBottom: '1rem' }}>
                Unauthorized Users
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                 <label style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'space-between',
                   padding: '0.8rem',
                   background: shareUnauthView ? 'rgba(23, 105, 170, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                   borderRadius: '8px',
                   border: shareUnauthView ? '2px solid #1769aa' : '2px solid transparent',
                   cursor: 'pointer',
                   transition: 'all 0.3s ease'
                 }}>
                   <span style={{ fontWeight: '500', color: '#1769aa' }}>View Access</span>
                   <input
                     type="checkbox"
                     checked={shareUnauthView}
                     onChange={e => setShareUnauthView(e.target.checked)}
                     style={{
                       width: '20px',
                       height: '20px',
                       accentColor: '#1769aa',
                       cursor: 'pointer'
                     }}
                   />
                 </label>
                 <label style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'space-between',
                   padding: '0.8rem',
                   background: shareUnauthEdit ? 'rgba(23, 105, 170, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                   borderRadius: '8px',
                   border: shareUnauthEdit ? '2px solid #1769aa' : '2px solid transparent',
                   cursor: 'pointer',
                   transition: 'all 0.3s ease'
                 }}>
                   <span style={{ fontWeight: '500', color: '#1769aa' }}>Edit Access</span>
                   <input
                     type="checkbox"
                     checked={shareUnauthEdit}
                     onChange={e => setShareUnauthEdit(e.target.checked)}
                     style={{
                       width: '20px',
                       height: '20px',
                       accentColor: '#1769aa',
                       cursor: 'pointer'
                     }}
                   />
                 </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-start',
        alignItems: 'center'
      }}>
                 <button
           onClick={handleSave}
           disabled={saveDisabled}
           style={{
             background: saveDisabled 
               ? 'linear-gradient(135deg, #ccc 0%, #999 100%)' 
               : 'linear-gradient(135deg, #1769aa 0%, #2196f3 100%)',
             color: 'white',
             border: 'none',
             padding: '1rem 2rem',
             borderRadius: '12px',
             fontSize: '1.1rem',
             fontWeight: '700',
             cursor: saveDisabled ? 'not-allowed' : 'pointer',
             transition: 'all 0.3s ease',
             boxShadow: saveDisabled ? 'none' : '0 8px 24px rgba(23, 105, 170, 0.3)',
             display: 'flex',
             alignItems: 'center',
             gap: '0.5rem'
           }}
         >
           {saving ? '⏳ Saving...' : '💾 Save Changes'}
         </button>
         
         <button
           onClick={() => navigate(-1)}
           disabled={saving}
           style={{
             background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
             color: 'white',
             border: 'none',
             padding: '1rem 2rem',
             borderRadius: '12px',
             fontSize: '1.1rem',
             fontWeight: '700',
             cursor: saving ? 'not-allowed' : 'pointer',
             transition: 'all 0.3s ease',
             boxShadow: '0 8px 24px rgba(108, 117, 125, 0.3)',
             display: 'flex',
             alignItems: 'center',
             gap: '0.5rem'
           }}
         >
           ← Back
         </button>
      </div>
    </div>
  );
} 