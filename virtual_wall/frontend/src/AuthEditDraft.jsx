import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Wall from "./wall.jsx";
import Image from "./image.jsx";
import WallDimensions from "./wall_dimensions.jsx";
import WallBackgrounds from "./wall_backgrounds.jsx";
import StickerPanel from "./stickers.jsx";
import { usePlan } from "./PlanContext";
import { buildApiUrl } from "./config/api";
import { APP_CONSTANTS, getCategoryForSticker } from "./config/constants";

export default function AuthEditDraft() {
  const { editId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [wallId, setWallId] = useState(null);

  // Wall editor state
  const [background, setBackground] = useState(APP_CONSTANTS.DEFAULT_BACKGROUND);
  const [images, setImages] = useState([]);
  const wallRef = useRef(null);
  const [width, setWidth] = useState(APP_CONSTANTS.DEFAULT_WIDTH);
  const [height, setHeight] = useState(APP_CONSTANTS.DEFAULT_HEIGHT);
  const [activeType, setActiveType] = useState(APP_CONSTANTS.DEFAULT_ACTIVE_TYPE);
  const [userLoaded, setUserLoaded] = useState(0);

  // Plan context for sticker limits
  const { planFeatures } = usePlan();

  // State to track selected sticker category in StickerPanel
  const [selectedStickerCategory, setSelectedStickerCategory] = useState(APP_CONSTANTS.DEFAULT_STICKER_CATEGORY);

  // Count stickers on the wall for the selected category
  const currentCategoryStickerCount = images.filter(img => getCategoryForSticker(img.src) === selectedStickerCategory).length;

  // Use the plan's stickers_limit as the per-category limit
  const perCategoryStickerLimit = planFeatures.stickers_limit ?? 0;

  // Check login and trigger userLoaded after login
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/Login", { state: { redirect: `/auth-edit/${editId}` } });
      return;
    }
    setUserLoaded(val => val + 1); // trigger re-fetch after login
  }, [editId, navigate]);

  // Fetch draft after login or when userLoaded changes
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) return;
    async function fetchDraft() {
      try {
        const token = JSON.parse(user).token;
        const res = await fetch(buildApiUrl(`/authEditDraft/${editId}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          setError("You are not authorized to edit this draft.");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError("Draft not found or not authorized.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setWallId(data.wall_id || null);
        setDraftName(data.wall_name || "Untitled");
        const decoded = JSON.parse(atob(data.wall_data));
        setBackground(decoded.background || APP_CONSTANTS.DEFAULT_BACKGROUND);
        setImages(decoded.images || []);
        setWidth(decoded.width || APP_CONSTANTS.DEFAULT_WIDTH);
        setHeight(decoded.height || APP_CONSTANTS.DEFAULT_HEIGHT);
        setActiveType(decoded.activeType || APP_CONSTANTS.DEFAULT_ACTIVE_TYPE);
      } catch (err) {
        setError("Error loading draft.");
      } finally {
        setLoading(false);
      }
    }
    fetchDraft();
  }, [editId, userLoaded, navigate]);

  function toMySQLDateTime(ts) {
    const date = new Date(ts);
    return date.toISOString().slice(0, 19).replace("T", " ");
  }

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/Login", { state: { redirect: `/auth-edit/${editId}` } });
      return;
    }
    try {
      const token = JSON.parse(user).token;
      const wall_data = {
        background,
        images,
        width,
        height,
        activeType,
        name: draftName,
      };
      const encoded = btoa(JSON.stringify(wall_data));
      const res = await fetch(buildApiUrl(`/authEditDraft/${editId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          wall_data: encoded,
          timestamp: toMySQLDateTime(Date.now()),
          wall_name: draftName,
        }),
      });
      if (!res.ok) {
        setError("Failed to save draft");
        setSaving(false);
        return;
      }
      setSaving(false);
      alert("Draft updated successfully!");
    } catch (err) {
      setError("Error saving draft");
      setSaving(false);
    }
  };

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const user = localStorage.getItem("user");

  return (
    <div style={{ position: 'relative' }}>
      {user && (
        <button
          onClick={() => { localStorage.removeItem("user"); navigate("/Login"); }}
          style={{ position: 'absolute', top: 24, right: 36, background: 'linear-gradient(90deg, #ff4d4d 0%, #ff7b7b 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: 16, padding: '0.7em 2em', zIndex: 1000 }}
        >Logout</button>
      )}
      <div className="appHeader">
        Authorized Edit Draft: {draftName}
        <span>Edit this altar and save changes (invite-only)</span>
      </div>
      <StickerPanel 
        onSubmitStickers={addStickersToWall} 
        currentCategory={selectedStickerCategory}
        setCurrentCategory={setSelectedStickerCategory}
        currentCategoryStickerCount={currentCategoryStickerCount}
        categoryStickerLimit={perCategoryStickerLimit}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "1em",
        }}
      >
        <button
          onClick={handleSave}
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
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
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
        {/* Change Background panel */}
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
          <Wall
            background={background}
            wallRef={wallRef}
            width={width}
            height={height}
          />
        </div>
      </div>
      {/* Wall Settings Panel at the bottom of the page */}
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
    </div>
  );
} 