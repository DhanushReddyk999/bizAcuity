import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { buildApiUrl } from "./config/api";
import { getClipPath } from "./config/constants";

export default function AuthViewDraft() {
  const { viewId } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/Login", { state: { redirect: `/auth-view/${viewId}` } });
      return;
    }
    async function fetchDraft() {
      try {
        const token = JSON.parse(user).token;
        const res = await fetch(buildApiUrl(`/authViewDraft/${viewId}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          setError("You are not authorized to view this draft.");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError("Draft not found or not authorized.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setDraft(JSON.parse(atob(data.wall_data)));
      } catch (err) {
        setError("Error loading draft.");
      } finally {
        setLoading(false);
      }
    }
    fetchDraft();
  }, [viewId, navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!draft) return null;

  // Extract width/height as numbers
  const width = parseInt(draft.width) || 1000;
  const height = parseInt(draft.height) || 500;

  // Fix background url if needed
  let bg = draft.background;
  if (bg && bg.startsWith('url(') && !bg.includes('http')) {
    const path = bg.match(/url\((.*?)\)/)?.[1]?.replace(/['"]/g, "");
    if (path && !path.startsWith("/")) {
      bg = `url(/${path})`;
    }
  }

  const user = localStorage.getItem("user");

  return (
    <div style={{ padding: 32, position: 'relative' }}>
      {user && (
        <button
          onClick={() => { localStorage.removeItem("user"); navigate("/Login"); }}
          style={{ position: 'absolute', top: 24, right: 36, background: 'linear-gradient(90deg, #ff4d4d 0%, #ff7b7b 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: 16, padding: '0.7em 2em', zIndex: 1000 }}
        >Logout</button>
      )}
      <h2>Authorized Shared Draft: {draft.name || "Untitled"}</h2>
      <div
        style={{
          position: "relative",
          width,
          height,
          backgroundImage: bg,
          backgroundSize: "cover",
          border: "2px solid #1769aa",
          borderRadius: 12,
          margin: "24px 0",
          overflow: "hidden",
        }}
      >
        {draft.images && draft.images.map((img, idx) => {
          let src = img.src;
          if (src && !src.startsWith("http") && !src.startsWith("/")) {
            src = `/${src}`;
          }
          return (
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
                  src={src}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    background: "transparent",
                    border: "none",
                    borderRadius: 0,
                    margin: 0,
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 