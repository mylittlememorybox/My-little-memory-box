"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STAMP_COLORS = [
  "#8B5E3C", "#2C5F8A", "#2C8A5F", "#8A2C5F", "#5F2C8A", "#8A5F2C"
];

const PassportStamp = ({ country, city, date, entryType = "ENTRY", rotation = 0, opacity = 1, color = "#8B5E3C" }) => (
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

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(pageKey, fieldKey, newValue);
    }, 1500);
  };

  const baseClass = "w-full bg-transparent border-b-2 border-dotted border-[#C4A882] text-[#2C1810] font-light text-sm focus:outline-none focus:border-[#8B5E3C] placeholder-[#C4A882] py-1 resize-none";

  if (multiline) {
    return (
      <textarea
        ref={inputRef}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={baseClass}
        onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
      />
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      className={baseClass}
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
    { key: "dreams", title: "Τα Όνειρά μας" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: boxData } = await supabase
      .from("memory_box_data")
      .select("*")
      .eq("memory_box_id", params.id);

    if (boxData) {
      const organized: Record<string, Record<string, string>> = {};
      boxData.forEach((item: any) => {
        if (!organized[item.page_key]) organized[item.page_key] = {};
        organized[item.page_key][item.field_key] = item.field_value;
      });
      setData(organized);
    }

    const { data: photoData } = await supabase
      .from("memory_box_photos")
      .select("*")
      .eq("memory_box_id", params.id);

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
    const { data: uploadData, error } = await supabase.storage
      .from("memory-box-photos")
      .upload(fileName, file, { upsert: true });

    if (!error && uploadData) {
      const { data: urlData } = supabase.storage
        .from("memory-box-photos")
        .getPublicUrl(fileName);

      const photoUrl = urlData.publicUrl;

      await supabase.from("memory_box_photos").upsert({
        memory_box_id: params.id,
        page_key: pageKey,
        photo_key: photoKey,
        photo_url: photoUrl,
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
          <img src={photoUrl} alt="Memory" className="w-full h-48 object-contain bg-[#F5ECD7] rounded-xl border-4 border-white shadow-md" />
        ) : (
          <div className="w-full h-48 bg-[#F5ECD7] rounded-xl border-4 border-dashed border-[#C4A882] flex flex-col items-center justify-center hover:bg-[#EDE0D4] transition-all">
            <span className="text-3xl mb-2">📸</span>
            <span className="text-xs text-[#8B6B4A] font-light">Πατήστε για φωτογραφία</span>
          </div>
        )}
      </label>
    );
  };

  const F = ({ pk, fk, ph, ml = false }: { pk: string; fk: string; ph: string; ml?: boolean }) => (
    <TextField pageKey={pk} fieldKey={fk} placeholder={ph} multiline={ml} value={data[pk]?.[fk] || ""} onChange={saveField} />
  );

  const renderTripPage = (tripNum: number) => {
    const pk = `trip_${tripNum}`;
    const country = data[pk]?.country || `Ταξίδι ${tripNum}`;
    const city = data[pk]?.city || "Πόλη";
    const date = data[pk]?.date || "2024";
    const stampColor = STAMP_COLORS[(tripNum - 1) % STAMP_COLORS.length];
    const rotation = ((tripNum % 3) - 1) * 5;

    return (
      <div className="h-full overflow-y-auto px-6 py-4"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(196,168,130,0.08) 28px, rgba(196,168,130,0.08) 29px)`,
        }}
      >
        {/* Stamp */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-serif text-[#2C1810]">
            ✈ Ταξίδι #{tripNum}
          </h2>
          <PassportStamp
            country={country}
            city={city}
            date={date}
            entryType="VISITED"
            rotation={rotation}
            opacity={0.85}
            color={stampColor}
          />
        </div>

        {/* Basic info */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-[#8B5E3C] mb-1 uppercase tracking-wider">Χώρα</p>
              <F pk={pk} fk="country" ph="π.χ. Ιταλία" />
            </div>
            <div>
              <p className="text-xs text-[#8B5E3C] mb-1 uppercase tracking-wider">Πόλη</p>
              <F pk={pk} fk="city" ph="π.χ. Ρώμη" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-[#8B5E3C] mb-1 uppercase tracking-wider">Ημερομηνία</p>
              <F pk={pk} fk="date" ph="π.χ. JUN 2024" />
            </div>
            <div>
              <p className="text-xs text-[#8B5E3C] mb-1 uppercase tracking-wider">Με ποιον</p>
              <F pk={pk} fk="with_who" ph="..." />
            </div>
          </div>
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1 uppercase tracking-wider">Πώς πήγα</p>
            <F pk={pk} fk="transport" ph="✈️ Αεροπλάνο / 🚢 Πλοίο / 🚗 Αμάξι..." />
          </div>
        </div>

        {/* Photos */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <PhotoPlaceholder pageKey={pk} photoKey="photo1" />
          <PhotoPlaceholder pageKey={pk} photoKey="photo2" />
        </div>

        {/* Accommodation */}
        <div className="bg-[#F5ECD7] rounded-xl p-3 mb-3">
          <p className="text-xs text-[#8B5E3C] mb-2 uppercase tracking-wider">🏨 Διαμονή</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-[#8B6B4A] mb-1">Που μείναμε:</p>
              <F pk={pk} fk="accommodation" ph="..." />
            </div>
            <div>
              <p className="text-xs text-[#8B6B4A] mb-1">Αγαπημένο σημείο:</p>
              <F pk={pk} fk="accommodation_highlight" ph="..." />
            </div>
            <PhotoPlaceholder pageKey={pk} photoKey="photo_accommodation" />
          </div>
        </div>

        {/* Food */}
        <div className="bg-[#F5ECD7] rounded-xl p-3 mb-3">
          <p className="text-xs text-[#8B5E3C] mb-2 uppercase tracking-wider">🍽️ Γεύσεις</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-[#8B6B4A] mb-1">Αγαπημένο φαγητό:</p>
              <F pk={pk} fk="food" ph="..." />
            </div>
            <div>
              <p className="text-xs text-[#8B6B4A] mb-1">Αγαπημένο εστιατόριο/καφέ:</p>
              <F pk={pk} fk="restaurant" ph="..." />
            </div>
            <PhotoPlaceholder pageKey={pk} photoKey="photo_food" />
          </div>
        </div>

        {/* Moments */}
        <div className="space-y-3 mb-4">
          {[
            { fk: "best_moment", label: "⭐ Η καλύτερη στιγμή" },
            { fk: "surprise", label: "😮 Κάτι που με εξέπληξε" },
            { fk: "funny", label: "😄 Πιο αστεία στιγμή" },
            { fk: "would_do_again", label: "✅ Κάτι που θα ξανάκανα" },
            { fk: "would_not_do", label: "❌ Κάτι που δεν θα ξανάκανα" },
          ].map((item) => (
            <div key={item.fk}>
              <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
              <F pk={pk} fk={item.fk} ph="..." ml />
            </div>
          ))}
        </div>

        {/* More photos */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <PhotoPlaceholder pageKey={pk} photoKey="photo3" />
          <PhotoPlaceholder pageKey={pk} photoKey="photo4" />
        </div>

        {/* Reflection */}
        <div className="bg-[#F5ECD7] rounded-xl p-3 mb-3">
          <p className="text-xs text-[#8B5E3C] mb-2 uppercase tracking-wider">💭 Σκέψεις</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-[#8B6B4A] mb-1">Τι κράτησα από αυτό το ταξίδι:</p>
              <F pk={pk} fk="takeaway" ph="..." ml />
            </div>
            <div>
              <p className="text-xs text-[#8B6B4A] mb-1">Θα επέστρεφα;</p>
              <F pk={pk} fk="return" ph="Ναι / Όχι / Ίσως..." />
            </div>
            <div>
              <p className="text-xs text-[#8B6B4A] mb-1">Βαθμολογία:</p>
              <F pk={pk} fk="rating" ph="⭐⭐⭐⭐⭐" />
            </div>
            <PhotoPlaceholder pageKey={pk} photoKey="photo5" />
          </div>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    const page = PAGES[currentPage];

    if (page.key === "cover") {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8"
          style={{
            background: "linear-gradient(135deg, #2C1810 0%, #5C3820 100%)",
            margin: "-16px",
            borderRadius: "8px",
          }}
        >
          <img src="/logo.png" alt="Logo" className="w-32 h-auto mb-4 drop-shadow-lg" style={{ filter: "brightness(0) invert(1) opacity(0.9)" }} />
          <div className="text-[#C4A882] text-xs tracking-widest uppercase mb-2">✈ My Little Memory Box</div>
          <h1 className="text-3xl font-serif text-[#F5ECD7] mb-2">Travel Memory Box</h1>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            <span className="text-[#C4A882]">✈</span>
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          </div>
          <div className="w-full max-w-xs space-y-3 mb-6">
            <div>
              <p className="text-xs text-[#C4A882] mb-1 uppercase tracking-wider">Όνομα</p>
              <input
                type="text"
                value={data["cover"]?.name || ""}
                onChange={(e) => saveField("cover", "name", e.target.value)}
                placeholder="Το όνομά σου..."
                className="w-full bg-transparent border-b border-[#C4A882] text-[#F5ECD7] font-light text-sm focus:outline-none placeholder-[#8B6B4A] py-1 text-center"
              />
            </div>
            <div>
              <p className="text-xs text-[#C4A882] mb-1 uppercase tracking-wider">Χρονιά έναρξης</p>
              <input
                type="text"
                value={data["cover"]?.year || ""}
                onChange={(e) => saveField("cover", "year", e.target.value)}
                placeholder="π.χ. 2020"
                className="w-full bg-transparent border-b border-[#C4A882] text-[#F5ECD7] font-light text-sm focus:outline-none placeholder-[#8B6B4A] py-1 text-center"
              />
            </div>
          </div>

          {/* Mini stamps preview */}
          <div className="flex gap-2 flex-wrap justify-center opacity-60">
            {["GR", "FR", "IT", "ES", "JP"].map((code, i) => (
              <div key={code} style={{ transform: `rotate(${(i % 3 - 1) * 8}deg)` }}>
                <svg width="50" height="50" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="72" fill="none" stroke="#C4A882" strokeWidth="3" strokeDasharray="4 2" />
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#C4A882" strokeWidth="1.5" />
                  <text x="80" y="88" textAnchor="middle" fontSize="28" fill="#C4A882">✈</text>
                </svg>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (page.key === "profile") {
      return (
        <div className="h-full overflow-y-auto px-6 py-4">
          <h2 className="text-xl font-serif text-[#2C1810] mb-4 text-center">✈ Ταξιδιωτικό Προφίλ</h2>
          <div className="space-y-4">
            {[
              { fk: "first_trip", label: "Το πρώτο μου ταξίδι ήταν" },
              { fk: "countries_count", label: "Χώρες που έχω επισκεφτεί" },
              { fk: "favorite_destination", label: "Αγαπημένος προορισμός" },
              { fk: "travel_style", label: "Στυλ ταξιδιού" },
              { fk: "dream_destination", label: "Ονειρεμένος προορισμός" },
              { fk: "travel_motto", label: "Η φιλοσοφία μου για τα ταξίδια" },
            ].map((item) => (
              <div key={item.fk}>
                <p className="text-xs text-[#8B5E3C] mb-1 uppercase tracking-wider">{item.label}:</p>
                <F pk="profile" fk={item.fk} ph="..." ml />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (page.key === "dreams") {
      return (
        <div className="h-full overflow-y-auto px-6 py-4">
          <h2 className="text-xl font-serif text-[#2C1810] mb-4 text-center">🌟 Τα Ταξιδιωτικά μου Όνειρα</h2>
          <div className="space-y-4">
            {[
              { fk: "bucket_list", label: "Bucket list — 5 μέρη που θέλω να επισκεφτώ", ml: true },
              { fk: "next_trip", label: "Το επόμενο ταξίδι που σχεδιάζω" },
              { fk: "dream_trip", label: "Το ταξίδι των ονείρων μου" },
              { fk: "travel_partner", label: "Με ποιον θα ήθελα να ταξιδέψω" },
              { fk: "lesson", label: "Το πιο σημαντικό που έμαθα από τα ταξίδια μου", ml: true },
            ].map((item) => (
              <div key={item.fk}>
                <p className="text-xs text-[#8B5E3C] mb-1 uppercase tracking-wider">{item.label}:</p>
                <F pk="dreams" fk={item.fk} ph="..." ml={item.ml} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Trip pages
    const tripMatch = page.key.match(/^trip_(\d+)$/);
    if (tripMatch) {
      return renderTripPage(parseInt(tripMatch[1]));
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #2C1810 0%, #1A0F0A 100%)" }}
    >
      <div
        className={`relative rounded-lg shadow-2xl w-full max-w-md transition-all duration-400 ${flipping ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
        style={{
          minHeight: "600px",
          background: "#F5ECD7",
          boxShadow: "8px 8px 30px rgba(0,0,0,0.6), inset -3px 0 6px rgba(0,0,0,0.1)",
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(196,168,130,0.05) 28px, rgba(196,168,130,0.05) 29px)`,
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 pt-4 pb-2 flex justify-between items-center px-4 border-b border-[rgba(139,94,60,0.2)]"
          style={{ background: "#F5ECD7" }}
        >
          <button onClick={() => setCurrentPage(0)}>
            <img src="/logo.png" alt="Logo" className="w-12 h-auto hover:opacity-80 transition-opacity" />
          </button>
          <p className="text-xs text-[#8B5E3C] uppercase tracking-widest font-light">
            ✈ Travel Memory Box
          </p>
          <div className="w-12" />
        </div>

        <div className="p-4" style={{ minHeight: "520px" }}>
          {renderPage()}
        </div>

        <div className="text-center py-2 text-xs text-[#8B6B4A]">
          {currentPage + 1} / {PAGES.length}
        </div>
      </div>

      {/* Navigation */}
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

      {/* Quick navigation */}
      <div className="flex gap-2 mt-4 flex-wrap justify-center max-w-md">
        {PAGES.map((page, i) => (
          <button
            key={page.key}
            onClick={() => setCurrentPage(i)}
            className="text-xs px-2 py-1 rounded-full transition-all"
            style={{
              background: currentPage === i ? "#C4A882" : "rgba(196,168,130,0.2)",
              color: currentPage === i ? "#2C1810" : "#C4A882",
            }}
          >
            {page.key.startsWith("trip_") ? `#${page.key.split("_")[1]}` : page.title.charAt(0)}
          </button>
        ))}
      </div>

      <Link
        href="/dashboard"
        className="mt-6 text-xs font-light hover:opacity-70 transition-opacity tracking-widest uppercase"
        style={{ color: "#8B6B4A" }}
      >
        ← Dashboard
      </Link>
    </div>
  );
}
