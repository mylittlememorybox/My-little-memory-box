"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STAMP_COLORS = ["#1A4A7A", "#2E6B9E", "#1A6B5A", "#7A1A4A", "#4A1A7A", "#7A4A1A"];

const PassportStamp = ({ country, city, date, entryType = "VISITED", rotation = 0, opacity = 1, color = "#1A4A7A" }: {
  country: string; city: string; date: string; entryType?: string; rotation?: number; opacity?: number; color?: string;
}) => (
  <div style={{ transform: `rotate(${rotation}deg)`, opacity, display: "inline-block" }}>
    <svg width="120" height="120" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="72" fill="none" stroke={color} strokeWidth="3" strokeDasharray="4 2" />
      <circle cx="80" cy="80" r="60" fill="none" stroke={color} strokeWidth="1.5" />
      <path id={`topArc-${city}`} d="M 20,80 A 60,60 0 0,1 140,80" fill="none" />
      <text fontSize="11" fill={color} fontFamily="Georgia, serif" letterSpacing="3">
        <textPath href={`#topArc-${city}`} startOffset="50%" textAnchor="middle">
          {country.toUpperCase()}
        </textPath>
      </text>
      <path id={`bottomArc-${city}`} d="M 20,80 A 60,60 0 0,0 140,80" fill="none" />
      <text fontSize="9" fill={color} fontFamily="Georgia, serif" letterSpacing="2">
        <textPath href={`#bottomArc-${city}`} startOffset="50%" textAnchor="middle">
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

interface TextFieldProps {
  pageKey: string;
  fieldKey: string;
  placeholder: string;
  multiline?: boolean;
  value: string;
  onChange: (pageKey: string, fieldKey: string, value: string) => void;
}

function TextField({ pageKey, fieldKey, placeholder, multiline = false, value, onChange }: TextFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<any>(null);
  const inputRef = useRef<any>(null);

  useEffect(() => { setLocalValue(value); }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { onChange(pageKey, fieldKey, newValue); }, 1500);
  };

  const baseClass = "w-full bg-transparent border-b-2 border-dotted text-[#0D2B4A] font-light text-sm focus:outline-none placeholder-[#A8C4E0] py-1 resize-none";
  const style = { borderColor: "#A8C4E0" };

  if (multiline) {
    return (
      <textarea ref={inputRef} value={localValue} onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder} rows={3} className={baseClass} style={style}
        onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
      />
    );
  }

  return (
    <input ref={inputRef} type="text" value={localValue} onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder} className={baseClass} style={style}
      onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
    />
  );
}

