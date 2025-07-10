import { useState } from "react";

export default function StickerPanel({ onSubmitStickers }) {
  const stickers = [
    { name: "agarbatthi", src: "/agarbatti.jpg" },
    { name: "biryani1", src: "/biryani1.jpg" },
    { name: "biryani2", src: "/biryani2.jpg" },
    { name: "candle1", src: "/candle1.jpg" },
    { name: "candle2", src: "/candle2.jpg" },
    { name: "flower decor", src: "/flowers.jpg" },
    { name: "frame1", src: "/frame1.jpg" },
    { name: "frame2", src: "/frame2.jpg" },
    { name: "frame3", src: "/frame3.jpg" },
    { name: "fruit basket1", src: "/fruits1.jpg" },
    { name: "fruit basket2", src: "/fruits2.jpg" },
    { name: "garland1", src: "/garland1.jpg" },
    { name: "garland2", src: "/garland2.jpg" },
    { name: "table1", src: "/table1.jpg" },
    { name: "table2", src: "/table2.jpg" },
  ];

  const [selected, setSelected] = useState([]);

  const toggleSticker = (src) => {
    setSelected((prev) =>
      prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]
    );
  };

  const handleSubmit = () => {
    onSubmitStickers(selected);
    setSelected([]); // Clear after submit
  };

  return (
    <div style={{ width: "100%", padding: "1em", marginTop: "1.5em" }}>
      <div style={{ width: "100%", textAlign: "center", marginBottom: "0.8em" }}>
        <h3 style={{ margin: 0, color: "#1769aa", fontWeight: 800, fontSize: "1.2em", letterSpacing: "0.01em" }}>Select Stickers</h3>
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
                cursor: "pointer",
                borderRadius: "8px",
                border: selected.includes(sticker.src)
                  ? "3px solid #2196f3"
                  : "2px solid transparent",
                boxShadow: selected.includes(sticker.src)
                  ? "0 0 8px rgba(33,150,243,0.4)"
                  : "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selected.length === 0}
        style={{
          marginTop: "1em",
          padding: "0.8em 1.5em",
          background: selected.length ? "#2196f3" : "#ccc",
          color: "white",
          fontWeight: 600,
          border: "none",
          borderRadius: "8px",
          cursor: selected.length ? "pointer" : "not-allowed",
          transition: "background 0.2s"
        }}
      >
        Add Selected Stickers
      </button>
    </div>
  );
}