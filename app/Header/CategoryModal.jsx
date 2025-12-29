"use client";
import { useEffect, useState } from "react";
import "./CategoryModal.css";
import { FcGoogle } from "react-icons/fc";

const CATEGORY_API =
  "https://newsameep-backend.go-kar.net/api/dummy-categories";

export default function ChooseCategoryModal({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState("CATEGORY");
  const [loading, setLoading] = useState(true);

  const [elapsed, setElapsed] = useState(0);

  const [businessQuery, setBusinessQuery] = useState("");
  const [googleResults, setGoogleResults] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [activePlaceId, setActivePlaceId] = useState(null);


  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState(["", "", "", ""]);
  const [captchaError, setCaptchaError] = useState("");


  const rating = selectedBusiness?.rating;
  const totalReviews = selectedBusiness?.userRatingsTotal;
  const latitude = selectedBusiness?.location?.lat;
  const longitude = selectedBusiness?.location?.lng;

const [selectedSearchBusiness, setSelectedSearchBusiness] = useState(null);

const handleContinueWithoutOtp = async () => {
  try {
    const res = await fetch(
      "https://newsameep-backend.go-kar.net/api/dummy-vendors",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Registered",
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to register vendor");
    }

    const data = await res.json();
    console.log("Vendor registered:", data);

    // ✅ OPTIONAL: close modal or move to success step
    onClose(); 
    // or setStep("SUCCESS");

  } catch (error) {
    console.error(error);
    alert("Something went wrong. Please try again.");
  }
};


  /* ================= TIMER ================= */
  useEffect(() => {
    const i = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    fetch(CATEGORY_API)
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= STEP PROGRESS ================= */
  const stepPercent = {
    CATEGORY: 20,
    CONNECT: 40,
    GOOGLE_SEARCH: 60,
    GOOGLE_RESULTS: 80,
    VERIFY_PHONE: 100,
  }[step];

  /* ================= CAPTCHA ================= */
  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptcha(code);
    setCaptchaInput(["", "", "", ""]); // ✅ reset properly
    setCaptchaError("");
  };
  const handleCaptchaChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return; // only numbers

    const next = [...captchaInput];
    next[index] = value;
    setCaptchaInput(next);

    // move to next box
    if (value && index < 3) {
      document.getElementById(`captcha-${index + 1}`)?.focus();
    }
  };

  const handleCaptchaKeyDown = (e, index) => {
    if (e.key === "Backspace" && !captchaInput[index] && index > 0) {
      document.getElementById(`captcha-${index - 1}`)?.focus();
    }
  };


  useEffect(() => {
    if (step === "GOOGLE_SEARCH") generateCaptcha();
  }, [step]);

  /* ================= GOOGLE SEARCH ================= */
  const handleGoogleSearch = async () => {
    if (businessQuery.trim().length < 3) {
      setCaptchaError("Enter at least 3 characters");
      return;
    }

    // ✅ FIXED CAPTCHA CHECK
    if (captchaInput.join("") !== captcha) {
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
      setCaptchaError("Search failed. Try again.");
    }
  };


  /* ================= SELECT BUSINESS ================= */
  const handleSelectBusiness = (biz) => {
  setSelectedSearchBusiness(biz);   // ⭐ contains rating & reviews
  setActivePlaceId(biz.placeId);
};


  /* ================= FETCH DETAILS ================= */
const fetchBusinessDetails = async () => {
  const res = await fetch(
    `https://newsameep-backend.go-kar.net/api/google/places/details?placeId=${activePlaceId}`
  );

  const data = await res.json();

  // 🔥 MERGE SEARCH + DETAILS
  setSelectedBusiness({
    ...selectedSearchBusiness, // rating, userRatingsTotal, address, location
    ...data.place,             // phone, extra details
  });

  setStep("VERIFY_PHONE");
};

  /* ================= BACK ================= */
  const handleBack = () => {
    if (step === "VERIFY_PHONE") setStep("GOOGLE_RESULTS");
    else if (step === "GOOGLE_RESULTS") setStep("GOOGLE_SEARCH");
    else if (step === "GOOGLE_SEARCH") setStep("CONNECT");
    else if (step === "CONNECT") setStep("CATEGORY");
    else onClose();
  };

  const phoneNumber =
    selectedBusiness?.internationalPhoneNumber ||
    selectedBusiness?.phone ||
    "";

  return (
    <div className="modal-overlay">
      <div className="category-modal">

        {/* HEADER */}
        <div className="modal-header">
          <button className="back-btn" onClick={handleBack}>←</button>
          <div className="timer-box">{minutes}:{seconds}</div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* STEP INDICATOR */}
        <div className="step-indicator-wrapper">
          <div className="step-line-bg">
            <div
              className="step-line-fill"
              style={{ width: `${stepPercent}%` }}
            />
          </div>

          <div className="step-dots">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`step-dot ${stepPercent >= n * 20 ? "active" : ""}`}
              >
                {n}
              </div>
            ))}
          </div>
        </div>

        {/* ================= CATEGORY ================= */}
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
                filteredCategories.map((cat) => (
                  <div
                    key={cat.id || cat._id}
                    className={`category-card ${selected?.name === cat.name ? "active" : ""
                      }`}
                    onClick={() => setSelected(cat)}
                  >
                    <img src={cat.imageUrl} />
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

        {/* ================= CONNECT ================= */}
        {step === "CONNECT" && selected && (
          <div className="connect-section">
            <div className="selected-category-card">
              <img src={selected.imageUrl} />
              <p>{selected.name}</p>
            </div>

            <button className="google-btn google-connect-btn" onClick={() => setStep("GOOGLE_SEARCH")}>
  <FcGoogle size={27} />
  <span>Connect your Google Business</span>
</button>


            <button className="phone-btn" onClick={() => setStep("VERIFY_PHONE")}>
              Continue with Mobile Number
            </button>
          </div>
        )}

        {/* ================= GOOGLE SEARCH ================= */}
        {step === "GOOGLE_SEARCH" && (
          <div className="google-search-section">

            {/* BUSINESS INPUT */}
            <input
              className="google-input"
              value={businessQuery}
              onChange={(e) => setBusinessQuery(e.target.value)}
              placeholder="City Motor Driving School"
            />

              <p className="captcha-helper-text">
      Enter the captcha to continue
    </p>

            {/* CAPTCHA DISPLAY */}
            <div className="captcha-mini-box">
              <span className="captcha-mini-code">{captcha}</span>
              <button type="button" onClick={generateCaptcha}>↻</button>
            </div>

            {/* CAPTCHA INPUT – 4 SEPARATE BOXES */}
            <div className="captcha-input-row">
              {captchaInput.map((digit, i) => (
                <input
                  key={i}
                  id={`captcha-${i}`}
                  className="captcha-digit"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCaptchaChange(e.target.value, i)}
                  onKeyDown={(e) => handleCaptchaKeyDown(e, i)}
                />
              ))}
            </div>

            {captchaError && <p className="captcha-error">{captchaError}</p>}

            {/* SEARCH BUTTON */}
            <button
              className="google-search-btn"
              disabled={
                businessQuery.trim().length < 3 ||
                captchaInput.some((d) => d === "")
              }
              onClick={handleGoogleSearch}
            >
              Search
            </button>

          </div>
        )}


        {/* ================= GOOGLE RESULTS ================= */}
        {/* ================= GOOGLE RESULTS ================= */}
        {step === "GOOGLE_RESULTS" && (
          <div className="google-results-section">

            <p className="results-title">Select your business</p>

            {/* SCROLLABLE RESULTS */}
            <div className="google-results-scroll">
              {googleResults.map((biz) => (
                <div
                  key={biz.placeId}
                  className={`google-result-card ${activePlaceId === biz.placeId ? "active" : ""
                    }`}
                  onClick={() => handleSelectBusiness(biz)}
                >
                  <p className="google-result-name">{biz.name}</p>
                  <p className="google-result-address">{biz.address}</p>
                </div>
              ))}
            </div>

            {/* NEXT BUTTON */}
            <button
              className="next-btn"
              disabled={!activePlaceId}
              onClick={fetchBusinessDetails}
            >
              Next
            </button>

          </div>
        )}

        {/* ================= VERIFY PHONE ================= */}
        {step === "VERIFY_PHONE" && selectedBusiness && (
  <div className="verify-phone-section">

    {/* BUSINESS NAME */}
    <p><b>{selectedBusiness.name}</b></p>

    {/* ADDRESS */}
    <p>{selectedBusiness.address}</p>

    {/* ⭐ RATING */}
    {rating !== undefined && (
      <p>
        <b>Rating:</b> ⭐ {rating}
        {totalReviews !== undefined && ` (${totalReviews} reviews)`}
      </p>
    )}

    {/* 📍 LAT / LNG */}
    {latitude && longitude && (
      <p>
        <b>Latitude:</b> {latitude}<br />
        <b>Longitude:</b> {longitude}
      </p>
    )}

    {/* 📞 PHONE (if exists later) */}
    <p>
      <b>Phone:</b> {phoneNumber || "Not available"}
    </p>

    <button className="otp-btn" disabled={!phoneNumber}>
      Send OTP
    </button>

    <button className="bypass-btn" onClick={handleContinueWithoutOtp}>
  Continue without OTP
</button>


  </div>
)}

      </div>
    </div>
  );
}
