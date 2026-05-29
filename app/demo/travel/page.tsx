"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const STAMP_COLORS = ["#1A4A7A", "#2E6B9E", "#1A6B5A", "#7A1A4A", "#4A1A7A", "#7A4A1A"];

const PassportStamp = ({ country, city, date, entryType = "VISITED", rotation = 0, opacity = 1, color = "#1A4A7A" }: {
  country: string; city: string; date: string; entryType?: string; rotation?: number; opacity?: number; color?: string;
}) => (
  <div style={{ transform: `rotate(${rotation}deg)`, opacity, display: "inline-block" }}>
    <svg width="110" height="110" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="72" fill="none" stroke={color} strokeWidth="3" strokeDasharray="4 2" />
      <circle cx="80" cy="80" r="60" fill="none" stroke={color} strokeWidth="1.5" />
      <path id={`top-${city}-d`} d="M 20,80 A 60,60 0 0,1 140,80" fill="none" />
      <text fontSize="11" fill={color} fontFamily="Georgia, serif" letterSpacing="3">
        <textPath href={`#top-${city}-d`} startOffset="50%" textAnchor="middle">{country.toUpperCase()}</textPath>
      </text>
      <path id={`bot-${city}-d`} d="M 20,80 A 60,60 0 0,0 140,80" fill="none" />
      <text fontSize="9" fill={color} fontFamily="Georgia, serif" letterSpacing="2">
        <textPath href={`#bot-${city}-d`} startOffset="50%" textAnchor="middle">{entryType}</textPath>
      </text>
      <text x="80" y="68" textAnchor="middle" fontSize="20" fill={color}>✈</text>
      <text x="80" y="87" textAnchor="middle" fontSize="11" fill={color} fontFamily="Georgia, serif" fontWeight="bold" letterSpacing="1">
        {city.toUpperCase()}
      </text>
      <line x1="50" y1="93" x2="110" y2="93" stroke={color} strokeWidth="1" />
      <text x="80" y="106" textAnchor="middle" fontSize="10" fill={color} fontFamily="Georgia, serif" letterSpacing="2">
        {date}
      </text>
    </svg>
  </div>
);

function TextField({ id, placeholder, multiline = false }: { id: string; placeholder: string; multiline?: boolean }) {
  const [value, setValue] = useState("");
  const baseStyle = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px dotted rgba(26,74,122,0.4)",
    color: "#0D2B4A",
    fontSize: "12px",
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    outline: "none",
    padding: "2px 0",
    resize: "none" as const,
  };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={2}
        style={{ ...baseStyle, resize: "none" }}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      style={baseStyle}
    />
  );
}

function PhotoPlaceholder({ id }: { id: string }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  return (
    <label style={{ display: "block", cursor: "pointer" }}>
      <input type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setPhotoUrl(URL.createObjectURL(file));
        }}
      />
      {photoUrl ? (
        <img src={photoUrl} alt="Memory" style={{ width: "100%", height: "120px", objectFit: "contain", backgroundColor: "rgba(26,74,122,0.06)", borderRadius: "8px", border: "3px solid white" }} />
      ) : (
        <div style={{ width: "100%", height: "120px", backgroundColor: "rgba(26,74,122,0.06)", borderRadius: "8px", border: "2px dashed rgba(26,74,122,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "24px", marginBottom: "4px" }}>📸</span>
          <span style={{ fontSize: "10px", color: "#A8C4E0", fontFamily: "Georgia" }}>Πατήστε για φωτογραφία</span>
        </div>
      )}
    </label>
  );
}

const PAGES = [
  { key: "cover", title: "Εξώφυλλο" },
  { key: "profile", title: "Ταξιδιωτικό Προφίλ" },
  { key: "trip_1", title: "Ταξίδι #1" },
  { key: "trip_2", title: "Ταξίδι #2" },
  { key: "trip_3", title: "Ταξίδι #3" },
  { key: "dreams", title: "Τα Όνειρά μου" },
];

const Label = ({ text }: { text: string }) => (
  <p style={{ fontSize: "9px", color: "#1A4A7A", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "2px", fontFamily: "Georgia, serif" }}>{text}</p>
);

const SectionBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: "rgba(26,74,122,0.06)", borderRadius: "10px", padding: "8px", marginBottom: "8px" }}>
    <p style={{ fontSize: "9px", color: "#1A4A7A", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "6px", fontFamily: "Georgia, serif" }}>{title}</p>
    {children}
  </div>
);

export default function DemoTravelPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping] = useState(false);

  const goTo = (dir: "prev" | "next") => {
    if (flipping) return;
    if (dir === "next" && currentPage < PAGES.length - 1) {
      setFlipping(true);
      setTimeout(() => { setCurrentPage(p => p + 1); setFlipping(false); }, 350);
    } else if (dir === "prev" && currentPage > 0) {
      setFlipping(true);
      setTimeout(() => { setCurrentPage(p => p - 1); setFlipping(false); }, 350);
    }
  };

  const renderTripPage = (tripNum: number) => {
    const color = STAMP_COLORS[(tripNum - 1) % STAMP_COLORS.length];
    const rotation = ((tripNum % 3) - 1) * 5;

    return (
      <div style={{ overflowY: "auto", height: "100%", padding: "0 4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <h2 style={{ fontSize: "16px", color: "#0D2B4A", fontFamily: "Georgia, serif", fontWeight: "normal" }}>✈ Ταξίδι #{tripNum}</h2>
          <PassportStamp country="ΧΩΡΑ" city="ΠΟΛΗ" date="2024" rotation={rotation} opacity={0.7} color={color} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
          <div><Label text="Χώρα" /><TextField id={`t${tripNum}_country`} placeholder="π.χ. Ιταλία" /></div>
          <div><Label text="Πόλη" /><TextField id={`t${tripNum}_city`} placeholder="π.χ. Ρώμη" /></div>
          <div><Label text="Ημερομηνία" /><TextField id={`t${tripNum}_date`} placeholder="JUN 2024" /></div>
          <div><Label text="Με ποιον" /><TextField id={`t${tripNum}_with`} placeholder="..." /></div>
        </div>

        <Label text="Πώς πήγα" />
        <TextField id={`t${tripNum}_transport`} placeholder="✈️ Αεροπλάνο / 🚢 Πλοίο / 🚗 Αμάξι..." />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", margin: "8px 0" }}>
          <PhotoPlaceholder id={`t${tripNum}_p1`} />
          <PhotoPlaceholder id={`t${tripNum}_p2`} />
        </div>

        <SectionBox title="🏨 Διαμονή">
          <Label text="Που μείναμε" /><TextField id={`t${tripNum}_acc`} placeholder="..." />
          <Label text="Αγαπημένο σημείο" /><TextField id={`t${tripNum}_acc_h`} placeholder="..." />
        </SectionBox>

        <SectionBox title="🍽️ Γεύσεις">
          <Label text="Αγαπημένο φαγητό" /><TextField id={`t${tripNum}_food`} placeholder="..." />
          <Label text="Αγαπημένο εστιατόριο" /><TextField id={`t${tripNum}_rest`} placeholder="..." />
        </SectionBox>

        <div style={{ marginBottom: "6px" }}><Label text="⭐ Καλύτερη στιγμή" /><TextField id={`t${tripNum}_best`} placeholder="..." multiline /></div>
        <div style={{ marginBottom: "6px" }}><Label text="😮 Έκπληξη" /><TextField id={`t${tripNum}_surp`} placeholder="..." multiline /></div>
        <div style={{ marginBottom: "6px" }}><Label text="😄 Αστεία στιγμή" /><TextField id={`t${tripNum}_funny`} placeholder="..." multiline /></div>
        <div style={{ marginBottom: "6px" }}><Label text="✅ Θα ξανάκανα" /><TextField id={`t${tripNum}_redo`} placeholder="..." /></div>
        <div style={{ marginBottom: "6px" }}><Label text="❌ Δεν θα ξανάκανα" /><TextField id={`t${tripNum}_nodo`} placeholder="..." /></div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", margin: "8px 0" }}>
          <PhotoPlaceholder id={`t${tripNum}_p3`} />
          <PhotoPlaceholder id={`t${tripNum}_p4`} />
        </div>

        <SectionBox title="💭 Σκέψεις">
          <Label text="Τι κράτησα" /><TextField id={`t${tripNum}_take`} placeholder="..." multiline />
          <Label text="Θα επέστρεφα;" /><TextField id={`t${tripNum}_ret`} placeholder="Ναι / Όχι / Ίσως..." />
          <Label text="Βαθμολογία" /><TextField id={`t${tripNum}_rate`} placeholder="⭐⭐⭐⭐⭐" />
        </SectionBox>
      </div>
    );
  };

  const renderPage = () => {
    const page = PAGES[currentPage];

    if (page.key === "cover") return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", background: "linear-gradient(160deg, #0D2B4A 0%, #1A4A7A 50%, #0D3D5C 100%)", margin: "-16px", borderRadius: "12px", padding: "30px", textAlign: "center" }}>
        <div style={{ background: "white", borderRadius: "50px", padding: "10px 24px", marginBottom: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          <img src="/logo.png" alt="Logo" style={{ width: "80px", height: "auto" }} />
        </div>
        <p style={{ color: "#A8C4E0", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "8px", fontFamily: "Georgia, serif" }}>✈ My Little Memory Box</p>
        <h1 style={{ color: "white", fontSize: "24px", fontFamily: "Georgia, serif", fontWeight: "normal", marginBottom: "6px" }}>Travel Memory Box</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "10px 0 16px" }}>
          <div style={{ width: "30px", height: "1px", background: "#A8C4E0", opacity: 0.5 }} />
          <span style={{ color: "#A8C4E0" }}>✦</span>
          <div style={{ width: "30px", height: "1px", background: "#A8C4E0", opacity: 0.5 }} />
        </div>
        <div style={{ width: "100%", maxWidth: "260px", marginBottom: "16px" }}>
          <p style={{ color: "#A8C4E0", fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "4px" }}>Όνομα</p>
          <input type="text" placeholder="Το όνομά σου..."
            style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(168,196,224,0.5)", color: "white", fontSize: "14px", fontFamily: "Georgia, serif", outline: "none", padding: "4px 0", textAlign: "center" }}
          />
        </div>
        <div style={{ display: "flex", gap: "6px", opacity: 0.6, flexWrap: "wrap", justifyContent: "center" }}>
          {["ROMA", "TOKYO", "PARIS"].map((city, i) => (
            <div key={city} style={{ transform: `rotate(${(i % 3 - 1) * 8}deg)` }}>
              <svg width="55" height="55" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="72" fill="none" stroke="#A8C4E0" strokeWidth="3" strokeDasharray="4 2" />
                <circle cx="80" cy="80" r="60" fill="none" stroke="#A8C4E0" strokeWidth="1.5" />
                <text x="80" y="75" textAnchor="middle" fontSize="18" fill="#A8C4E0">✈</text>
                <text x="80" y="94" textAnchor="middle" fontSize="13" fill="#A8C4E0" fontFamily="Georgia">{city}</text>
              </svg>
            </div>
          ))}
        </div>
      </div>
    );

    if (page.key === "profile") return (
      <div style={{ overflowY: "auto", height: "100%", padding: "0 4px" }}>
        <h2 style={{ fontSize: "17px", color: "#0D2B4A", fontFamily: "Georgia, serif", fontWeight: "normal", textAlign: "center", marginBottom: "16px" }}>✈ Ταξιδιωτικό Προφίλ</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { id: "first_trip", label: "Το πρώτο μου ταξίδι ήταν" },
            { id: "countries", label: "Χώρες που έχω επισκεφτεί" },
            { id: "fav_dest", label: "Αγαπημένος προορισμός" },
            { id: "dream_dest", label: "Ονειρεμένος προορισμός" },
            { id: "motto", label: "Η φιλοσοφία μου για τα ταξίδια", ml: true },
          ].map((item) => (
            <div key={item.id}>
              <Label text={item.label} />
              <TextField id={item.id} placeholder="..." multiline={item.ml} />
            </div>
          ))}
        </div>
      </div>
    );

    if (page.key.startsWith("trip_")) {
      return renderTripPage(parseInt(page.key.split("_")[1]));
    }

    if (page.key === "dreams") return (
      <div style={{ overflowY: "auto", height: "100%", padding: "0 4px" }}>
        <h2 style={{ fontSize: "17px", color: "#0D2B4A", fontFamily: "Georgia, serif", fontWeight: "normal", textAlign: "center", marginBottom: "16px" }}>🌟 Ταξιδιωτικά Όνειρα</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { id: "bucket", label: "Bucket list", ml: true },
            { id: "next", label: "Επόμενο ταξίδι" },
            { id: "dream", label: "Ταξίδι ονείρων" },
            { id: "partner", label: "Με ποιον θα ήθελα να ταξιδέψω" },
            { id: "lesson", label: "Το πιο σημαντικό που έμαθα", ml: true },
          ].map((item) => (
            <div key={item.id}>
              <Label text={item.label} />
              <TextField id={item.id} placeholder="..." multiline={item.ml} />
            </div>
          ))}
        </div>
      </div>
    );

    return null;
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0D2B4A 0%, #1A4A7A 60%, #0D3D5C 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>

      <div style={{ background: "rgba(168,196,224,0.2)", borderRadius: "30px", padding: "6px 20px", marginBottom: "16px", border: "1px solid rgba(168,196,224,0.3)" }}>
        <p style={{ color: "#A8C4E0", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>
          🎬 Demo — Travel Memory Box
        </p>
      </div>

      <div style={{
        width: "100%", maxWidth: "420px", minHeight: "580px",
        background: "#F8F4EE", borderRadius: "12px",
        boxShadow: "12px 12px 40px rgba(0,0,0,0.5), -2px 0 8px rgba(0,0,0,0.2)",
        opacity: flipping ? 0 : 1,
        transform: flipping ? "scale(0.97)" : "scale(1)",
        transition: "all 0.35s ease",
        overflow: "hidden",
      }}>
        <div style={{ background: "#F8F4EE", borderBottom: "1px solid rgba(26,74,122,0.15)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src="/logo.png" alt="Logo" style={{ width: "44px", height: "auto" }} />
          <p style={{ fontSize: "9px", color: "#1A4A7A", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>✈ Travel Memory Box</p>
          <div style={{ width: "44px" }} />
        </div>

        <div style={{ padding: "16px", minHeight: "490px" }}>
          {renderPage()}
        </div>

        <div style={{ textAlign: "center", padding: "8px", borderTop: "1px solid rgba(26,74,122,0.1)" }}>
          <p style={{ fontSize: "10px", color: "#A8C4E0", fontFamily: "Georgia, serif" }}>
            {currentPage + 1} / {PAGES.length}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "32px", marginTop: "20px" }}>
        <button onClick={() => goTo("prev")} disabled={currentPage === 0}
          style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "18px", cursor: currentPage === 0 ? "not-allowed" : "pointer", opacity: currentPage === 0 ? 0.3 : 1 }}
        >←</button>
        <span style={{ color: "#A8C4E0", fontSize: "12px", fontFamily: "Georgia, serif", maxWidth: "150px", textAlign: "center" }}>
          {PAGES[currentPage].title}
        </span>
        <button onClick={() => goTo("next")} disabled={currentPage === PAGES.length - 1}
          style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "18px", cursor: currentPage === PAGES.length - 1 ? "not-allowed" : "pointer", opacity: currentPage === PAGES.length - 1 ? 0.3 : 1 }}
        >→</button>
      </div>

      <div style={{ display: "flex", gap: "6px", marginTop: "16px", flexWrap: "wrap", justifyContent: "center", maxWidth: "400px" }}>
        {PAGES.map((p, i) => (
          <button key={p.key} onClick={() => setCurrentPage(i)}
            style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontFamily: "Georgia, serif", background: currentPage === i ? "#A8C4E0" : "rgba(168,196,224,0.2)", color: currentPage === i ? "#0D2B4A" : "#A8C4E0", border: "none", cursor: "pointer" }}
          >
            {p.key.startsWith("trip_") ? `#${p.key.split("_")[1]}` : p.title.slice(0, 3)}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginTop: "20px" }}>
        <Link href="/checkout?template=travel"
          style={{ padding: "12px 32px", background: "#A8C4E0", color: "#0D2B4A", borderRadius: "30px", fontSize: "12px", fontFamily: "Georgia, serif", letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", fontWeight: "bold" }}
        >
          ✈️ Αγόρασε το Travel Memory Box — 29.99€
        </Link>
        <Link href="/"
          style={{ color: "rgba(168,196,224,0.6)", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Georgia", textDecoration: "none" }}
        >
          ← Επιστροφή στην αρχική
        </Link>
      </div>
    </div>
  );
}
