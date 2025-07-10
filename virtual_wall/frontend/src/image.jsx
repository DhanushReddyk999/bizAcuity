import { createPortal } from "react-dom";
import { Rnd } from "react-rnd";
import {useRef} from "react";

export default function Image({ images, setImages, wallRef }) {
  const fileInputRef=useRef(null);
  function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    const newImages = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push({
          src: reader.result,
          x: Math.random() * 400,    
          y: Math.random() * 300,     
          width: 100,                 
          height: 100,
          shape:"rectangle",
          selected: false,                 
        });

        if (newImages.length === files.length) {
          setImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function handleDelete(indexToRemove) {
    setImages(images.filter((_, index) => index !== indexToRemove));
  }

  function updateImagePositionSize(index, newData) {
    const updated = [...images];
    updated[index] = { ...updated[index], ...newData };
    setImages(updated);
  }

  const getClipPath = (shape) => {
    switch (shape) {
      case "circle":
        return "circle(50% at 50% 50%)";
      case "diamond":
        return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
      case "triangle":
        return "polygon(50% 0%, 0% 100%, 100% 100%)";
      case "hexagon":
        return "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
      case "rectangle":
        return "none";
    }
  };

  const applyShapeToSelected = (shape) => {
    const updated = images.map((img) =>
      img.selected ? { ...img, shape } : img
    );
    setImages(updated);
  };


  return (
    <div className="imageSettings" style={{
      background: '#f9fafb',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(33,150,243,0.10)',
      padding: '1.1rem 2.5rem 0.35rem 2.5rem',
      margin: '1.5rem auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      border: '1.5px solid #e5e7eb',
      maxWidth: 500,
      minWidth: 350,
      width: '100%'
    }}>
      <input type="file" 
      accept="image/*"
      multiple 
      onChange={handleImageUpload} 
      style={{display:"none"}}
      ref={fileInputRef}/>
      <div style={{ width: '100%', marginBottom: '1.2em' }}>
        <span style={{ fontWeight: 800, color: '#1769aa', fontSize: '1.4em', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>Image Settings</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1em', marginBottom: '1.5rem', alignItems: 'center', width: '100%' }}>
        <button onClick={()=>{fileInputRef.current.click()}}
          style={{
            padding: "0.7rem 1.3rem",
            fontSize: "1em",
            background: "linear-gradient(90deg, #2196f3 0%, #1769aa 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
        >Upload Image</button>
        <button
          onClick={() => setImages(images.filter(img => !img.selected))}
          style={{
            padding: "0.7rem 1.3rem",
            fontSize: "1em",
            background: images.some(img => img.selected) ? "#dc3545" : "#b5b5d6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: images.some(img => img.selected) ? "pointer" : "not-allowed",
            fontWeight: 600,
            boxShadow: images.some(img => img.selected) ? '0 2px 8px rgba(220,53,69,0.10)' : 'none',
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
          disabled={!images.some(img => img.selected)}
        >Delete Selected Images</button>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.7em',
          background: '#fff',
          borderRadius: 8,
          border: '1.5px solid #e5e7eb',
          padding: '0.5em 1.2em',
        }}>
          <label style={{ fontWeight: 600, color: '#1769aa', fontSize: '1em' }}>Shape:</label>
          <select
            onChange={(e) => applyShapeToSelected(e.target.value)}
            style={{ padding: '0.5em 1em', borderRadius: 8, border: '1.5px solid #b5b5d6', fontSize: '1em', background: '#fff', color: '#1769aa', fontWeight: 600, outline: 'none', boxShadow: '0 1px 4px rgba(33,150,243,0.04)' }}
          >
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="diamond">Diamond</option>
            <option value="triangle">Triangle</option>
            <option value="hexagon">Hexagon</option>
          </select>
        </div>
      </div>
      {wallRef.current &&
        createPortal(
          images.map((img, idx) => (
            <Rnd
              key={idx}
              size={{ width: img.width, height: img.height }}
              position={{ x: img.x, y: img.y }}
              onDragStop={(e, d) => updateImagePositionSize(idx, { x: d.x, y: d.y })}
              onResizeStop={(e, direction, ref, delta, position) =>
                updateImagePositionSize(idx, {
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  ...position,
                })
              }
              bounds="parent"
              style={{
                boxShadow: img.selected ? "0 0 16px 4px #2196f3, 0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.3)",
                overflow: "visible",
                position: "absolute",
                background: "transparent",
                border: "none",
                borderRadius: 0,
                cursor: "pointer",
                transition: "box-shadow 0.2s, border 0.2s"
              }}
              onClick={() => updateImagePositionSize(idx, { selected: !img.selected })}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  borderRadius: 0
                }}
              >
                {/* Frame shape, acts as border */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 1,
                    clipPath: getClipPath(img.shape),
                    WebkitClipPath: getClipPath(img.shape),
                    background: img.selected ? "#2196f3" : "transparent",
                    pointerEvents: "none",
                    border: "none",
                    borderRadius: 0
                  }}
                ></div>
                {/* Image shape, slightly smaller and centered */}
                <div
                  style={{
                    width: "88%",
                    height: "88%",
                    clipPath: getClipPath(img.shape),
                    WebkitClipPath: getClipPath(img.shape),
                    overflow: "hidden",
                    zIndex: 2,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    borderRadius: 0
                  }}
                >
                  <img
                    src={img.src}
                    alt={`wall-img-${idx}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      pointerEvents: "none",
                      border: "none",
                      borderRadius: 0,
                      background: "transparent",
                      margin: 0
                    }}
                  />
                </div>
              </div>
            </Rnd>
          )),
          wallRef.current 
        )}
    </div>
  );
}