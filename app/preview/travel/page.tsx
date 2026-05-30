"use client";

import { useState } from "react";
import Link from "next/link";

const STAMP_COLORS = ["#1A4A7A", "#2E6B9E", "#1A6B5A", "#7A1A4A", "#4A1A7A", "#7A4A1A"];

const PassportStamp = ({ country, city, date, entryType = "VISITED", rotation = 0, opacity = 1, color = "#1A4A7A" }: {
  country: string; city: string; date: string; entryType?: string; rotation?: number; opacity?: number; color?: string;
}) => (
  <div style={{ transform: `rotate(${rotation}deg)`, opacity, display: "inline-block" }}>
    <svg width="110" height="110" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="72" fill="none" stroke={color} strokeWidth="3" strokeDasharray="4 2" />
      <circle cx="80" cy="80" r="60" fill="none" stroke={color} strokeWidth="1.5" />
      <path id={`top-${city}-p`} d="M 20,80 A 60,60 0 0,1 140,80" fill="none" />
      <text fontSize="11" fill={color} fontFamily="Georgia, serif" letterSpacing="3">
        <textPath href={`#top-${city}-p`} startOffset="50%" textAnchor="middle">{country.toUpperCase()}</textPath>
      </text>
      <path id={`bot-${city}-p`} d="M 20,80 A 60,60 0 0,0 140,80" fill="none" />
      <text fontSize="9" fill={color} fontFamily="Georgia, serif" letterSpacing="2">
        <textPath href={`#bot-${city}-p`} startOffset="50%" textAnchor="middle">{entryType}</textPath>
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

const SAMPLE_TRIPS = [
  {
    country: "Ιταλία", city: "Ρώμη", date: "MAR 2023",
    with_who: "Με τον Σπύρο", transport: "✈️ Αεροπλάνο",
    accommodation: "Boutique hotel κοντά στο Colosseum",
    food: "Cacio e pepe και gelato 🍦", restaurant: "Trattoria da Enzo al 29",
    best_moment: "Η πρώτη ματιά στο Colosseum — δεν είχαμε λόγια",
    surprise: "Πόσο ζεστοί ήταν οι Ιταλοί!",
    funny: "Χαθήκαμε 2 ώρες με χαρτόνι χάρτη 😂",
    would_do_again: "Βραδινός περίπατος στη Fontana di Trevi",
    would_not_do: "Τουριστικά εστιατόρια δίπλα σε πλατείες",
    takeaway: "Η ομορφιά κρύβεται στις μικρές πλατείες",
    return: "Ναι — χωρίς δεύτερη σκέψη", rating: "⭐⭐⭐⭐",
    photos: [
      "/preview/travel/rome-1.jpg",
      "/preview/travel/rome-2.jpg",
      "/preview/travel/rome-3.jpg",
      "/preview/travel/rome-4.jpg",
      "/preview/travel/rome-5.jpg",
      "/preview/travel/rome-cover.jpg",
    ],
    cover: "/preview/travel/rome-cover.jpg",
  },
  {
    country: "Ιαπωνία", city: "Τόκιο", date: "APR 2024",
    with_who: "Μόνη μου", transport: "✈️ Αεροπλάνο",
    accommodation: "Capsule hotel στο Shinjuku",
    food: "Ramen στις 2 τα ξημερώματα 🍜", restaurant: "Ichiran Ramen",
    best_moment: "Ο ναός Senso-ji στις 6 το πρωί — μόνο εγώ",
    surprise: "Τα τρένα ακριβώς στο δευτερόλεπτο!",
    funny: "Έκανα υπόκλιση σε ρομπότ 😅",
    would_do_again: "Shinkansen στο Κιότο",
    would_not_do: "Tsukiji market την ώρα αιχμής",
    takeaway: "Μερικές φορές ο μοναχικός ταξιδιώτης βλέπει περισσότερα",
    return: "Ναι — για 3 εβδομάδες", rating: "⭐⭐⭐⭐⭐",
    photos: [
      "/preview/travel/tokyo-1.jpg",
      "/preview/travel/tokyo-2.jpg",
      "/preview/travel/tokyo-3.jpg",
      "/preview/travel/tokyo-4.jpg",
      "/preview/travel/tokyo-5.jpg",
      "/preview/travel/tokyo-cover.jpg",
    ],
    cover: "/preview/travel/tokyo-cover.jpg",
  },
  {
    country: "Ελλάδα", city: "Σαντορίνη", date: "JUN 2024",
    with_who: "Με τον Σπύρο & φίλους", transport: "🚢 Πλοίο από Πειραιά",
    accommodation: "Villa με πισίνα στη Φηρά",
    food: "Φάβα και ντοματοκεφτέδες 🍅", restaurant: "Ταβέρνα Κατινά στην Οία",
    best_moment: "Ηλιοβασίλεμα στην Οία — σταματάει ο χρόνος",
    surprise: "Πόσο ήσυχη είναι το πρωί πριν τους τουρίστες",
    funny: "Χαθήκαμε σε αμπελώνα με ATV 😄",
    would_do_again: "Μεσάνυχτα στη Φηρά με κρασί",
    would_not_do: "Ανάβαση με γαϊδούρι",
    takeaway: "Η Ελλάδα έχει μαγεία που απλά νιώθεται",
    return: "Κάθε χρόνο αν μπορώ!", rating: "⭐⭐⭐",
    photos: [
      "/preview/travel/santorini-1.jpg",
      "/preview/travel/santorini-2.jpg",
      "/preview/travel/santorini-3.jpg",
      "/preview/travel/santorini-4.jpg",
      "/preview/travel/santorini-5.jpg",
      "/preview/travel/santorini-cover.jpg",
    ],
    cover: "/preview/travel/santorini-cover.jpg",
  },
];

const PAGES = [
  { key: "cover", title: "Εξώφυλλο" },
  { key: "profile", title: "Ταξιδιωτικό Προφίλ" },
  { key: "trip_1", title: "Ρώμη, Ιταλία" },
  { key: "trip_2", title: "Τόκιο, Ιαπωνία" },
  { key: "trip_3", title: "Σαντορίνη, Ελλάδα" },
  { key: "dreams", title: "Τα Όνειρά μου" },
];

export default function TravelPreviewPage() {
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

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div style={{ marginBottom: "10px" }}>
      <p style={{ fontSize: "9px", color: "#1A4A7A", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "3px", fontFamily: "Georgia, serif" }}>{label}</p>
      <p style={{ fontSize: "12px", color: "#0D2B4A", borderBottom: "1px dotted #A8C4E0", paddingBottom: "4px", fontFamily: "Georgia, serif", fontStyle: "italic", minHeight: "20px" }}>{value}</p>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: "rgba(26,74,122,0.06)", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
      <p style={{ fontSize: "9px", color: "#1A4A7A", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px", fontFamily: "Georgia, serif" }}>{title}</p>
      {children}
    </div>
  );

  const TripPhoto = ({ src, full = false }: { src: string; full?: boolean }) => (
    <img src={src} alt="Travel memory"
      style={{
        width: "100%",
        height: full ? "160px" : "100px",
        objectFit: "cover",
        borderRadius: "8px",
        border: "3px solid white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    />
  );

  const renderPage = () => {
    const page = PAGES[currentPage];

    if (page.key === "cover") return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", background: "linear-gradient(160deg, #0D2B4A 0%, #1A4A7A 50%, #0D3D5C 100%)", margin: "-16px", borderRadius: "12px", padding: "30px", textAlign: "center" }}>
        <div style={{ background: "white", borderRadius: "50px", padding: "10px 24px", marginBottom: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          <img src="/logo.png" alt="Logo" style={{ width: "80px", height: "auto" }} />
        </div>
        <p style={{ color: "#A8C4E0", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "8px", fontFamily: "Georgia, serif" }}>✈ My Little Memory Box</p>
        <h1 style={{ color: "white", fontSize: "26px", fontFamily: "Georgia, serif", fontWeight: "normal", marginBottom: "6px" }}>Travel Memory Box</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "12px 0 16px" }}>
          <div style={{ width: "40px", height: "1px", background: "#A8C4E0", opacity: 0.5 }} />
          <span style={{ color: "#A8C4E0", fontSize: "14px" }}>✦</span>
          <div style={{ width: "40px", height: "1px", background: "#A8C4E0", opacity: 0.5 }} />
        </div>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", fontFamily: "Georgia, serif", fontStyle: "italic", marginBottom: "4px" }}>Μαρία & Σπύρος</p>
        <p style={{ color: "#A8C4E0", fontSize: "11px", letterSpacing: "2px" }}>2020 — σήμερα</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginTop: "16px", width: "100%" }}>
          {SAMPLE_TRIPS.map((trip, i) => (
            <img key={i} src={trip.cover} alt={trip.city}
              style={{ width: "100%", height: "70px", objectFit: "cover", borderRadius: "6px", border: "2px solid rgba(255,255,255,0.3)" }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: "6px", marginTop: "12px", opacity: 0.5, justifyContent: "center" }}>
          {[{ city: "ROMA", rot: -8 }, { city: "TOKYO", rot: 5 }, { city: "SANTORINI", rot: -4 }].map((s, i) => (
            <div key={i} style={{ transform: `rotate(${s.rot}deg)` }}>
              <svg width="45" height="45" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="72" fill="none" stroke="#A8C4E0" strokeWidth="3" strokeDasharray="4 2" />
                <circle cx="80" cy="80" r="60" fill="none" stroke="#A8C4E0" strokeWidth="1.5" />
                <text x="80" y="75" textAnchor="middle" fontSize="18" fill="#A8C4E0">✈</text>
                <text x="80" y="94" textAnchor="middle" fontSize="11" fill="#A8C4E0" fontFamily="Georgia">{s.city}</text>
              </svg>
            </div>
          ))}
        </div>
      </div>
    );

    if (page.key === "profile") return (
      <div style={{ padding: "0 8px", overflowY: "auto", height: "100%" }}>
        <h2 style={{ fontSize: "18px", color: "#0D2B4A", fontFamily: "Georgia, serif", fontWeight: "normal", textAlign: "center", marginBottom: "20px" }}>✈ Ταξιδιωτικό Προφίλ</h2>
        <Field label="Το πρώτο μου ταξίδι" value="Θεσσαλονίκη, Ελλάδα — 2018" />
        <Field label="Χώρες που έχω επισκεφτεί" value="23 χώρες και μετράμε..." />
        <Field label="Αγαπημένος προορισμός" value="Ιαπωνία — αλλάζει κάθε χρόνο!" />
        <Field label="Ονειρεμένος προορισμός" value="Νέα Ζηλανδία & Παταγονία" />
        <Field label="Η φιλοσοφία μου" value="Μια βαλίτσα, δύο καρδιές, άπειρες ιστορίες" />
      </div>
    );

    if (page.key.startsWith("trip_")) {
      const idx = parseInt(page.key.split("_")[1]) - 1;
      const trip = SAMPLE_TRIPS[idx];
      const color = STAMP_COLORS[idx % STAMP_COLORS.length];
      return (
        <div style={{ overflowY: "auto", height: "100%", padding: "0 4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
            <h2 style={{ fontSize: "17px", color: "#0D2B4A", fontFamily: "Georgia, serif", fontWeight: "normal" }}>✈ Ταξίδι #{idx + 1}</h2>
            <PassportStamp country={trip.country} city={trip.city} date={trip.date} rotation={(idx % 3 - 1) * 6} opacity={0.85} color={color} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
            <Field label="Χώρα" value={trip.country} />
            <Field label="Πόλη" value={trip.city} />
            <Field label="Ημερομηνία" value={trip.date} />
            <Field label="Με ποιον" value={trip.with_who} />
          </div>

          {/* Φωτό 1-2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
            <TripPhoto src={trip.photos[0]} />
            <TripPhoto src={trip.photos[1]} />
          </div>

          <Section title="🏨 Διαμονή">
            <Field label="Που μείναμε" value={trip.accommodation} />
            <Field label="Μέσο μεταφοράς" value={trip.transport} />
          </Section>

          {/* Φωτό 3 — full width */}
          <div style={{ marginBottom: "8px" }}>
            <TripPhoto src={trip.photos[2]} full />
          </div>

          <Section title="🍽️ Γεύσεις">
            <Field label="Αγαπημένο φαγητό" value={trip.food} />
            <Field label="Αγαπημένο εστιατόριο" value={trip.restaurant} />
          </Section>

          {/* Φωτό 4-5 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
            <TripPhoto src={trip.photos[3]} />
            <TripPhoto src={trip.photos[4]} />
          </div>

          <Field label="⭐ Καλύτερη στιγμή" value={trip.best_moment} />
          <Field label="😮 Έκπληξη" value={trip.surprise} />
          <Field label="😄 Αστεία στιγμή" value={trip.funny} />
          <Field label="✅ Θα ξανάκανα" value={trip.would_do_again} />
          <Field label="❌ Δεν θα ξανάκανα" value={trip.would_not_do} />

          {/* Φωτό 6 — full width */}
          <div style={{ marginBottom: "8px" }}>
            <TripPhoto src={trip.photos[5]} full />
          </div>

          <Section title="💭 Σκέψεις">
            <Field label="Τι κράτησα" value={trip.takeaway} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
              <p style={{ fontSize: "10px", color: "#1A4A7A", fontFamily: "Georgia" }}>Θα επέστρεφα: <span style={{ color: "#0D2B4A", fontStyle: "italic" }}>{trip.return}</span></p>
              <p style={{ fontSize: "12px" }}>{trip.rating}</p>
            </div>
          </Section>
        </div>
      );
    }

    if (page.key === "dreams") return (
      <div style={{ padding: "0 8px", overflowY: "auto", height: "100%" }}>
        <h2 style={{ fontSize: "18px", color: "#0D2B4A", fontFamily: "Georgia, serif", fontWeight: "normal", textAlign: "center", marginBottom: "20px" }}>🌟 Ταξιδιωτικά Όνειρα</h2>
        <Field label="Bucket list" value="🗺️ Νέα Ζηλανδία · 🏔️ Παταγονία · 🌏 Νότια Αφρική · 🏝️ Μαλδίβες · 🇵🇪 Μάτσου Πίτσου" />
        <Field label="Επόμενο ταξίδι" value="Πορτογαλία — Σεπτέμβριο 2025" />
        <Field label="Ταξίδι ονείρων" value="3 μήνες στην Ασία — Ιαπωνία, Ταϊλάνδη, Βιετνάμ" />
        <Field label="Ταξιδιωτικός σύντροφος" value="Ο Σπύρος — πάντα" />
        <Field label="Το πιο σημαντικό που έμαθα" value="Τα ταξίδια δεν είναι προορισμοί — είναι άνθρωποι που συναντάς" />
      </div>
    );

    return null;
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0D2B4A 0%, #1A4A7A 60%, #0D3D5C 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>

      <div style={{ background: "rgba(168,196,224,0.2)", borderRadius: "30px", padding: "6px 20px", marginBottom: "16px", border: "1px solid rgba(168,196,224,0.3)" }}>
        <p style={{ color: "#A8C4E0", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>
          👁️ Δείγμα — Travel Memory Box
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
          <img src="/logo.png" alt="Logo" style={{ width: "48px", height: "auto" }} />
          <p style={{ fontSize: "9px", color: "#1A4A7A", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>✈ Travel Memory Box</p>
          <div style={{ width: "48px" }} />
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
