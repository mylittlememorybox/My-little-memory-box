"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STAMP_COLORS = [
  "#8B5E3C", "#2C5F8A", "#2C8A5F", "#8A2C5F", "#5F2C8A", "#8A5F2C"
];

const PassportStamp = ({ country, city, date, entryType = "ENTRY", rotation = 0, opacity = 1, color = "#8B5E3C" }: any) => (
  <div style={{ transform: `rotate(${rotation}deg)`, opacity, display: "inline-block" }}>
    <svg width="110" height="110" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="72" fill="none" stroke={color} strokeWidth="3" strokeDasharray="4 2" />
      <circle cx="80" cy="80" r="60" fill="none" stroke={color} strokeWidth="1.5" />
      <path id={`topArc-${city}-prev`} d="M 20,80 A 60,60 0 0,1 140,80" fill="none" />
      <text fontSize="11" fill={color} fontFamily="Georgia, serif" letterSpacing="3">
        <textPath href={`#topArc-${city}-prev`} startOffset="50%" textAnchor="middle">
          {country.toUpperCase()}
        </textPath>
      </text>
      <path id={`bottomArc-${city}-prev`} d="M 20,80 A 60,60 0 0,0 140,80" fill="none" />
      <text fontSize="9" fill={color} fontFamily="Georgia, serif" letterSpacing="2">
        <textPath href={`#bottomArc-${city}-prev`} startOffset="50%" textAnchor="middle">
          {entryType}
        </textPath>
      </text>
      <text x="80" y="68" textAnchor="middle" fontSize="22" fill={color}>✈</text>
      <text x="80" y="88" textAnchor="middle" fontSize="11" fill={color} fontFamily="Georgia, serif" fontWeight="bold" letterSpacing="1">
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
    with_who: "Με τον σύντροφό μου",
    transport: "✈️ Αεροπλάνο",
    accommodation: "Boutique hotel κοντά στο Colosseum",
    food: "Cacio e pepe και gelato σε κάθε γωνία 🍦",
    restaurant: "Trattoria da Enzo al 29",
    best_moment: "Η στιγμή που είδαμε το Colosseum για πρώτη φορά — δεν είχαμε λόγια",
    surprise: "Πόσο ζεστοί ήταν οι Ιταλοί — μας κέρασαν λιμοντσέλο χωρίς να το ζητήσουμε!",
    funny: "Χαθήκαμε στη Via Appia για 2 ώρες με χαρτόνι χάρτη του 1990 😂",
    would_do_again: "Το βραδινό περίπατο στη Fontana di Trevi",
    would_not_do: "Τα τουριστικά εστιατόρια δίπλα στις πλατείες",
    takeaway: "Η ομορφιά κρύβεται στις μικρές πλατείες — όχι στα μεγάλα αξιοθέατα",
    return: "Ναι — χωρίς δεύτερη σκέψη",
    rating: "⭐⭐⭐⭐⭐",
  },
  {
    country: "Ιαπωνία", city: "Τόκιο", date: "APR 2024",
    with_who: "Μόνος/η μου",
    transport: "✈ Αεροπλάνο",
    accommodation: "Capsule hotel στο Shinjuku",
    food: "Ramen στις 2 τα ξημερώματα σε μικρό μαγαζάκι με 8 θέσεις 🍜",
    restaurant: "Ichiran Ramen",
    best_moment: "Ο ναός Senso-ji στις 6 το πρωί — μόνο εγώ και η ησυχία",
    surprise: "Πόσο ακριβείς είναι τα τρένα — κανονικά στο δευτερόλεπτο!",
    funny: "Έκανα υπόκλιση σε ένα ρομπότ στο σούπερ μάρκετ 😅",
    would_do_again: "Το ταξίδι με shinkansen στο Κιότο",
    would_not_do: "Το Tsukiji market την ώρα αιχμής — πάρα πολύς κόσμος",
    takeaway: "Μερικές φορές ο μοναχικός ταξιδιώτης βλέπει περισσότερα",
    return: "Ναι — αλλά για 3 εβδομάδες",
    rating: "⭐⭐⭐⭐⭐",
  },
  {
    country: "Ελλάδα", city: "Σαντορίνη", date: "JUN 2024",
    with_who: "Με φίλους",
    transport: "🚢 Πλοίο από Πειραιά",
    accommodation: "Villa με πισίνα στη Φηρά",
    food: "Φάβα και ντοματοκεφτέδες — τα καλύτερα που έχω φάει 🍅",
    restaurant: "Ταβέρνα Κατινά στην Οία",
    best_moment: "Το ηλιοβασίλεμα στην Οία — σταματάει ο χρόνος",
    surprise: "Πόσο ήσυχη είναι η Σαντορίνη το πρωί πριν τους τουρίστες",
    funny: "Νοικιάσαμε ATV και χαθήκαμε σε αμπελώνα — ο αγρότης μας έδωσε σταφύλια 😄",
    would_do_again: "Τα μεσάνυχτα στη Φηρά με κρασί",
    would_not_do: "Την ανάβαση με γαϊδούρι — λυπήθηκα το ζώο",
    takeaway: "Η Ελλάδα έχει μαγεία που δεν εξηγείται — απλά νιώθεται",
    return: "Κάθε χρόνο αν μπορώ!",
    rating: "⭐⭐⭐⭐⭐",
  },
];

