"use client";
import { useEffect, useState } from "react";
import "./CategoryModal.css";
const API_URL =
  "https://newsameep-backend.go-kar.net/api/dummy-categories";

export default function ChooseCategoryModal({ onClose }) {
  
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState("CATEGORY"); // CATEGORY | CONNECT
  const [loading, setLoading] = useState(true);
const [elapsed, setElapsed] = useState(0);

useEffect(() => {
  const i = setInterval(() => {
    setElapsed((t) => t + 1);
  }, 1000);

  return () => clearInterval(i);
}, []);
const minutes = Math.floor(elapsed / 60);
const seconds = elapsed % 60;

  /* 📡 Fetch categories */
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setCategories(data);
      } catch (e) {
        console.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  /* 🔍 Filter (CLIENT SIDE) */
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="category-modal">
        {/* ❌ Close */}
        <button className="close-btn" onClick={onClose}>✕</button>
<button
  className="back-btn"
  onClick={() => {
    if (step === "CONNECT") {
      setStep("CATEGORY");
    } else {
      onClose();
    }
  }}
>
  ←
</button>

        {/* ⏱ Timer */}
    <div className="timer-circle">
  {`${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`}
</div>


        {step === "CATEGORY" && (
          <>
            <p className="title-text">
              Select the category that best matches your business
            </p>

            <input
              className="search-input"
              placeholder="Search category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="category-grid">
              {loading && <p className="loading">Loading...</p>}

              {!loading && filteredCategories.length === 0 && (
                <div className="not-found">
                  <p>Didn’t find your business?</p>
                  
                </div>
              )}

              {filteredCategories.map((cat) => (
                <div
                  key={cat._id || cat.id}
                  className={`category-card ${
                    selected?.name === cat.name ? "active" : ""
                  }`}
                  onClick={() => setSelected(cat)}
                >
                  <img src={cat.imageUrl} alt={cat.name} />
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>

            <button
              className="next-btn"
              disabled={!selected}
              onClick={() => setStep("CONNECT")}
            >
              Next
            </button>
          </>
        )}
{step === "CONNECT" && (
  <div className="connect-section">
    <div className="selected-pill selected-category">
      <img
        src={selected.imageUrl}
        alt={selected.name}
        className="selected-image"
      />
      <span className="selected-name">{selected.name}</span>
    </div>

    <button className="google-btn">
      Connect your Google Business
    </button>

    <button className="phone-btn">
      Continue with Phone Number
    </button>
  </div>
)}

      </div>
    </div>
  );
}
