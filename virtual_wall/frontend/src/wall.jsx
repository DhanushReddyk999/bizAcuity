import {useState,useEffect} from "react";
import WallDimensions from "./wall_dimensions.jsx";
import WallBackgrounds from "./wall_backgrounds.jsx";

export default function Wall({ background: initialBackground, wallRef, width, height }) {
    const [background, setBackground] = useState(initialBackground);

    useEffect(() => {
    setBackground(initialBackground);
    }, [initialBackground]);

    return (
        <div className="wall" >
            <div
                className="displayWall"
                style={{
                width,
                height,
                    backgroundImage: background.startsWith("url(") || background.includes("gradient") ? background : "none",
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
            </div>
        </div>
  );
}