const PAGES = [
  { key: "cover", title: "Εξώφυλλο" },
  { key: "profile", title: "Ταξιδιωτικό Προφίλ" },
  { key: "trip_1", title: "Ρώμη, Ιταλία" },
  { key: "trip_2", title: "Τόκιο, Ιαπωνία" },
  { key: "trip_3", title: "Σαντορίνη, Ελλάδα" },
  { key: "dreams", title: "Τα Όνειρά μας" },
];

export default function TravelPreviewPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [typedContent, setTypedContent] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState(false);

  const CONTENT: Record<string, Record<string, string>> = {
    cover: {
      name: "Μαρία & Γιώργης",
      year: "2020 — σήμερα",
    },
    profile: {
      first_trip: "Θεσσαλονίκη, Ελλάδα — 2018",
      countries_count: "23 χώρες και μετράμε...",
      favorite_destination: "Ιαπωνία — αλλάζει κάθε χρόνο!",
      travel_style: "Slow travel — θέλουμε να ζούμε την κάθε πόλη, όχι να τη φωτογραφίζουμε",
      dream_destination: "Νέα Ζηλανδία & Παταγονία",
      travel_motto: "Μια βαλίτσα, δύο καρδιές, άπειρες ιστορίες",
    },
  };

  useEffect(() => {
    if (currentPage === 0) return;
    const pageKey = PAGES[currentPage].key;
    const pageData = CONTENT[pageKey];
    if (!pageData) return;

    setIsTyping(true);
    setTypedContent({});

    const fields = Object.entries(pageData);
    let fieldIndex = 0;
    let charIndex = 0;

    const type = () => {
      if (fieldIndex >= fields.length) {
        setIsTyping(false);
        return;
      }

      const [key, value] = fields[fieldIndex];

      if (charIndex <= value.length) {
        setTypedContent(prev => ({
          ...prev,
          [key]: value.slice(0, charIndex),
        }));
        charIndex++;
        setTimeout(type, 20);
      } else {
        fieldIndex++;
        charIndex = 0;
        setTimeout(type, 100);
      }
    };

    setTimeout(type, 300);
  }, [currentPage]);

  const goToPage = (direction: "prev" | "next") => {
    if (flipping) return;
    if (direction === "next" && currentPage < PAGES.length - 1) {
      setFlipping(true);
      setTimeout(() => { setCurrentPage(currentPage + 1); setFlipping(false); }, 400);
    } else if (direction === "prev" && currentPage > 0) {
      setFlipping(true);
      setTimeout(() => { setCurrentPage(currentPage - 1); setFlipping(false); }, 400);
    }
  };

  const T = (key: string) => typedContent[key] || "";

  const renderPage = () => {
    const page = PAGES[currentPage];

    if (page.key === "cover") {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8"
          style={{ background: "linear-gradient(135deg, #2C1810 0%, #5C3820 100%)", margin: "-16px", borderRadius: "8px" }}
        >
          <img src="/logo.png" alt="Logo" className="w-32 h-auto mb-4 drop-shadow-lg" style={{ filter: "brightness(0) invert(1) opacity(0.9)" }} />
          <div className="text-[#C4A882] text-xs tracking-widest uppercase mb-2">✈ My Little Memory Box</div>
          <h1 className="text-3xl font-serif text-[#F5ECD7] mb-2">Travel Memory Box</h1>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            <span className="text-[#C4A882]">✈</span>
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          </div>
          <p className="text-[#F5ECD7] font-serif text-xl italic mb-1">Μαρία & Γιώργης</p>
          <p className="text-[#C4A882] text-sm">2020 — σήμερα</p>
          <div className="flex gap-2 mt-8 flex-wrap justify-center opacity-70">
            {[
              { country: "IT", city: "ROMA", color: "#C4A882", rot: -8 },
              { country: "JP", city: "TOKYO", color: "#2C5F8A", rot: 5 },
              { country: "GR", city: "SANTORINI", color: "#2C8A5F", rot: -3 },
            ].map((s, i) => (
              <div key={i} style={{ transform: `rotate(${s.rot}deg)` }}>
                <svg width="60" height="60" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="72" fill="none" stroke={s.color} strokeWidth="3" strokeDasharray="4 2" />
                  <circle cx="80" cy="80" r="60" fill="none" stroke={s.color} strokeWidth="1.5" />
                  <text x="80" y="75" textAnchor="middle" fontSize="16" fill={s.color} fontFamily="Georgia">✈</text>
                  <text x="80" y="92" textAnchor="middle" fontSize="14" fill={s.color} fontFamily="Georgia" fontWeight="bold">{s.city}</text>
                </svg>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (page.key === "profile") {
      return (
        <div className="h-full overflow-y-auto px-6 py-4"
          style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(196,168,130,0.08) 28px, rgba(196,168,130,0.08) 29px)` }}
        >
          <h2 className="text-xl font-serif text-[#2C1810] mb-4 text-center">✈ Ταξιδιωτικό Προφίλ</h2>
          <div className="space-y-4">
            {[
              { key: "first_trip", label: "Το πρώτο μου ταξίδι" },
              { key: "countries_count", label: "Χώρες που έχω επισκεφτεί" },
              { key: "favorite_destination", label: "Αγαπημένος προορισμός" },
              { key: "travel_style", label: "Στυλ ταξιδιού" },
              { key: "dream_destination", label: "Ονειρεμένος προορισμός" },
              { key: "travel_motto", label: "Η φιλοσοφία μου" },
            ].map((item) => (
              <div key={item.key}>
                <p className="text-xs text-[#8B5E3C] mb-1 uppercase tracking-wider">{item.label}:</p>
                <p className="text-sm text-[#2C1810] border-b border-dotted border-[#C4A882] pb-1 min-h-[24px] font-light italic">
                  {T(item.key)}
                  {isTyping && <span className="animate-pulse">|</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (page.key.startsWith("trip_")) {
      const tripIdx = parseInt(page.key.split("_")[1]) - 1;
      const trip = SAMPLE_TRIPS[tripIdx];
      const stampColor = STAMP_COLORS[tripIdx % STAMP_COLORS.length];

      return (
        <div className="h-full overflow-y-auto px-6 py-4"
          style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(196,168,130,0.08) 28px, rgba(196,168,130,0.08) 29px)` }}
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-serif text-[#2C1810]">✈ Ταξίδι #{tripIdx + 1}</h2>
            <PassportStamp
              country={trip.country}
              city={trip.city}
              date={trip.date}
              entryType="VISITED"
              rotation={(tripIdx % 3 - 1) * 6}
              opacity={0.85}
              color={stampColor}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-xs text-[#8B5E3C] mb-1 uppercase tracking-wider">Χώρα:</p>
              <p className="text-sm text-[#2C1810] border-b border-dotted border-[#C4A882] pb-1 font-light">{trip.country}</p>
            </div>
            <div>
              <p className="text-xs text-[#8B5E3C] mb-1 uppercase tracking-wider">Πόλη:</p>
              <p className="text-sm text-[#2C1810] border-b border-dotted border-[#C4A882] pb-1 font-light">{trip.city}</p>
            </div>
            <div>
              <p className="text-xs text-[#8B5E3C] mb-1 uppercase tracking-wider">Ημερομηνία:</p>
              <p className="text-sm text-[#2C1810] border-b border-dotted border-[#C4A882] pb-1 font-light">{trip.date}</p>
            </div>
            <div>
              <p className="text-xs text-[#8B5E3C] mb-1 uppercase tracking-wider">Με ποιον:</p>
              <p className="text-sm text-[#2C1810] border-b border-dotted border-[#C4A882] pb-1 font-light">{trip.with_who}</p>
            </div>
          </div>

          {/* Sample photos */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-[#F5ECD7] rounded-xl border-2 border-[#C4A882] flex items-center justify-center">
                <span className="text-3xl">📸</span>
              </div>
            ))}
          </div>

          <div className="bg-[#F5ECD7] rounded-xl p-3 mb-3">
            <p className="text-xs text-[#8B5E3C] mb-2 uppercase tracking-wider">🏨 Διαμονή</p>
            <p className="text-xs text-[#2C1810] font-light mb-1"><span className="text-[#8B5E3C]">Που μείναμε:</span> {trip.accommodation}</p>
            <p className="text-xs text-[#2C1810] font-light"><span className="text-[#8B5E3C]">Μέσο μεταφοράς:</span> {trip.transport}</p>
          </div>

          <div className="bg-[#F5ECD7] rounded-xl p-3 mb-3">
            <p className="text-xs text-[#8B5E3C] mb-2 uppercase tracking-wider">🍽️ Γεύσεις</p>
            <p className="text-xs text-[#2C1810] font-light mb-1"><span className="text-[#8B5E3C]">Αγαπημένο φαγητό:</span> {trip.food}</p>
            <p className="text-xs text-[#2C1810] font-light"><span className="text-[#8B5E3C]">Αγαπημένο εστιατόριο:</span> {trip.restaurant}</p>
          </div>

          <div className="space-y-2 mb-4">
            {[
              { label: "⭐ Καλύτερη στιγμή", value: trip.best_moment },
              { label: "😮 Έκπληξη", value: trip.surprise },
              { label: "😄 Αστεία στιγμή", value: trip.funny },
              { label: "✅ Θα ξανάκανα", value: trip.would_do_again },
              { label: "❌ Δεν θα ξανάκανα", value: trip.would_not_do },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-[#8B5E3C] mb-0.5">{item.label}:</p>
                <p className="text-xs text-[#2C1810] font-light border-b border-dotted border-[#C4A882] pb-1">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#F5ECD7] rounded-xl p-3">
            <p className="text-xs text-[#8B5E3C] mb-2 uppercase tracking-wider">💭 Σκέψεις</p>
            <p className="text-xs text-[#2C1810] font-light mb-1 italic">"{trip.takeaway}"</p>
            <div className="flex justify-between mt-2">
              <p className="text-xs text-[#8B5E3C]">Θα επέστρεφα: <span className="text-[#2C1810]">{trip.return}</span></p>
              <p className="text-xs">{trip.rating}</p>
            </div>
          </div>
        </div>
      );
    }

    if (page.key === "dreams") {
      return (
        <div className="h-full overflow-y-auto px-6 py-4"
          style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(196,168,130,0.08) 28px, rgba(196,168,130,0.08) 29px)` }}
        >
          <h2 className="text-xl font-serif text-[#2C1810] mb-4 text-center">🌟 Ταξιδιωτικά Όνειρα</h2>
          <div className="space-y-4">
            {[
              { label: "Bucket list", value: "🗺️ Νέα Ζηλανδία\n🏔️ Παταγονία\n🌏 Νότια Αφρική\n🏝️ Μαλδίβες\n🇵🇪 Μάτσου Πίτσου" },
              { label: "Επόμενο ταξίδι", value: "Πορτογαλία — Σεπτέμβριο 2025" },
              { label: "Ταξίδι ονείρων", value: "3 μήνες στην Ασία — Ιαπωνία, Ταϊλάνδη, Βιετνάμ" },
              { label: "Ταξιδιωτικός σύντροφος", value: "Ο ένας για τον άλλον — πάντα" },
              { label: "Το πιο σημαντικό που έμαθα", value: "Τα ταξίδια δεν είναι προορισμοί — είναι άνθρωποι που συναντάς και στιγμές που σε αλλάζουν" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-[#8B5E3C] mb-1 uppercase tracking-wider">{item.label}:</p>
                <p className="text-sm text-[#2C1810] border-b border-dotted border-[#C4A882] pb-1 font-light italic whitespace-pre-line">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #2C1810 0%, #1A0F0A 100%)" }}
    >
      {/* Preview banner */}
      <div className="w-full max-w-md mb-4 bg-[#C4A882] rounded-full py-2 px-6 text-center">
        <p className="text-xs text-[#2C1810] uppercase tracking-widest font-light">
          👁️ Δείγμα — Travel Memory Box
        </p>
      </div>

      <div
        className={`relative rounded-lg shadow-2xl w-full max-w-md transition-all duration-400 ${flipping ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
        style={{
          minHeight: "600px",
          background: "#F5ECD7",
          boxShadow: "8px 8px 30px rgba(0,0,0,0.6), inset -3px 0 6px rgba(0,0,0,0.1)",
        }}
      >
        <div className="sticky top-0 z-10 pt-4 pb-2 flex justify-between items-center px-4 border-b border-[rgba(139,94,60,0.2)]"
          style={{ background: "#F5ECD7" }}
        >
          <Link href="/">
            <img src="/logo.png" alt="Logo" className="w-12 h-auto hover:opacity-80 transition-opacity" />
          </Link>
          <p className="text-xs text-[#8B5E3C] uppercase tracking-widest font-light">✈ Travel Memory Box</p>
          <div className="w-12" />
        </div>

        <div className="p-4" style={{ minHeight: "520px" }}>
          {renderPage()}
        </div>

        <div className="text-center py-2 text-xs text-[#8B6B4A]">
          {currentPage + 1} / {PAGES.length}
        </div>
      </div>

      <div className="flex items-center gap-8 mt-6">
        <button
          onClick={() => goToPage("prev")}
          disabled={currentPage === 0 || flipping}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-30 text-xl"
          style={{ background: "#F5ECD7", color: "#2C1810" }}
        >
          ←
        </button>
        <span className="text-sm font-light text-center max-w-xs" style={{ color: "#C4A882" }}>
          {PAGES[currentPage].title}
        </span>
        <button
          onClick={() => goToPage("next")}
          disabled={currentPage === PAGES.length - 1 || flipping}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-30 text-xl"
          style={{ background: "#F5ECD7", color: "#2C1810" }}
        >
          →
        </button>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <Link
          href="/checkout?template=travel"
          className="px-8 py-3 rounded-full font-light uppercase tracking-wider text-sm transition-all text-center"
          style={{ background: "#C4A882", color: "#2C1810" }}
        >
          ✈️ Αγόρασε το Travel Memory Box — 29.99€
        </Link>
        <Link
          href="/"
          className="text-xs font-light hover:opacity-70 transition-opacity tracking-widest uppercase"
          style={{ color: "#8B6B4A" }}
        >
          ← Επιστροφή στην αρχική
        </Link>
      </div>
    </div>
  );
}
