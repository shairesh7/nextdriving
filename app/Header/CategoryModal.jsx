"use client";
import { useEffect, useState } from "react";
import "./CategoryModal.css";

const CATEGORY_API =
  "https://newsameep-backend.go-kar.net/api/dummy-categories";

export default function ChooseCategoryModal({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState("CATEGORY");
  const [loading, setLoading] = useState(true);

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [activePlaceId, setActivePlaceId] = useState(null);

  const [elapsed, setElapsed] = useState(0);
  const [businessQuery, setBusinessQuery] = useState("");
  const [googleResults, setGoogleResults] = useState([]);

  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const stepProgress = {
    CATEGORY: 1,
    CONNECT: 2,
    GOOGLE_SEARCH: 3,
    GOOGLE_RESULTS: 4,
    VERIFY_PHONE: 5,
  };

  const TOTAL_STEPS = 8;

  /* TIMER */
  useEffect(() => {
    const i = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  /* LOAD CATEGORIES */
  useEffect(() => {
    fetch(CATEGORY_API)
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const othersCategory = categories.find(
    (c) => c.name.toLowerCase() === "others" || c.name.toLowerCase() === "other"
  );

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  /* CAPTCHA */
  const generateCaptcha = () => {
    setCaptcha(Math.floor(1000 + Math.random() * 9000).toString());
    setCaptchaInput("");
    setCaptchaError("");
  };

  useEffect(() => {
    if (step === "GOOGLE_SEARCH") generateCaptcha();
  }, [step]);

  /* GOOGLE SEARCH */
const handleGoogleSearch = async () => {
  if (businessQuery.trim().length < 3) {
    setCaptchaError("Enter at least 3 characters to search");
    return;
  }

  if (captchaInput !== captcha) {
    setCaptchaError("Captcha does not match");
    return;
  }

  try {
    const res = await fetch(
      `https://newsameep-backend.go-kar.net/api/google/places/search?query=${encodeURIComponent(
        businessQuery
      )}`
    );

    const data = await res.json();
    setGoogleResults(data.results || []);
    setStep("GOOGLE_RESULTS");
  } catch (err) {
    console.error("Google search failed", err);
  }
};


  /* SELECT BUSINESS (NO STEP CHANGE HERE) */
  const fetchBusinessDetails = (biz) => {
    setSelectedBusiness(biz);
    setActivePlaceId(biz.placeId);
  };

  /* BACK */
  const handleBack = () => {
    if (step === "VERIFY_PHONE") setStep("GOOGLE_RESULTS");
    else if (step === "GOOGLE_RESULTS") setStep("GOOGLE_SEARCH");
    else if (step === "GOOGLE_SEARCH") setStep("CONNECT");
    else if (step === "CONNECT") setStep("CATEGORY");
    else onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="category-modal">
        <button className="back-btn" onClick={handleBack}>←</button>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="timer-circle">
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </div>

        <div className="step-indicator">
          Step {stepProgress[step]}/{TOTAL_STEPS}
        </div>

        {/* CATEGORY */}
        {step === "CATEGORY" && (
          <>
            <input
              className="search-input"
              placeholder="Search category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="category-grid">
              {!loading &&
                (filteredCategories.length ? filteredCategories : [othersCategory]).map(
                  (cat) =>
                    cat && (
                      <div
                        key={cat.id || cat._id}
                        className={`category-card ${selected?.name === cat.name ? "active" : ""}`}
                        onClick={() => setSelected(cat)}
                      >
                        <img src={cat.imageUrl} />
                        <span>{cat.name}</span>
                      </div>
                    )
                )}
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

        {/* CONNECT */}
{/* ================= CONNECT ================= */}
{step === "CONNECT" && selected && (
  <div className="connect-section">

    {/* ✅ SELECTED CATEGORY DISPLAY */}
    <div className="selected-category-card">
      <img
        src={selected.imageUrl}
        alt={selected.name}
        className="selected-category-image"
      />
      <div className="selected-category-info">
        <p className="selected-label">Selected Category</p>
        <p className="selected-category-name">{selected.name}</p>
      </div>
    </div>

    {/* ACTION BUTTONS */}
    <button
      className="google-btn"
      onClick={() => setStep("GOOGLE_SEARCH")}
    >
      Connect your Google Business
    </button>

    <button
      className="phone-btn"
      onClick={() => setStep("VERIFY_PHONE")}
    >
      Continue with Mobile Number
    </button>
  </div>
)}

        {/* GOOGLE SEARCH */}
        {step === "GOOGLE_SEARCH" && (
          <div className="google-search-section">
            <input
              className="google-input"
              value={businessQuery}
              onChange={(e) => setBusinessQuery(e.target.value)}
              placeholder="City Motor Driving School"
            />

            <div className="captcha-box">
              <span>{captcha}</span>
              <button onClick={generateCaptcha}>↻</button>
            </div>

            <input
              className="captcha-input"
              placeholder="Enter captcha"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
            />

            {captchaError && <p className="captcha-error">{captchaError}</p>}

            <button
  className="google-search-btn"
  disabled={businessQuery.trim().length < 3}
  onClick={handleGoogleSearch}
>
  Search
</button>

          </div>
        )}

        {/* GOOGLE RESULTS */}
        {step === "GOOGLE_RESULTS" && (
          <div className="google-results-section">
            <div className="google-results-list">
              {googleResults.map((biz) => (
                <div
                  key={biz.placeId}
                  className={`google-result-card ${activePlaceId === biz.placeId ? "active" : ""}`}
                  onClick={() => fetchBusinessDetails(biz)}
                >
                  <p>{biz.name}</p>
                  <p>{biz.address}</p>
                  <p>⭐ {biz.rating} ({biz.userRatingsTotal})</p>
                </div>
              ))}
            </div>

            {selectedBusiness && (
              <>
                <div className="selected-business-card">
                  <p><b>{selectedBusiness.name}</b></p>
                  <p>{selectedBusiness.address}</p>
                </div>

                <button className="confirm-btn" onClick={() => setStep("VERIFY_PHONE")}>
                  Continue & Verify Phone
                </button>
              </>
            )}
          </div>
        )}

        {/* VERIFY PHONE */}
        {step === "VERIFY_PHONE" && selectedBusiness && (
  <div className="verify-phone-section">
    <p className="section-title">Confirm Business Details</p>

    <div className="details-card">
      <p>
        <b>Business Name:</b> {selectedBusiness.name}
      </p>

      <p>
        <b>Address:</b> {selectedBusiness.address}
      </p>

      <p>
        <b>Latitude:</b> {selectedBusiness.location?.lat}
      </p>

      <p>
        <b>Longitude:</b> {selectedBusiness.location?.lng}
      </p>

      <p>
        <b>Phone:</b>{" "}
        {selectedBusiness.phone || "Not available"}
      </p>
    </div>

    <hr className="divider" />

    <div className="verify-box">
      <p className="verify-title">
        Verify Phone:{" "}
        <span>{selectedBusiness.phone || "-"}</span>
      </p>

      <button className="otp-btn">Send OTP</button>

      <label className="bypass-row">
        <input type="checkbox" />
        <span>Bypass OTP</span>
      </label>
    </div>
  </div>
)}

      </div>
    </div>
  );
}
