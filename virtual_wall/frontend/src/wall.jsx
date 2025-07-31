import {useState,useEffect} from "react";
import WallDimensions from "./wall_dimensions.jsx";
import WallBackgrounds from "./wall_backgrounds.jsx";

export default function Wall({ background: initialBackground, wallRef, width, height, images = [] }) {
    const [background, setBackground] = useState(initialBackground);

    useEffect(() => {
    setBackground(initialBackground);
    }, [initialBackground]);

    // Helper for shape rendering
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
        default:
          return "none";
      }
    };

    return (
        <div className="wall">
            <div
                className="wall-display"
                style={{
                    width,
                    height,
                    backgroundImage: background && (background.startsWith("url(") || background.includes("gradient")) ? background : "none",
                    backgroundColor: background && !background.includes("url") && !background.includes("gradient") ? background : "white",
                }}
                ref={wallRef}
            >
              {images && images.map((img, idx) => (
                <div
                  key={idx}
                  className="wall-image-container"
                  style={{
                    left: img.x,
                    top: img.y,
                    width: img.width,
                    height: img.height,
                  }}
                >
                  <div
                    className="wall-image-clip"
                    style={{
                      clipPath: getClipPath(img.shape),
                      WebkitClipPath: getClipPath(img.shape),
                    }}
                  >
                    <img
                      src={img.src}
                      alt={`wall-img-${idx}`}
                      className="wall-image"
                    />
                  </div>
                </div>
              ))}
            </div>
        </div>
  );
}
