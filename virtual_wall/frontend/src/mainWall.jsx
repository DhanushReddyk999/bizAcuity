import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { usePlan } from "./PlanContext";
import { buildApiUrl } from "./config/api";
import { APP_CONSTANTS, getCategoryForSticker } from "./config/constants";

import "./App.css";
import "./wall.css";
import Wall from "./wall.jsx";
import Image from "./image.jsx";
import WallDimensions from "./wall_dimensions.jsx";
import WallBackgrounds from "./wall_backgrounds.jsx";
import StickerPanel from "./stickers.jsx";

function mainWall() {
  let [wallValue, setWallValue] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  let [background, setBackground] = useState(APP_CONSTANTS.DEFAULT_BACKGROUND);
  let [images, setImages] = useState([]);
  const wallRef = useRef(null);
  const [width, setWidth] = useState(APP_CONSTANTS.DEFAULT_WIDTH);
  const [height, setHeight] = useState(APP_CONSTANTS.DEFAULT_HEIGHT);
  const [activeType, setActiveType] = useState(APP_CONSTANTS.DEFAULT_ACTIVE_TYPE);
  const navigate = useNavigate();
  const [wallId, setWallId] = useState(null); // Track current wall_id
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const { planFeatures, plan } = usePlan();
  const planName = plan?.plan || 'free';
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    // If a draft is passed via navigation, load it
    if (
      window.history.state &&
      window.history.state.usr &&
      window.history.state.usr.draft
    ) {
      const draft = window.history.state.usr.draft;
      setBackground(draft.background);
      setImages(draft.images);
      setWidth(draft.width);
      setHeight(draft.height);
      setActiveType(draft.activeType || "fill");
      setWallId(draft.wall_id || null); // Set wall_id if editing
    }
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id && user.token) {
      fetch(buildApiUrl(`/profilePhoto/${user.id}`), {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.photo) setProfilePhoto(data.photo);
        });
      
      // Fetch current draft count
      fetch(buildApiUrl(`/getDrafts/${user.id}`), {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(res => res.ok ? res.json() : [])
        .then(drafts => {
          setDraftCount(drafts.length);
        })
        .catch(err => {
          console.error('Error fetching draft count:', err);
        });
    }
  }, []);

  function drawShapeClip(ctx, shape, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.arc(x + w/2, y + h/2, Math.min(w, h)/2, 0, Math.PI * 2);
    } else if (shape === 'diamond') {
      ctx.moveTo(x + w/2, y);
      ctx.lineTo(x + w, y + h/2);
      ctx.lineTo(x + w/2, y + h);
      ctx.lineTo(x, y + h/2);
      ctx.closePath();
    } else if (shape === 'triangle') {
      ctx.moveTo(x + w/2, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
    } else if (shape === 'hexagon') {
      const r = Math.min(w, h) / 2;
      const cx = x + w/2, cy = y + h/2;
      for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i - Math.PI / 6;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else {
      ctx.rect(x, y, w, h); // rectangle
    }
    ctx.clip();
  }

  function downloadWallWithShapes() {
    if (!planFeatures.download_wall_enabled) {
      setUpgradeMessage('Upgrade your plan to enable Download Wall.');
      setShowUpgradeModal(true);
      return;
    }
    const wallW = parseInt(width);
    const wallH = parseInt(height);
    const canvas = document.createElement('canvas');
    canvas.width = wallW;
    canvas.height = wallH;
    const ctx = canvas.getContext('2d');

    // Draw background
    if (background.startsWith('url(')) {
      const bgUrl = background.match(/url\((.*?)\)/)[1].replace(/['"]/g, '');
      const bgImg = new window.Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, wallW, wallH);
        drawImages();
      };
      bgImg.onerror = () => drawImages();
      bgImg.src = bgUrl;
    } else {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, wallW, wallH);
      drawImages();
    }

    function drawImages() {
      let loaded = 0;
      if (images.length === 0) finish();
      images.forEach((img, idx) => {
        const imageObj = new window.Image();
        imageObj.crossOrigin = 'anonymous';
        imageObj.onload = () => {
          ctx.save();
          drawShapeClip(ctx, img.shape, img.x, img.y, img.width, img.height);
          ctx.drawImage(imageObj, img.x, img.y, img.width, img.height);
          ctx.restore();
          loaded++;
          if (loaded === images.length) finish();
        };
        imageObj.onerror = () => {
          loaded++;
          if (loaded === images.length) finish();
        };
        imageObj.src = img.src;
      });
    }

    function finish() {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'my_wall.png';
      link.click();
    }
  }

  function toMySQLDateTime(ts) {
    const date = new Date(ts);
    return date.toISOString().slice(0, 19).replace("T", " ");
  }

  let handleSaveDraft=async()=>{
    if (!planFeatures.max_drafts && planFeatures.max_drafts !== 0) {
      setUpgradeMessage('Upgrade your plan to enable saving drafts.');
      setShowUpgradeModal(true);
      return;
    }
    const uid = user?.id;

    if (!user) {
      alert("You must be logged in to save drafts.");
      return;
    }
    const name = window.prompt("Enter a name for your draft:");
    if (!name || !name.trim()) {
      alert("Draft not saved. Please provide a name.");
      return;
    }
    const wall_data = {
      background,
      images,
      width,
      height,
      activeType,
      name: name.trim(),
    };
    const base64 = btoa(JSON.stringify(wall_data));
    try{

      const body = {
        uid: uid,
        wall_data: base64,
        timestamp: toMySQLDateTime(Date.now()),
        wall_name: name.trim(),
      };
      if (wallId) {
        body.wall_id = wallId;
      }
      const response = await fetch(buildApiUrl("/saveDrafts"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(body),
      });
      if (response.status === 401 || response.status === 403) {
        const error = await response.text();
        if (error.includes("Free users can only save up to 3 drafts")) {
          setUpgradeMessage(error);
          setShowUpgradeModal(true);
          return;
        }
        localStorage.removeItem("user");
        window.location.href = "/Login";
        return;
      }
      if (response.ok) {
        alert(wallId ? "Draft updated!" : "Draft saved!");
        // Refresh draft count after saving
        if (!wallId) { // Only increment count for new drafts, not updates
          setDraftCount(prev => prev + 1);
        }
      }
      else{
        const error=await response.text()
        alert(error);
      }
    }
    catch (err) {
      alert("Something went wrong while saving draft.");
    }
  }

  function addStickersToWall(selectedStickerSrcs) {
    const newStickers = selectedStickerSrcs.map((src) => ({
      src,
      x: Math.random() * 300,
      y: Math.random() * 200,
      width: 100,
      height: 100,
      shape: "rectangle",
      selected: false,
    }));
    setImages((prev) => [...prev, ...newStickers]);
  }
  let options = [
    { label: "Cottage background", value: "/CottageWall.jpg" },
    { label: "Interior background", value: "/InteriorWall.jpg" },
    { label: "IStock background", value: "/IStockWall.jpg" },
    { label: "Living room background", value: "/LivingRoomWall.jpg" },
    { label: "Spacewall background", value: "/SpaceWall.jpg" },
    { label: "Plain background", value: "/PlainWall.jpg" },
  ];

  // State to track selected sticker category in StickerPanel
  const [selectedStickerCategory, setSelectedStickerCategory] = useState('Tables');

  // Count stickers on the wall for the selected category
  const currentCategoryStickerCount = images.filter(img => getCategoryForSticker(img.src) === selectedStickerCategory).length;

  // Use the plan's stickers_limit as the per-category limit
  const perCategoryStickerLimit = planFeatures.stickers_limit ?? 0;

  return (
    <>
      <div className="wall-container">
        {/* Header Section */}
        <div className="wall-header">
          <div className="wall-profile-avatar"
            onClick={() => navigate("/Profile")}
            title="Go to Profile"
          >
            {profilePhoto ? (
              <img
                src={profilePhoto.startsWith('data:') ? profilePhoto : `data:image/*;base64,${profilePhoto}`}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              <svg width="38" height="38" fill="#b5b5d6" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="5" fill="#b5b5d6" />
                <path d="M12 14c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5z" fill="#e9eafc" />
              </svg>
            )}
          </div>
          {user && user.role === "admin" && (
            <button
              onClick={() => navigate("/Admin")}
              className="wall-admin-btn"
            >
              Admin
            </button>
          )}
          <div className="wall-header-content">
            <div className="wall-header-left">
              <div className="wall-header-title">Altar Designer</div>
              <span className="wall-header-subtitle">Design your own altar with custom backgrounds and sacred decor</span>
            </div>
          </div>
        </div>
      {wallValue && (
        <>
          <StickerPanel 
            onSubmitStickers={addStickersToWall} 
            currentCategory={selectedStickerCategory}
            setCurrentCategory={setSelectedStickerCategory}
            currentCategoryStickerCount={currentCategoryStickerCount}
            categoryStickerLimit={perCategoryStickerLimit}
          />
          <div className="wall-controls">
            <button
              onClick={() => {
                if (!planFeatures.download_wall_enabled) {
                  const upgrade = confirm('Download wall is only available for premium users. Would you like to upgrade your plan?');
                  if (upgrade) {
                    window.location.href = '/subscriptions';
                  }
                  return;
                }
                downloadWallWithShapes();
              }}
              disabled={!planFeatures.download_wall_enabled}
              className={`wall-download-btn ${!planFeatures.download_wall_enabled ? 'disabled' : ''}`}
              title={!planFeatures.download_wall_enabled ? 'Upgrade to premium to download your wall' : 'Download your wall design'}
            >
              Download Wall
              {!planFeatures.download_wall_enabled && (
                <span style={{ fontSize: '0.8em', marginLeft: '0.5em', opacity: 0.8 }}>
                  (Upgrade Required)
                </span>
              )}
            </button>
            <div className="wall-actions">
                              {planFeatures.max_drafts !== null && planFeatures.max_drafts !== undefined && (
                  <div className={`wall-draft-info ${draftCount >= planFeatures.max_drafts ? 'limit-reached' : ''}`}>
                    {draftCount >= planFeatures.max_drafts ? 
                      `⚠️ Draft limit reached (${draftCount}/${planFeatures.max_drafts})` : 
                      `📝 Drafts: ${draftCount}/${planFeatures.max_drafts}`
                    }
                  </div>
                )}
              <button
                onClick={() => {
                  if (planFeatures.max_drafts !== null && planFeatures.max_drafts !== undefined && draftCount >= planFeatures.max_drafts) {
                    const upgrade = confirm(`You've reached your draft limit (${draftCount}/${planFeatures.max_drafts}). Would you like to upgrade your plan to save more drafts?`);
                    if (upgrade) {
                      window.location.href = '/subscriptions';
                    }
                    return;
                  }
                  handleSaveDraft();
                }}
                className={`wall-save-btn ${planFeatures.max_drafts !== null && planFeatures.max_drafts !== undefined && draftCount >= planFeatures.max_drafts ? 'disabled' : ''}`}
                disabled={planFeatures.max_drafts !== null && planFeatures.max_drafts !== undefined && draftCount >= planFeatures.max_drafts}
                title={planFeatures.max_drafts !== null && planFeatures.max_drafts !== undefined && draftCount >= planFeatures.max_drafts ? 
                  `Draft limit reached (${draftCount}/${planFeatures.max_drafts}). Upgrade to save more drafts.` : 
                  `Save current wall as draft (${draftCount}/${planFeatures.max_drafts || '∞'})`}
              >
                Save as Draft
                {planFeatures.max_drafts !== null && planFeatures.max_drafts !== undefined && (
                  <span style={{ fontSize: '0.8em', marginLeft: '0.5em', opacity: 0.8 }}>
                    ({draftCount}/{planFeatures.max_drafts})
                  </span>
                )}
                {planFeatures.max_drafts !== null && planFeatures.max_drafts !== undefined && draftCount >= planFeatures.max_drafts && (
                  <span style={{ fontSize: '0.8em', marginLeft: '0.5em', opacity: 0.8, color: '#ff6b6b' }}>
                    (Upgrade Required)
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setBackground(APP_CONSTANTS.DEFAULT_BACKGROUND);
                  setImages([]);
                  setWidth(APP_CONSTANTS.DEFAULT_WIDTH);
                  setHeight(APP_CONSTANTS.DEFAULT_HEIGHT);
                  setActiveType(APP_CONSTANTS.DEFAULT_ACTIVE_TYPE);
                  setWallId(null);
                }}
                className="wall-reset-btn"
              >
                Default Wall
              </button>
            </div>
          </div>
        </>
      )}
      <div className="wall-main-content">
        {/* Change Background panel in normal flow */}
        <div className="wall-background-panel">
          <h2 className="wall-background-title">
            Change Background
          </h2>
          <div className="wall-background-options">
                          {options.map((img) => (
                <div
                  key={img.label}
                  onClick={() => {
                    setBackground(`url(${img.value})`);
                    setActiveType("external");
                  }}
                  className={`wall-background-option ${background === `url(${img.value})` ? 'selected' : ''}`}
                  style={{
                    backgroundImage: `url(${img.value})`,
                  }}
                  title={img.label}
                >
                                  <div className="wall-background-label">
                    {img.label}
                  </div>
              </div>
            ))}
          </div>
        </div>
        {/* Main wall content, centered */}
        <div className="wall-canvas-container">
          {/* Always show the wall, remove Create Wall button */}
          <Wall
            background={background}
            wallRef={wallRef}
            width={width}
            height={height}
            images={images}
          />
        </div>
      </div>
      {/* Wall Settings Panel */}
      {wallValue && (
        <div className="wall-settings-panel">
          <div className="wall-settings-layout">
            <div className="wall-settings-left">
              <WallDimensions
                width={width}
                height={height}
                setWidth={setWidth}
                setHeight={setHeight}
              />
            </div>
            <div className="wall-settings-right">
              <WallBackgrounds
                setBackground={setBackground}
                activeType={activeType}
                setActiveType={setActiveType}
                disabled={!planFeatures.custom_bg_enabled}
              />
            </div>
            <div className="wall-settings-image">
              <Image images={images} setImages={setImages} wallRef={wallRef} disabled={!planFeatures.upload_image_enabled} />
            </div>
          </div>
        </div>
      )}
      {showUpgradeModal && (
        <div className="wall-upgrade-modal">
          <div className="wall-upgrade-content">
            <h2 className="wall-upgrade-title">Upgrade to Premium</h2>
            <div className="wall-upgrade-message">
              {upgradeMessage || "Only 3 drafts for free users. If you want more, please upgrade."}
            </div>
            <button
              className="wall-upgrade-btn"
              onClick={() => {
                setShowUpgradeModal(false);
                navigate('/subscriptions');
              }}
            >
              Upgrade Now
            </button>
            <button
              className="wall-cancel-btn"
              onClick={() => setShowUpgradeModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
export default mainWall;

