import { useState } from "react";

const stickerCategories = {
  Tables: [
    { name: "table1", src: "/table1.jpg" },
    { name: "table2", src: "/table2.jpg" },
  ],
  Garlands: [
    { name: "garland1", src: "/garland1.jpg" },
    { name: "garland2", src: "/garland2.jpg" },
  ],
  Frames: [
    { name: "frame1", src: "/frame1.jpg" },
    { name: "frame2", src: "/frame2.jpg" },
    { name: "frame3", src: "/frame3.jpg" },
  ],
  Candles: [
    { name: "candle1", src: "/candle1.jpg" },
    { name: "candle2", src: "/candle2.jpg" },
  ],
  Flowers: [
    { name: "flower decor", src: "/flowers.jpg" },
  ],
  Fruits: [
    { name: "fruit basket1", src: "/fruits1.jpg" },
    { name: "fruit basket2", src: "/fruits2.jpg" },
  ],
  Others: [
    { name: "agarbatthi", src: "/agarbatti.jpg" },
    { name: "biryani1", src: "/biryani1.jpg" },
    { name: "biryani2", src: "/biryani2.jpg" },
  ],
};

const categoryList = Object.keys(stickerCategories);

export default function StickerPanel({ onSubmitStickers, currentCategory, setCurrentCategory, currentCategoryStickerCount = 0, categoryStickerLimit = 2 }) {
  const [selected, setSelected] = useState([]);
  const stickers = stickerCategories[currentCategory] || [];
  const stickersEnabled = categoryStickerLimit > 0;
  const remaining = Math.max(0, categoryStickerLimit - currentCategoryStickerCount);

  const toggleSticker = (src) => {
    if (!stickersEnabled || remaining === 0) return;
    if (selected.includes(src)) {
      setSelected((prev) => prev.filter((s) => s !== src));
    } else if (selected.length < remaining) {
      setSelected((prev) => [...prev, src]);
    }
  };

  const handleSubmit = () => {
    onSubmitStickers(selected);
    setSelected([]); // Clear after submit
  };

  return (
    <div style={{ width: "100%", padding: "1em", marginTop: "1.5em" }}>
      <div style={{ width: "100%", textAlign: "center", marginBottom: "0.8em" }}>
        <h3 style={{ margin: 0, color: "#1769aa", fontWeight: 800, fontSize: "1.2em", letterSpacing: "0.01em" }}>Select Stickers</h3>
        {!stickersEnabled && (
          <div style={{ color: '#b71c1c', fontWeight: 600, marginTop: 8 }}>
            Your plan does not allow stickers. Upgrade to enable stickers.
          </div>
        )}
        {stickersEnabled && (
          <div style={{ color: '#1769aa', fontWeight: 500, fontSize: '0.98em', marginTop: 4 }}>
            {currentCategory} sticker limit: {categoryStickerLimit} | Remaining: {remaining}
          </div>
        )}
        {stickersEnabled && remaining === 0 && (
          <div style={{ color: '#b71c1c', fontWeight: 600, marginTop: 8 }}>
            You have reached your sticker limit for this category.
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "0.7em", marginBottom: "1em", flexWrap: "wrap" }}>
        {categoryList.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCurrentCategory(cat); setSelected([]); }}
            style={{
              padding: "0.6em 1.2em",
              borderRadius: "8px",
              border: currentCategory === cat ? "2px solid #2196f3" : "1.5px solid #e9eafc",
              background: currentCategory === cat ? "#e9eafc" : "#fff",
              color: currentCategory === cat ? "#1769aa" : "#22223b",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "1em",
              transition: "all 0.18s",
              boxShadow: currentCategory === cat ? "0 2px 8px rgba(33,150,243,0.08)" : "none",
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      <div style={{
        display: "flex",
        overflowX: "auto",
        gap: "1em",
        border: "1px solid #ccc",
        padding: "1em",
        borderRadius: "10px",
        background: "#f9fafb"
      }}>
        {stickers.map((sticker) => (
          <div key={sticker.src} style={{ position: "relative" }}>
            <img
              src={sticker.src}
              alt={sticker.name}
              onClick={() => toggleSticker(sticker.src)}
              style={{
                width: "80px",
                height: "80px",
                cursor: stickersEnabled && remaining > 0 ? "pointer" : "not-allowed",
                borderRadius: "8px",
                border: selected.includes(sticker.src)
                  ? "3px solid #2196f3"
                  : "2px solid transparent",
                boxShadow: selected.includes(sticker.src)
                  ? "0 0 8px rgba(33,150,243,0.4)"
                  : "0 1px 3px rgba(0,0,0,0.1)",
                opacity: stickersEnabled && remaining > 0 ? 1 : 0.5,
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          if (!stickersEnabled) {
            const upgrade = confirm('Stickers are only available for premium users. Would you like to upgrade your plan?');
            if (upgrade) {
              window.location.href = '/subscriptions';
            }
            return;
          }
          handleSubmit();
        }}
        disabled={!stickersEnabled || selected.length === 0}
        style={{
          marginTop: "1em",
          padding: "0.8em 1.5em",
          background: selected.length && stickersEnabled ? "#2196f3" : "#ccc",
          color: "white",
          fontWeight: 600,
          border: "none",
          borderRadius: "8px",
          cursor: selected.length && stickersEnabled ? "pointer" : "not-allowed",
          transition: "background 0.2s"
        }}
        title={!stickersEnabled ? 'Upgrade to premium to use stickers' : selected.length === 0 ? 'Select stickers to add' : 'Add selected stickers to wall'}
      >
        Add Selected Stickers
        {!stickersEnabled && (
          <span style={{ fontSize: '0.8em', marginLeft: '0.5em', opacity: 0.8 }}>
            (Upgrade Required)
          </span>
        )}
      </button>
    </div>
  );
}