export default function TravelMemoryBoxPage({ params }: { params: { id: string } }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState<Record<string, Record<string, string>>>({});
  const [photos, setPhotos] = useState<Record<string, Record<string, string>>>({});
  const [flipping, setFlipping] = useState(false);

  const TOTAL_TRIPS = 20;
  const PAGES = [
    { key: "cover", title: "Εξώφυλλο" },
    { key: "profile", title: "Ταξιδιωτικό Προφίλ" },
    ...Array.from({ length: TOTAL_TRIPS }, (_, i) => ({
      key: `trip_${i + 1}`,
      title: `Ταξίδι #${i + 1}`,
    })),
    { key: "dreams", title: "Τα Όνειρά μου" },
  ];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: boxData } = await supabase.from("memory_box_data").select("*").eq("memory_box_id", params.id);
    if (boxData) {
      const organized: Record<string, Record<string, string>> = {};
      boxData.forEach((item: any) => {
        if (!organized[item.page_key]) organized[item.page_key] = {};
        organized[item.page_key][item.field_key] = item.field_value;
      });
      setData(organized);
    }

    const { data: photoData } = await supabase.from("memory_box_photos").select("*").eq("memory_box_id", params.id);
    if (photoData) {
      const organizedPhotos: Record<string, Record<string, string>> = {};
      photoData.forEach((item: any) => {
        if (!organizedPhotos[item.page_key]) organizedPhotos[item.page_key] = {};
        organizedPhotos[item.page_key][item.photo_key] = item.photo_url;
      });
      setPhotos(organizedPhotos);
    }
  };

  const saveField = useCallback(async (pageKey: string, fieldKey: string, value: string) => {
    setData(prev => {
      const newData = { ...prev };
      if (!newData[pageKey]) newData[pageKey] = {};
      newData[pageKey][fieldKey] = value;
      return newData;
    });
    await supabase.from("memory_box_data").upsert({
      memory_box_id: params.id,
      page_key: pageKey,
      field_key: fieldKey,
      field_value: value,
      updated_at: new Date().toISOString(),
    }, { onConflict: "memory_box_id,page_key,field_key" });
  }, [params.id]);

  const uploadPhoto = async (pageKey: string, photoKey: string, file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const fileName = `${user.id}/${params.id}/${pageKey}/${photoKey}_${Date.now()}`;
    const { data: uploadData, error } = await supabase.storage.from("memory-box-photos").upload(fileName, file, { upsert: true });
    if (!error && uploadData) {
      const { data: urlData } = supabase.storage.from("memory-box-photos").getPublicUrl(fileName);
      const photoUrl = urlData.publicUrl;
      await supabase.from("memory_box_photos").upsert({
        memory_box_id: params.id, page_key: pageKey, photo_key: photoKey, photo_url: photoUrl,
      }, { onConflict: "memory_box_id,page_key,photo_key" });
      setPhotos(prev => {
        const newPhotos = { ...prev };
        if (!newPhotos[pageKey]) newPhotos[pageKey] = {};
        newPhotos[pageKey][photoKey] = photoUrl;
        return newPhotos;
      });
    }
  };

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

  const PhotoPlaceholder = ({ pageKey, photoKey }: { pageKey: string; photoKey: string }) => {
    const photoUrl = photos[pageKey]?.[photoKey];
    return (
      <label className="block cursor-pointer">
        <input type="file" accept="image/*" className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return; }
            uploadPhoto(pageKey, photoKey, file);
          }}
        />
        {photoUrl ? (
          <img src={photoUrl} alt="Memory" className="w-full h-48 object-contain rounded-xl border-4 border-white shadow-md" style={{ backgroundColor: "rgba(26,74,122,0.08)" }} />
        ) : (
          <div className="w-full h-48 rounded-xl border-4 border-dashed flex flex-col items-center justify-center hover:opacity-80 transition-all"
            style={{ backgroundColor: "rgba(26,74,122,0.06)", borderColor: "rgba(26,74,122,0.2)" }}>
            <span className="text-3xl mb-2">📸</span>
            <span className="text-xs font-light" style={{ color: "#A8C4E0" }}>Πατήστε για φωτογραφία</span>
          </div>
        )}
      </label>
    );
  };

  const F = ({ pk, fk, ph, ml = false }: { pk: string; fk: string; ph: string; ml?: boolean }) => (
    <TextField pageKey={pk} fieldKey={fk} placeholder={ph} multiline={ml} value={data[pk]?.[fk] || ""} onChange={saveField} />
  );

  const Label = ({ text }: { text: string }) => (
    <p style={{ fontSize: "9px", color: "#1A4A7A", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "3px", fontFamily: "Georgia, serif" }}>{text}</p>
  );

  const SectionBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: "rgba(26,74,122,0.06)", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
      <p style={{ fontSize: "9px", color: "#1A4A7A", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px", fontFamily: "Georgia, serif" }}>{title}</p>
      {children}
    </div>
  );

  const renderTripPage = (tripNum: number) => {
    const pk = `trip_${tripNum}`;
    const country = data[pk]?.country || `Ταξίδι ${tripNum}`;
    const city = data[pk]?.city || "Πόλη";
    const date = data[pk]?.date || "2024";
    const stampColor = STAMP_COLORS[(tripNum - 1) % STAMP_COLORS.length];
    const rotation = ((tripNum % 3) - 1) * 5;

    return (
      <div className="h-full overflow-y-auto px-2 py-2">
        <div className="flex justify-between items-start mb-3">
          <h2 style={{ fontSize: "17px", color: "#0D2B4A", fontFamily: "Georgia, serif", fontWeight: "normal" }}>✈ Ταξίδι #{tripNum}</h2>
          <PassportStamp country={country} city={city} date={date} entryType="VISITED" rotation={rotation} opacity={0.85} color={stampColor} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><Label text="Χώρα" /><F pk={pk} fk="country" ph="π.χ. Ιταλία" /></div>
          <div><Label text="Πόλη" /><F pk={pk} fk="city" ph="π.χ. Ρώμη" /></div>
          <div><Label text="Ημερομηνία" /><F pk={pk} fk="date" ph="π.χ. JUN 2024" /></div>
          <div><Label text="Με ποιον" /><F pk={pk} fk="with_who" ph="..." /></div>
        </div>

        <div><Label text="Πώς πήγα" /><F pk={pk} fk="transport" ph="✈️ Αεροπλάνο / 🚢 Πλοίο / 🚗 Αμάξι..." /></div>

        <div className="grid grid-cols-2 gap-3 my-3">
          <PhotoPlaceholder pageKey={pk} photoKey="photo1" />
          <PhotoPlaceholder pageKey={pk} photoKey="photo2" />
        </div>

        <SectionBox title="🏨 Διαμονή">
          <div className="space-y-2">
            <div><Label text="Που μείναμε" /><F pk={pk} fk="accommodation" ph="..." /></div>
            <div><Label text="Αγαπημένο σημείο" /><F pk={pk} fk="accommodation_highlight" ph="..." /></div>
            <PhotoPlaceholder pageKey={pk} photoKey="photo_accommodation" />
          </div>
        </SectionBox>

        <SectionBox title="🍽️ Γεύσεις">
          <div className="space-y-2">
            <div><Label text="Αγαπημένο φαγητό" /><F pk={pk} fk="food" ph="..." /></div>
            <div><Label text="Αγαπημένο εστιατόριο/καφέ" /><F pk={pk} fk="restaurant" ph="..." /></div>
            <PhotoPlaceholder pageKey={pk} photoKey="photo_food" />
          </div>
        </SectionBox>

        <div className="space-y-3 mb-3">
          {[
            { fk: "best_moment", label: "⭐ Η καλύτερη στιγμή" },
            { fk: "surprise", label: "😮 Κάτι που με εξέπληξε" },
            { fk: "funny", label: "😄 Πιο αστεία στιγμή" },
            { fk: "would_do_again", label: "✅ Κάτι που θα ξανάκανα" },
            { fk: "would_not_do", label: "❌ Κάτι που δεν θα ξανάκανα" },
          ].map((item) => (
            <div key={item.fk}>
              <Label text={item.label} />
              <F pk={pk} fk={item.fk} ph="..." ml />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <PhotoPlaceholder pageKey={pk} photoKey="photo3" />
          <PhotoPlaceholder pageKey={pk} photoKey="photo4" />
        </div>

        <SectionBox title="💭 Σκέψεις">
          <div className="space-y-2">
            <div><Label text="Τι κράτησα από αυτό το ταξίδι" /><F pk={pk} fk="takeaway" ph="..." ml /></div>
            <div><Label text="Θα επέστρεφα;" /><F pk={pk} fk="return" ph="Ναι / Όχι / Ίσως..." /></div>
            <div><Label text="Βαθμολογία" /><F pk={pk} fk="rating" ph="⭐⭐⭐⭐⭐" /></div>
            <PhotoPlaceholder pageKey={pk} photoKey="photo5" />
          </div>
        </SectionBox>
      </div>
    );
  };

  const renderPage = () => {
    const page = PAGES[currentPage];

    if (page.key === "cover") return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8"
        style={{ background: "linear-gradient(160deg, #0D2B4A 0%, #1A4A7A 50%, #0D3D5C 100%)", margin: "-16px", borderRadius: "12px", padding: "30px" }}
      >
        <div style={{ background: "white", borderRadius: "50px", padding: "10px 24px", marginBottom: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          <img src="/logo.png" alt="Logo" style={{ width: "80px", height: "auto" }} />
        </div>
        <p style={{ color: "#A8C4E0", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "8px", fontFamily: "Georgia, serif" }}>✈ My Little Memory Box</p>
        <h1 style={{ color: "white", fontSize: "26px", fontFamily: "Georgia, serif", fontWeight: "normal", marginBottom: "6px" }}>Travel Memory Box</h1>
        <div className="flex items-center gap-3 my-3">
          <div style={{ width: "40px", height: "1px", background: "#A8C4E0", opacity: 0.5 }} />
          <span style={{ color: "#A8C4E0" }}>✦</span>
          <div style={{ width: "40px", height: "1px", background: "#A8C4E0", opacity: 0.5 }} />
        </div>
        <div className="w-full max-w-xs space-y-3 mb-6">
          <div>
            <p style={{ color: "#A8C4E0", fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "4px" }}>Όνομα</p>
            <input type="text" value={data["cover"]?.name || ""} onChange={(e) => saveField("cover", "name", e.target.value)}
              placeholder="Το όνομά σου..." className="w-full bg-transparent border-b text-white font-light text-sm focus:outline-none py-1 text-center placeholder-[#A8C4E0]"
              style={{ borderColor: "rgba(168,196,224,0.5)" }} />
          </div>
          <div>
            <p style={{ color: "#A8C4E0", fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "4px" }}>Χρονιά έναρξης</p>
            <input type="text" value={data["cover"]?.year || ""} onChange={(e) => saveField("cover", "year", e.target.value)}
              placeholder="π.χ. 2020" className="w-full bg-transparent border-b text-white font-light text-sm focus:outline-none py-1 text-center placeholder-[#A8C4E0]"
              style={{ borderColor: "rgba(168,196,224,0.5)" }} />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-center opacity-60">
          {["ROMA", "TOKYO", "PARIS", "NYC", "ATHENS"].map((city, i) => (
            <div key={city} style={{ transform: `rotate(${(i % 3 - 1) * 8}deg)` }}>
              <svg width="50" height="50" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="72" fill="none" stroke="#A8C4E0" strokeWidth="3" strokeDasharray="4 2" />
                <circle cx="80" cy="80" r="60" fill="none" stroke="#A8C4E0" strokeWidth="1.5" />
                <text x="80" y="88" textAnchor="middle" fontSize="28" fill="#A8C4E0">✈</text>
              </svg>
            </div>
          ))}
        </div>
      </div>
    );

    if (page.key === "profile") return (
      <div className="h-full overflow-y-auto px-2 py-2">
        <h2 style={{ fontSize: "18px", color: "#0D2B4A", fontFamily: "Georgia, serif", fontWeight: "normal", textAlign: "center", marginBottom: "16px" }}>✈ Ταξιδιωτικό Προφίλ</h2>
        <div className="space-y-3">
          {[
            { fk: "first_trip", label: "Το πρώτο μου ταξίδι ήταν" },
            { fk: "countries_count", label: "Χώρες που έχω επισκεφτεί" },
            { fk: "favorite_destination", label: "Αγαπημένος προορισμός" },
            { fk: "dream_destination", label: "Ονειρεμένος προορισμός" },
            { fk: "travel_motto", label: "Η φιλοσοφία μου για τα ταξίδια" },
          ].map((item) => (
            <div key={item.fk}>
              <Label text={item.label} />
              <F pk="profile" fk={item.fk} ph="..." ml />
            </div>
          ))}
        </div>
      </div>
    );

    if (page.key === "dreams") return (
      <div className="h-full overflow-y-auto px-2 py-2">
        <h2 style={{ fontSize: "18px", color: "#0D2B4A", fontFamily: "Georgia, serif", fontWeight: "normal", textAlign: "center", marginBottom: "16px" }}>🌟 Τα Ταξιδιωτικά μου Όνειρα</h2>
        <div className="space-y-3">
          {[
            { fk: "bucket_list", label: "Bucket list — μέρη που θέλω να επισκεφτώ", ml: true },
            { fk: "next_trip", label: "Το επόμενο ταξίδι που σχεδιάζω" },
            { fk: "dream_trip", label: "Το ταξίδι των ονείρων μου" },
            { fk: "travel_partner", label: "Με ποιον θα ήθελα να ταξιδέψω" },
            { fk: "lesson", label: "Το πιο σημαντικό που έμαθα από τα ταξίδια μου", ml: true },
          ].map((item) => (
            <div key={item.fk}>
              <Label text={item.label} />
              <F pk="dreams" fk={item.fk} ph="..." ml={item.ml} />
            </div>
          ))}
        </div>
      </div>
    );

    const tripMatch = page.key.match(/^trip_(\d+)$/);
    if (tripMatch) return renderTripPage(parseInt(tripMatch[1]));
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "linear-gradient(160deg, #0D2B4A 0%, #1A4A7A 60%, #0D3D5C 100%)" }}
    >
      <div
        className={`relative rounded-lg shadow-2xl w-full max-w-md transition-all duration-400 ${flipping ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
        style={{ minHeight: "600px", background: "#F8F4EE", boxShadow: "12px 12px 40px rgba(0,0,0,0.5), -2px 0 8px rgba(0,0,0,0.2)", overflow: "hidden" }}
      >
        <div className="sticky top-0 z-10 pt-3 pb-2 flex justify-between items-center px-4"
          style={{ background: "#F8F4EE", borderBottom: "1px solid rgba(26,74,122,0.15)" }}
        >
          <button onClick={() => setCurrentPage(0)}>
            <img src="/logo.png" alt="Logo" style={{ width: "44px", height: "auto" }} />
          </button>
          <p style={{ fontSize: "9px", color: "#1A4A7A", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>✈ Travel Memory Box</p>
          <div style={{ width: "44px" }} />
        </div>

        <div className="p-4" style={{ minHeight: "520px" }}>
          {renderPage()}
        </div>

        <div className="text-center py-2" style={{ borderTop: "1px solid rgba(26,74,122,0.1)" }}>
          <p style={{ fontSize: "10px", color: "#A8C4E0", fontFamily: "Georgia, serif" }}>
            {currentPage + 1} / {PAGES.length}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-8 mt-6">
        <button onClick={() => goToPage("prev")} disabled={currentPage === 0 || flipping}
          style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "18px", opacity: currentPage === 0 ? 0.3 : 1 }}
        >←</button>
        <span style={{ color: "#A8C4E0", fontSize: "12px", fontFamily: "Georgia, serif", maxWidth: "150px", textAlign: "center" }}>
          {PAGES[currentPage].title}
        </span>
        <button onClick={() => goToPage("next")} disabled={currentPage === PAGES.length - 1 || flipping}
          style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "18px", opacity: currentPage === PAGES.length - 1 ? 0.3 : 1 }}
        >→</button>
      </div>

      <div className="flex gap-2 mt-4 flex-wrap justify-center max-w-md">
        {PAGES.map((page, i) => (
          <button key={page.key} onClick={() => setCurrentPage(i)}
            style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontFamily: "Georgia, serif", background: currentPage === i ? "#A8C4E0" : "rgba(168,196,224,0.2)", color: currentPage === i ? "#0D2B4A" : "#A8C4E0", border: "none", cursor: "pointer" }}
          >
            {page.key.startsWith("trip_") ? `#${page.key.split("_")[1]}` : page.title.charAt(0)}
          </button>
        ))}
      </div>

      <Link href="/dashboard" className="mt-6 text-xs font-light hover:opacity-70 transition-opacity tracking-widest uppercase"
        style={{ color: "rgba(168,196,224,0.6)" }}
      >
        ← Dashboard
      </Link>
    </div>
  );
}
