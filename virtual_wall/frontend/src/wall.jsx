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
        <div className="wall" >
            <div
                className="displayWall"
                style={{
                width,
                height,
                    backgroundImage: background && (background.startsWith("url(") || background.includes("gradient")) ? background : "none",
                    backgroundColor: background && !background.includes("url") && !background.includes("gradient") ? background : "white",
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "2px solid black",
                color: "white",
                fontWeight: "bold",
                position: "relative",
                    overflow: "hidden",
                    marginTop: "50px"
            }}
            ref={wallRef}
            >
              {images && images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: img.x,
                    top: img.y,
                    width: img.width,
                    height: img.height,
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      clipPath: getClipPath(img.shape),
                      WebkitClipPath: getClipPath(img.shape),
                      overflow: "hidden",
                      background: "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={img.src}
                      alt={`wall-img-${idx}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        background: "transparent",
                        border: "none",
                        borderRadius: 0,
                        margin: 0,
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
        </div>
  );
}
