"use client";

import { useEffect, useState } from "react";
import "./CategoryModal.css";

const API_URL =
  "https://newsameep-backend.go-kar.net/api/dummy-categories";

export default function ChooseCategoryModal({ onClose }) {
  const [seconds, setSeconds] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState("");

  /* ⏱ Timer */
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* 📡 Fetch categories */
  useEffect(() => {
    async function load() {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCategories(data);
    }
    load();
  }, []);

  const formatTime = (s) => {
    const min = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div className="cc-overlay" onClick={onClose}>
      <div className="cc-modal" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="cc-header">
          <h2>Choose a Category</h2>
          <button className="cc-close" onClick={onClose}>×</button>
        </div>

        {/* STATUS */}
        <div className="cc-status">
          <span className="cc-dot" />
          <span className="cc-status-text">Creating preview</span>
          <span className="cc-time">{formatTime(seconds)}</span>
        </div>

        {/* DESCRIPTION */}
        <p className="cc-desc">
          Select the category that best matches your business.
          <br />
          <span>(This is a preview; selection is not saved yet.)</span>
        </p>

        {/* DROPDOWN */}
        <select
          className="cc-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* ACTIONS – SHOW ONLY AFTER SELECT */}
        {selected && (
          <div className="cc-actions">
            <button className="cc-btn-primary">
              Connect Your Google Business
            </button>

            <button className="cc-btn-secondary">
              Continue With Mobile Number
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
