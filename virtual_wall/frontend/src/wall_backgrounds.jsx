import { useState, useEffect, useRef } from "react";
import { usePlan } from "./PlanContext";

export default function WallBackgrounds({ setBackground, activeType, setActiveType }) {
  const [fillType, setFillType] = useState("Solid");
  const [solidColor, setSolidColor] = useState("#87ceeb");
  const [gradientStart, setGradientStart] = useState("#ff7e5f");
  const [gradientEnd, setGradientEnd] = useState("#feb47b");
  const fileInputRef = useRef(null);
  const imageUrlRef = useRef(null); // for cleanup

  const { planFeatures } = usePlan();
  const customBgEnabled = planFeatures.custom_bg_enabled;

  const user = JSON.parse(localStorage.getItem('user'));
  // Remove: const isPremium = user && user.subscription_plan && user.subscription_plan.toLowerCase() === 'premium';
  // Remove: const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  // Remove: const [upgradeMessage, setUpgradeMessage] = useState("");

  // Handle background updates
  useEffect(() => {
    if (activeType === "fill") {
      if (fillType === "Solid") {
        setBackground(solidColor);
      } else {
        setBackground(
          `linear-gradient(to right, ${gradientStart}, ${gradientEnd})`
        );
      }
    }
  }, [
    activeType,
    fillType,
    solidColor,
    gradientStart,
    gradientEnd,
    setBackground,
  ]);

  // Handle image background selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setBackground(`url(${dataUrl})`);
        setActiveType("image");

        if (imageUrlRef.current) {
          URL.revokeObjectURL(imageUrlRef.current);
        }
        imageUrlRef.current = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: 'row', 
      gap: "1.5rem", 
      width: '100%',
      justifyContent: 'center', 
      alignItems: 'flex-start',
      marginTop: '3rem'
    }}>
      {/* Fill Style Selector */}
      <div style={{
        border: "1px solid #ccc",
        padding: "12px",
        borderRadius: "8px",
        opacity: activeType === "fill" ? 1 : 0.5,
        width: '100%',
        margin: 0,
        background: '#fff',
        flex: 1,
        minWidth: '200px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '0.8rem',
          fontWeight: 600,
          color: '#1769aa',
          fontSize: '0.9rem'
        }}>
          <input
            type="radio"
            name="backgroundType"
            checked={activeType === "fill"}
            onChange={() => setActiveType("fill")}
          />
          <span>Fill Style</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontWeight: 600, color: '#1769aa', minWidth: '40px', fontSize: '0.8rem' }}>Type:</label>
            <select
              value={fillType}
              onChange={(e) => setFillType(e.target.value)}
              disabled={activeType !== "fill"}
              style={{
                padding: '0.2rem 0.4rem',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                minWidth: '80px',
                fontSize: '0.8rem'
              }}
            >
              <option value="Solid">Solid</option>
              <option value="Gradient">Gradient</option>
            </select>
          </div>

          {fillType === "Solid" && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontWeight: 600, color: '#1769aa', minWidth: '40px', fontSize: '0.8rem' }}>Color:</label>
              <input
                type="color"
                value={solidColor}
                onChange={(e) => setSolidColor(e.target.value)}
                disabled={activeType !== "fill"}
                style={{ width: '30px', height: '25px', border: 'none', borderRadius: '4px' }}
              />
            </div>
          )}

          {fillType === "Gradient" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ fontWeight: 600, color: '#1769aa', minWidth: '40px', fontSize: '0.8rem' }}>Start:</label>
                <input
                  type="color"
                  value={gradientStart}
                  onChange={(e) => setGradientStart(e.target.value)}
                  disabled={activeType !== "fill"}
                  style={{ width: '30px', height: '25px', border: 'none', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ fontWeight: 600, color: '#1769aa', minWidth: '40px', fontSize: '0.8rem' }}>End:</label>
                <input
                  type="color"
                  value={gradientEnd}
                  onChange={(e) => setGradientEnd(e.target.value)}
                  disabled={activeType !== "fill"}
                  style={{ width: '30px', height: '25px', border: 'none', borderRadius: '4px' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Image Selector */}
      <div style={{
        border: "1px solid #ccc",
        padding: "12px",
        borderRadius: "8px",
        opacity: activeType === "image" && customBgEnabled ? 1 : 0.5,
        width: '100%',
        margin: 0,
        background: '#fff',
        flex: 1,
        minWidth: '200px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '0.8rem',
          fontWeight: 600,
          color: '#1769aa',
          fontSize: '0.9rem'
        }}>
          <input
            type="radio"
            name="backgroundType"
            checked={activeType === "image"}
            onChange={() => setActiveType("image")}
            disabled={!customBgEnabled}
          />
          <span>Custom Image</span>
          {!customBgEnabled && (
            <span style={{ color: '#b71c1c', fontSize: '0.7rem', marginLeft: '0.3rem' }}>
              (Premium)
            </span>
          )}
        </div>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => {
            if (!customBgEnabled) {
              const upgrade = confirm('Custom image background is only available for premium users. Would you like to upgrade your plan?');
              if (upgrade) {
                window.location.href = '/subscriptions';
              }
              return;
            }
            if (activeType === "image" && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          disabled={activeType !== "image" || !customBgEnabled}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            background: activeType === 'image' && customBgEnabled ? 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)' : '#e0e7ef',
            color: activeType === 'image' && customBgEnabled ? '#ffffff' : '#6c757d',
            border: 'none',
            borderRadius: '6px',
            cursor: activeType === 'image' && customBgEnabled ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            width: '100%'
          }}
        >
          Upload Background Image
        </button>
      </div>
    </div>
  );
}
