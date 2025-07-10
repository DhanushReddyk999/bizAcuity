import { useState, useEffect, useRef } from "react";

export default function WallBackgrounds({ setBackground, activeType, setActiveType }) {
  const [fillType, setFillType] = useState("Solid");
  const [solidColor, setSolidColor] = useState("#87ceeb");
  const [gradientStart, setGradientStart] = useState("#ff7e5f");
  const [gradientEnd, setGradientEnd] = useState("#feb47b");
  const fileInputRef = useRef(null);

  const imageUrlRef = useRef(null); // for cleanup

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
      const url = URL.createObjectURL(file);
      setBackground(`url(${url})`);
      setActiveType("image");

      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
      }
      imageUrlRef.current = url;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: 'row', gap: "2rem", flexWrap: "nowrap", justifyContent: 'center', alignItems: 'flex-start' }}>
      {/* Fill Style Selector */}
      <fieldset
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          opacity: activeType === "fill" ? 1 : 0.5,
        }}
      >
        <legend>
          <input
            type="radio"
            name="backgroundType"
            checked={activeType === "fill"}
            onChange={() => setActiveType("fill")}
          />{" "}
          Fill Style
        </legend>

        <label>Type:</label>
        <select
          value={fillType}
          onChange={(e) => setFillType(e.target.value)}
          disabled={activeType !== "fill"}
        >
          <option value="Solid">Solid</option>
          <option value="Gradient">Gradient</option>
        </select>

        {fillType === "Solid" && (
          <div>
            <label>Color:</label>
            <input
              type="color"
              value={solidColor}
              onChange={(e) => setSolidColor(e.target.value)}
              disabled={activeType !== "fill"}
            />
          </div>
        )}

        {fillType === "Gradient" && (
          <div>
            <label>Start:</label>
            <input
              type="color"
              value={gradientStart}
              onChange={(e) => setGradientStart(e.target.value)}
              disabled={activeType !== "fill"}
            />
            <label>End:</label>
            <input
              type="color"
              value={gradientEnd}
              onChange={(e) => setGradientEnd(e.target.value)}
              disabled={activeType !== "fill"}
            />
          </div>
        )}
      </fieldset>

      {/* Custom Image Selector */}
      <fieldset
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          opacity: activeType === "image" ? 1 : 0.5,
        }}
      >
        <legend>
          <input
            type="radio"
            name="backgroundType"
            checked={activeType === "image"}
            onChange={() => setActiveType("image")}
          />{" "}
          Custom Image
        </legend>
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
            if (activeType === "image" && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          disabled={activeType !== "image"}
          style={{
            padding: '0.8em 1.6em',
            fontSize: '1.1em',
            fontWeight: 600,
            background: activeType === 'image' ? 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)' : '#e0e7ef',
            color: activeType === 'image' ? '#fff' : '#b5b5d6',
            border: 'none',
            borderRadius: '10px',
            boxShadow: activeType === 'image' ? '0 2px 8px rgba(33,150,243,0.10)' : 'none',
            cursor: activeType === 'image' ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
            marginTop: '1em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.7em',
          }}
        >
          <span role="img" aria-label="upload" style={{ fontSize: '1.3em' }}>⬆️</span>
          Upload Background Image
        </button>
      </fieldset>
    </div>
  );
}
