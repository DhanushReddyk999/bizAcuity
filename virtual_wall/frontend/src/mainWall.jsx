import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";

import "./App.css";
import Wall from "./wall.jsx";
import Image from "./image.jsx";
import WallDimensions from "./wall_dimensions.jsx";
import WallBackgrounds from "./wall_backgrounds.jsx";
import StickerPanel from "./stickers.jsx";

function mainWall() {
  let [wallValue, setWallValue] = useState(true);
  let [background, setBackground] = useState("url(/CottageWall.jpg)");
  let [images, setImages] = useState([]);
  const wallRef = useRef(null);
  const [width, setWidth] = useState("1000px");
  const [height, setHeight] = useState("500px");
  const [activeType, setActiveType] = useState("fill");
  const navigate = useNavigate();
  const [wallId, setWallId] = useState(null); // Track current wall_id

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
  }, []);

  function handleDownloadWall() {
    if (wallRef.current) {
      html2canvas(wallRef.current).then((canvas) => {
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "my_wall.png";
        link.click();
      });
    }
  }

  function toMySQLDateTime(ts) {
    const date = new Date(ts);
    return date.toISOString().slice(0, 19).replace("T", " ");
  }

  let handleSaveDraft=async()=>{
    const user = JSON.parse(localStorage.getItem("user"));
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
      const response = await fetch("http://localhost:8080/saveDrafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        alert(wallId ? "Draft updated!" : "Draft saved!");
      }
      else{
        const error=await response.text()
        alert(error);
      }
    }
    catch(err){
      console.log(err);
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
  return (
    <>
      <div className="appHeader">
        Virtual Wall Designer
        <span>Design your own wall with custom backgrounds and images</span>
      </div>
      {wallValue && (
        <>
          <StickerPanel onSubmitStickers={addStickersToWall} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "1em",
            }}
          >
            <button
              onClick={handleDownloadWall}
              style={{
                marginTop: "10px",
                padding: "12px 24px",
                fontWeight: "bold",
                backgroundColor: "#1769aa",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Download Wall
            </button>
            <button
              onClick={handleSaveDraft}
              style={{
                marginTop: "10px",
                padding: "12px 24px",
                fontWeight: "bold",
                backgroundColor: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Save as Draft
            </button>
          </div>
        </>
      )}
      <div
        className="mainContent"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          minHeight: "80vh",
          position: "relative",
        }}
      >
        {/* Change Background panel in normal flow */}
        <div
          className="changeBackgroundPanel"
          style={{
            background: "#fff",
            borderRadius: "18px",
            boxShadow: "0 2px 12px rgba(33,150,243,0.08)",
            padding: "2rem 1.2rem",
            border: "1.5px solid #e5e7eb",
            minWidth: "240px",
            maxWidth: "260px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginRight: "2.5rem",
            zIndex: 2,
            marginTop: "-50px",
          }}
        >
          <h2
            style={{
              marginBottom: "1.2rem",
              fontWeight: 800,
              color: "#1769aa",
              letterSpacing: "0.01em",
              fontSize: "1.3rem",
              textAlign: "center",
            }}
          >
            Change Background
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
              width: "100%",
            }}
          >
            {options.map((img) => (
              <div
                key={img.label}
                onClick={() => {
                  setBackground(`url(${img.value})`);
                  setActiveType("external");
                }}
                style={{
                  border:
                    background === `url(${img.value})`
                      ? "3px solid #2196f3"
                      : "2px solid #e5e7eb",
                  padding: "4px",
                  cursor: "pointer",
                  width: "100%",
                  height: "90px",
                  backgroundImage: `url(${img.value})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                  borderRadius: "10px",
                  boxShadow:
                    background === `url(${img.value})`
                      ? "0 2px 12px rgba(33,150,243,0.10)"
                      : "0 1px 4px rgba(0,0,0,0.04)",
                }}
                title={img.label}
              >
                <div
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    color: "white",
                    textAlign: "center",
                    padding: "4px",
                    position: "absolute",
                    width: "100%",
                    bottom: 0,
                    fontSize: "13px",
                    borderBottomLeftRadius: "10px",
                    borderBottomRightRadius: "10px",
                  }}
                >
                  {img.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Main wall content, centered */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            maxWidth: 1200,
            marginTop: "-200px",
          }}
        >
          {/* Always show the wall, remove Create Wall button */}
          <Wall
            background={background}
            wallRef={wallRef}
            width={width}
            height={height}
          />
        </div>
      </div>
      {/* Combined Wall Settings Panel at the bottom of the page */}
      {wallValue && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "2.5em",
            justifyContent: "center",
            alignItems: "flex-start",
            marginTop: "2em",
          }}
        >
          <div
            className="wallSettingsPanel"
            style={{
              marginLeft: "-200px",
              marginTop: "-50px",
              padding: "1.2rem 2rem 1rem 2rem",
              margin: "0",
              borderRadius: "20px",
              boxShadow: "0 4px 24px rgba(33,150,243,0.10)",
              background: "#fff",
              border: "1.5px solid #e5e7eb",
              maxWidth: 1200,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "1.2em",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "2.5em",
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              <WallDimensions
                width={width}
                height={height}
                setWidth={setWidth}
                setHeight={setHeight}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.7em",
                }}
              >
                <WallBackgrounds
                  setBackground={setBackground}
                  activeType={activeType}
                  setActiveType={setActiveType}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "0.7em",
              minWidth: 320,
              maxWidth: 420,
              marginTop: "-70px",
            }}
          >
            <Image images={images} setImages={setImages} wallRef={wallRef} />
          </div>
        </div>
      )}
      <button
        onClick={() => navigate("/Profile")}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: "#1769aa",
          color: "#fff",
          padding: "18px 36px",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "1.25em",
          fontWeight: 700,
          boxShadow: "0 2px 12px rgba(33,150,243,0.13)",
          letterSpacing: "0.01em",
          transition: "background 0.2s, color 0.2s, transform 0.15s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2196f3")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1769aa")}
      >
        Profile
      </button>
    </>
  );
}

export default mainWall;
