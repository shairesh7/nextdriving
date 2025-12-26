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
      setCaptchaError("Enter at least 3 characters");
      return;
    }
    if (captchaInput !== captcha) {
      setCaptchaError("Captcha does not match");
      return;
    }

    const res = await fetch(
      `https://newsameep-backend.go-kar.net/api/google/places/search?query=${encodeURIComponent(
        businessQuery
      )}`
    );
    const data = await res.json();
    setGoogleResults(data.results || []);
    setStep("GOOGLE_RESULTS");
  };

  /* SELECT RESULT (ONLY HIGHLIGHT) */
  const handleSelectBusiness = (biz) => {
    setSelectedBusiness(biz);
    setActivePlaceId(biz.placeId);
  };

  /* FETCH DETAILS API (PHONE COMES HERE) */
  const fetchBusinessDetails = async () => {
    const res = await fetch(
      `https://newsameep-backend.go-kar.net/api/google/places/details?placeId=${activePlaceId}`
    );
    const data = await res.json();
    setSelectedBusiness(data.place); // ✅ phone exists here
    setStep("VERIFY_PHONE");
  };

  /* BACK */
  const handleBack = () => {
    if (step === "VERIFY_PHONE") setStep("GOOGLE_RESULTS");
    else if (step === "GOOGLE_RESULTS") setStep("GOOGLE_SEARCH");
    else if (step === "GOOGLE_SEARCH") setStep("CONNECT");
    else if (step === "CONNECT") setStep("CATEGORY");
    else onClose();
  };

  const phoneNumber =
    selectedBusiness?.formattedPhoneNumber ||
    selectedBusiness?.internationalPhoneNumber ||
    selectedBusiness?.phone ||
    "";

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category..."
            />

            <div className="category-grid">
              {!loading &&
                (filteredCategories.length ? filteredCategories : [othersCategory]).map(
                  (cat) =>
                    cat && (
                      <div
                        key={cat.id || cat._id}
                        className={`category-card ${
                          selected?.name === cat.name ? "active" : ""
                        }`}
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
        {step === "CONNECT" && selected && (
          <div className="connect-section">
            <div className="selected-category-card">
              <img src={selected.imageUrl} className="selected-category-image" />
              <div>
                <p className="selected-label">Selected Category</p>
                <p className="selected-category-name">{selected.name}</p>
              </div>
            </div>

            <button className="google-btn" onClick={() => setStep("GOOGLE_SEARCH")}>
              Connect your Google Business
            </button>

            <button className="phone-btn" onClick={() => setStep("VERIFY_PHONE")}>
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
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="Enter captcha"
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
            <p className="results-title">Search Results</p>

            <div className="google-results-list">
              {googleResults.map((biz) => (
                <div
                  key={biz.placeId}
                  className={`google-result-card ${
                    activePlaceId === biz.placeId ? "active" : ""
                  }`}
                  onClick={() => handleSelectBusiness(biz)}
                >
                  <p className="google-result-name">{biz.name}</p>
                  <p className="google-result-address">{biz.address}</p>
                </div>
              ))}
            </div>

            {activePlaceId && (
              <button className="confirm-btn" onClick={fetchBusinessDetails}>
                Continue & Verify Phone
              </button>
            )}
          </div>
        )}

        {/* STEP 5 – VERIFY PHONE */}
        {step === "VERIFY_PHONE" && selectedBusiness && (
          <div className="verify-phone-section">
            <p className="section-title">Business Details</p>

            <div className="details-card">
              <p><b>Business Name:</b> {selectedBusiness.name}</p>
              <p><b>Address:</b> {selectedBusiness.address}</p>
              <p>
                <b>Latitude:</b> {selectedBusiness.location?.lat}<br />
                <b>Longitude:</b> {selectedBusiness.location?.lng}
              </p>
              <p><b>Phone:</b> {phoneNumber || "Not available"}</p>
            </div>

          <div className="verify-box">
  <p><b>Verify Phone:</b> {phoneNumber || "-"}</p>

  {/* SEND OTP */}
  <button
    className="otp-btn"
    disabled={!phoneNumber}
    onClick={() => alert("OTP Sent")}
  >
    Send OTP
  </button>

  {/* CONTINUE WITHOUT PHONE */}
  <button
    className="bypass-btn"
    onClick={() => alert("Continued without phone verification")}
  >
    Continue without phone
  </button>
</div>

          </div>
        )}
      </div>
    </div>
  );
}
