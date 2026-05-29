"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STAMP_COLORS = ["#1A4A7A", "#2E6B9E", "#1A6B5A", "#7A1A4A", "#4A1A7A", "#7A4A1A"];

export default function DownloadPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<Record<string, Record<string, string>>>({});
  const [photos, setPhotos] = useState<Record<string, Record<string, string>>>({});
  const [templateId, setTemplateId] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: box } = await supabase.from("memory_boxes").select("*").eq("id", params.id).single();
    if (box) setTemplateId(box.template_id);

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
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setGenerating(true);
    setProgress(0);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const pages = contentRef.current.querySelectorAll(".pdf-page");
      const pdf = new jsPDF("p", "mm", "a4");
      const totalPages = pages.length;
      for (let i = 0; i < totalPages; i++) {
        setProgress(Math.round((i / totalPages) * 100));
        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 2, useCORS: true, allowTaint: true,
          backgroundColor: templateId === "travel" ? "#F8F4EE" : "#F9F2EC",
          logging: false, imageTimeout: 15000,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }
      setProgress(100);
      const fileName = templateId === "first-years" ? "ta-prota-xronia" :
                       templateId === "me-and-you" ? "ego-kai-esy" :
                       templateId === "our-wedding" ? "o-gamos-mas" : "travel-memory-box";
      pdf.save(`memory-box-${fileName}.pdf`);
    } catch (error) {
      console.error("PDF error:", error);
      alert("Σφάλμα κατά τη δημιουργία PDF. Δοκιμάστε ξανά.");
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  const get = (page: string, field: string) => data[page]?.[field] || "";
  const photo = (page: string, key: string) => photos[page]?.[key] || "";

  const bgColor = templateId === "travel" ? "#F8F4EE" : "#F9F2EC";
  const accentColor = templateId === "travel" ? "#1A4A7A" : "#8B5E3C";
  const lightColor = templateId === "travel" ? "rgba(26,74,122,0.1)" : "#F2E8DE";

  const PageWrapper = ({ children, bg }: { children: React.ReactNode; bg?: string }) => (
    <div className="pdf-page" style={{ backgroundColor: bg || bgColor, width: "210mm", minHeight: "297mm", padding: "20mm", fontFamily: "Georgia, serif", position: "relative" }}>
      <div style={{ textAlign: "center", marginBottom: "8mm", borderBottom: `1px solid rgba(${templateId === "travel" ? "26,74,122" : "196,168,130"},0.3)`, paddingBottom: "4mm" }}>
        <img src="/logo.png" alt="Logo" style={{ width: "35mm", height: "auto", margin: "0 auto" }} />
      </div>
      {children}
      <div style={{ position: "absolute", bottom: "8mm", left: "20mm", right: "20mm", textAlign: "center", borderTop: `1px solid rgba(${templateId === "travel" ? "26,74,122" : "196,168,130"},0.3)`, paddingTop: "3mm" }}>
        <p style={{ fontSize: "7pt", color: templateId === "travel" ? "#A8C4E0" : "#B09880" }}>© My Little Memory Box · mylittlememorybox.gr</p>
      </div>
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <div style={{ textAlign: "center", marginBottom: "6mm" }}>
      <h2 style={{ fontSize: "16pt", color: accentColor, fontFamily: "Georgia, serif", fontWeight: "normal" }}>{title}</h2>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "3mm", marginTop: "2mm" }}>
        <div style={{ width: "15mm", height: "1px", backgroundColor: accentColor, opacity: 0.3 }} />
        <span style={{ color: accentColor, fontSize: "8pt" }}>✦</span>
        <div style={{ width: "15mm", height: "1px", backgroundColor: accentColor, opacity: 0.3 }} />
      </div>
    </div>
  );

  const Field = ({ label, value }: { label: string; value: string }) => (
    value ? (
      <div style={{ marginBottom: "5mm" }}>
        <p style={{ fontSize: "7pt", color: accentColor, marginBottom: "1mm", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</p>
        <p style={{ fontSize: "10pt", color: templateId === "travel" ? "#0D2B4A" : "#5C3820", borderBottom: `1px dotted ${templateId === "travel" ? "#A8C4E0" : "#C4A882"}`, paddingBottom: "1mm", lineHeight: "1.6" }}>{value}</p>
      </div>
    ) : null
  );

  const Photo = ({ src }: { src: string }) => (
    src ? (
      <div style={{ textAlign: "center", marginBottom: "5mm" }}>
        <img src={src} alt="Memory" crossOrigin="anonymous"
          style={{ width: "100mm", height: "70mm", objectFit: "contain", backgroundColor: lightColor, borderRadius: "4mm", border: "3px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
      </div>
    ) : null
  );

  const PhotoGrid = ({ p1, p2 }: { p1: string; p2?: string }) => (
    (p1 || p2) ? (
      <div style={{ display: "flex", gap: "4mm", marginBottom: "5mm", justifyContent: "center" }}>
        {p1 && <img src={p1} alt="Memory" crossOrigin="anonymous"
          style={{ width: p2 ? "75mm" : "120mm", height: "60mm", objectFit: "contain", backgroundColor: lightColor, borderRadius: "4mm", border: "3px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />}
        {p2 && <img src={p2} alt="Memory" crossOrigin="anonymous"
          style={{ width: "75mm", height: "60mm", objectFit: "contain", backgroundColor: lightColor, borderRadius: "4mm", border: "3px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />}
      </div>
    ) : null
  );

  const PassportStampPDF = ({ country, city, date, color }: { country: string; city: string; date: string; color: string }) => (
    <div style={{ display: "inline-block", marginBottom: "4mm" }}>
      <svg width="80" height="80" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="72" fill="none" stroke={color} strokeWidth="3" strokeDasharray="4 2" />
        <circle cx="80" cy="80" r="60" fill="none" stroke={color} strokeWidth="1.5" />
        <path id={`pdf-top-${city}`} d="M 20,80 A 60,60 0 0,1 140,80" fill="none" />
        <text fontSize="11" fill={color} fontFamily="Georgia, serif" letterSpacing="3">
          <textPath href={`#pdf-top-${city}`} startOffset="50%" textAnchor="middle">{country.toUpperCase()}</textPath>
        </text>
        <path id={`pdf-bot-${city}`} d="M 20,80 A 60,60 0 0,0 140,80" fill="none" />
        <text fontSize="9" fill={color} fontFamily="Georgia, serif" letterSpacing="2">
          <textPath href={`#pdf-bot-${city}`} startOffset="50%" textAnchor="middle">VISITED</textPath>
        </text>
        <text x="80" y="68" textAnchor="middle" fontSize="22" fill={color}>✈</text>
        <text x="80" y="87" textAnchor="middle" fontSize="11" fill={color} fontFamily="Georgia, serif" fontWeight="bold">{city.toUpperCase()}</text>
        <line x1="50" y1="93" x2="110" y2="93" stroke={color} strokeWidth="1" />
        <text x="80" y="106" textAnchor="middle" fontSize="10" fill={color} fontFamily="Georgia, serif">{date}</text>
      </svg>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
      <p style={{ color: accentColor, fontFamily: "Georgia, serif" }}>Φόρτωση...</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><img src="/logo.png" alt="Logo" className="w-16 h-auto" /></Link>
          <Link href="/dashboard" className="text-xs uppercase tracking-widest" style={{ color: accentColor }}>← Dashboard</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 text-center">
        <div className="text-6xl mb-4">
          {templateId === "first-years" ? "🍼" : templateId === "me-and-you" ? "💑" : templateId === "our-wedding" ? "💍" : "✈️"}
        </div>
        <h1 className="text-3xl font-serif mb-2" style={{ color: accentColor }}>
          {templateId === "first-years" ? "Τα Πρώτα Χρόνια" :
           templateId === "me-and-you" ? "Εγώ & Εσύ" :
           templateId === "our-wedding" ? "Ο Γάμος Μας" : "Travel Memory Box"}
        </h1>
        <p className="font-light mb-8" style={{ color: templateId === "travel" ? "#A8C4E0" : "#B09880" }}>
          Κατεβάστε το Memory Box σας σε μορφή PDF
        </p>

        <button onClick={handleDownload} disabled={generating}
          className="inline-block px-10 py-4 text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all disabled:opacity-50 mb-4"
          style={{ backgroundColor: accentColor }}
        >
          {generating ? `Δημιουργία PDF... ${progress}%` : "⬇️ Κατέβασε το PDF"}
        </button>

        {generating && (
          <div className="w-full max-w-xs mx-auto rounded-full h-2 mb-8" style={{ backgroundColor: lightColor }}>
            <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: accentColor }} />
          </div>
        )}

        <p className="text-xs font-light" style={{ color: templateId === "travel" ? "#A8C4E0" : "#B09880" }}>
          Η δημιουργία PDF μπορεί να πάρει 1-2 λεπτά ανάλογα με τις φωτογραφίες
        </p>
      </div>

      {/* PDF Content */}
      <div ref={contentRef} style={{ position: "absolute", left: "-9999px", top: 0 }}>

        {/* COVER */}
        <PageWrapper>
          <div style={{ textAlign: "center", padding: "15mm 0" }}>
            <h1 style={{ fontSize: "26pt", color: accentColor, fontFamily: "Georgia, serif", fontWeight: "normal", marginBottom: "4mm" }}>
              {templateId === "first-years" ? "Τα Πρώτα Χρόνια" :
               templateId === "me-and-you" ? "Εγώ & Εσύ" :
               templateId === "our-wedding" ? "Ο Γάμος Μας" : "Travel Memory Box"}
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "3mm", margin: "4mm 0" }}>
              <div style={{ width: "20mm", height: "1px", backgroundColor: accentColor }} />
              <span style={{ color: accentColor, fontSize: "14pt" }}>
                {templateId === "first-years" ? "🍼" : templateId === "me-and-you" ? "💑" : templateId === "our-wedding" ? "💍" : "✈️"}
              </span>
              <div style={{ width: "20mm", height: "1px", backgroundColor: accentColor }} />
            </div>
            {templateId === "travel" && (
              <div>
                <p style={{ fontSize: "18pt", color: accentColor, fontStyle: "italic" }}>{get("cover", "name")}</p>
                <p style={{ fontSize: "11pt", color: "#A8C4E0", marginTop: "2mm" }}>{get("cover", "year")}</p>
                <div style={{ display: "flex", gap: "4mm", justifyContent: "center", marginTop: "8mm", opacity: 0.6 }}>
                  {[1, 2, 3].map((i) => {
                    const tripData = data[`trip_${i}`];
                    if (!tripData?.country) return null;
                    return (
                      <PassportStampPDF key={i} country={tripData.country} city={tripData.city || ""} date={tripData.date || ""} color={STAMP_COLORS[i - 1]} />
                    );
                  })}
                </div>
              </div>
            )}
            {templateId === "first-years" && (
              <p style={{ fontSize: "20pt", color: accentColor, fontStyle: "italic" }}>{get("cover", "child_name")}</p>
            )}
            {templateId === "me-and-you" && (
              <div>
                <p style={{ fontSize: "18pt", color: accentColor, fontStyle: "italic" }}>{get("cover", "his_name")} & {get("cover", "her_name")}</p>
                <p style={{ fontSize: "11pt", color: "#B09880", marginTop: "2mm" }}>{get("cover", "start_date")}</p>
              </div>
            )}
            {templateId === "our-wedding" && (
              <div>
                <p style={{ fontSize: "18pt", color: accentColor, fontStyle: "italic" }}>{get("cover", "groom_name")} & {get("cover", "bride_name")}</p>
                <p style={{ fontSize: "11pt", color: "#B09880", marginTop: "2mm" }}>{get("cover", "wedding_date")}</p>
                <p style={{ fontSize: "11pt", color: "#B09880" }}>{get("cover", "wedding_location")}</p>
              </div>
            )}
            {photo("cover", "cover_photo") && (
              <div style={{ marginTop: "8mm" }}>
                <img src={photo("cover", "cover_photo")} crossOrigin="anonymous"
                  style={{ width: "110mm", height: "110mm", objectFit: "contain", backgroundColor: lightColor, borderRadius: "5mm", border: "4px solid white", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }} />
              </div>
            )}
          </div>
        </PageWrapper>

        {/* TRAVEL PAGES */}
        {templateId === "travel" && (
          <>
            <PageWrapper>
              <SectionTitle title="✈ Ταξιδιωτικό Προφίλ" />
              <Field label="Το πρώτο μου ταξίδι" value={get("profile", "first_trip")} />
              <Field label="Χώρες που έχω επισκεφτεί" value={get("profile", "countries_count")} />
              <Field label="Αγαπημένος προορισμός" value={get("profile", "favorite_destination")} />
              <Field label="Ονειρεμένος προορισμός" value={get("profile", "dream_destination")} />
              <Field label="Η φιλοσοφία μου" value={get("profile", "travel_motto")} />
            </PageWrapper>

            {Array.from({ length: 20 }, (_, i) => i + 1).map((tripNum) => {
              const pk = `trip_${tripNum}`;
              const country = get(pk, "country");
              const city = get(pk, "city");
              if (!country && !city) return null;
              const stampColor = STAMP_COLORS[(tripNum - 1) % STAMP_COLORS.length];
              return (
                <PageWrapper key={pk}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6mm" }}>
                    <SectionTitle title={`✈ Ταξίδι #${tripNum}`} />
                    <PassportStampPDF country={country || `Ταξίδι ${tripNum}`} city={city || ""} date={get(pk, "date")} color={stampColor} />
                  </div>
                  <div style={{ display: "flex", gap: "4mm", marginBottom: "4mm" }}>
                    <div style={{ flex: 1 }}><Field label="Χώρα" value={country} /></div>
                    <div style={{ flex: 1 }}><Field label="Πόλη" value={city} /></div>
                    <div style={{ flex: 1 }}><Field label="Ημερομηνία" value={get(pk, "date")} /></div>
                    <div style={{ flex: 1 }}><Field label="Με ποιον" value={get(pk, "with_who")} /></div>
                  </div>
                  <Field label="Μέσο μεταφοράς" value={get(pk, "transport")} />
                  <PhotoGrid p1={photo(pk, "photo1")} p2={photo(pk, "photo2")} />
                  <div style={{ backgroundColor: lightColor, borderRadius: "4mm", padding: "4mm", marginBottom: "4mm" }}>
                    <p style={{ fontSize: "8pt", color: accentColor, marginBottom: "2mm" }}>🏨 Διαμονή</p>
                    <Field label="Που μείναμε" value={get(pk, "accommodation")} />
                    <Field label="Αγαπημένο σημείο" value={get(pk, "accommodation_highlight")} />
                  </div>
                  <div style={{ backgroundColor: lightColor, borderRadius: "4mm", padding: "4mm", marginBottom: "4mm" }}>
                    <p style={{ fontSize: "8pt", color: accentColor, marginBottom: "2mm" }}>🍽️ Γεύσεις</p>
                    <Field label="Αγαπημένο φαγητό" value={get(pk, "food")} />
                    <Field label="Αγαπημένο εστιατόριο" value={get(pk, "restaurant")} />
                  </div>
                  <Field label="⭐ Καλύτερη στιγμή" value={get(pk, "best_moment")} />
                  <Field label="😮 Έκπληξη" value={get(pk, "surprise")} />
                  <Field label="😄 Αστεία στιγμή" value={get(pk, "funny")} />
                  <Field label="✅ Θα ξανάκανα" value={get(pk, "would_do_again")} />
                  <Field label="❌ Δεν θα ξανάκανα" value={get(pk, "would_not_do")} />
                  <PhotoGrid p1={photo(pk, "photo3")} p2={photo(pk, "photo4")} />
                  <div style={{ backgroundColor: lightColor, borderRadius: "4mm", padding: "4mm" }}>
                    <p style={{ fontSize: "8pt", color: accentColor, marginBottom: "2mm" }}>💭 Σκέψεις</p>
                    <Field label="Τι κράτησα" value={get(pk, "takeaway")} />
                    <Field label="Θα επέστρεφα;" value={get(pk, "return")} />
                    <Field label="Βαθμολογία" value={get(pk, "rating")} />
                  </div>
                </PageWrapper>
              );
            })}

            <PageWrapper>
              <SectionTitle title="🌟 Ταξιδιωτικά Όνειρα" />
              <Field label="Bucket list" value={get("dreams", "bucket_list")} />
              <Field label="Επόμενο ταξίδι" value={get("dreams", "next_trip")} />
              <Field label="Ταξίδι ονείρων" value={get("dreams", "dream_trip")} />
              <Field label="Ταξιδιωτικός σύντροφος" value={get("dreams", "travel_partner")} />
              <Field label="Το πιο σημαντικό που έμαθα" value={get("dreams", "lesson")} />
            </PageWrapper>
          </>
        )}

        {/* FIRST YEARS */}
        {templateId === "first-years" && (
          <>
            <PageWrapper>
              <SectionTitle title="Οι πρώτες σου στιγμές" />
              <PhotoGrid p1={photo("first_moments", "photo1")} p2={photo("first_moments", "photo2")} />
              <Field label="Η πρώτη φορά που σε κράτησα" value={get("first_moments", "first_hold")} />
              <div style={{ display: "flex", gap: "4mm" }}>
                <div style={{ flex: 1 }}><Field label="Ζύγιζες" value={get("first_moments", "weight")} /></div>
                <div style={{ flex: 1 }}><Field label="Ύψος" value={get("first_moments", "height")} /></div>
              </div>
              <Field label="Η πρώτη φορά που χαμογέλασες" value={get("first_moments", "first_smile")} />
              <Field label="Οι πρώτες στιγμές στο σπίτι μας" value={get("first_moments", "first_home")} />
            </PageWrapper>
            <PageWrapper>
              <SectionTitle title="Ο κόσμος σου" />
              <Field label="Οι γονείς σου" value={get("your_world", "parents")} />
              <Field label="Τα αδέρφια σου" value={get("your_world", "siblings")} />
              <Field label="Γιαγιάδες & Παππούδες" value={get("your_world", "grandparents")} />
              <Field label="Νονός/α" value={get("your_world", "godparents")} />
              <Field label="Τι αξίες θέλουμε να σου δώσουμε" value={get("your_world", "values")} />
            </PageWrapper>
            <PageWrapper>
              <SectionTitle title="Οι πρώτες σου κατακτήσεις" />
              <PhotoGrid p1={photo("first_achievements", "photo1")} p2={photo("first_achievements", "photo2")} />
              <Field label="Το πρώτο σου δοντάκι" value={get("first_achievements", "first_tooth")} />
              <Field label="Η πρώτη φορά που μπουσούλησες" value={get("first_achievements", "first_crawl")} />
              <Field label="Η πρώτη φορά που σηκώθηκες όρθια" value={get("first_achievements", "first_stand")} />
              <Field label="Η πρώτη φορά που έτρεξες" value={get("first_achievements", "first_run")} />
            </PageWrapper>
            <PageWrapper>
              <SectionTitle title="Στιγμές που με έκανες να νιώθω τα πάντα" />
              <PhotoGrid p1={photo("moments", "photo1")} p2={photo("moments", "photo2")} />
              <Field label="Η στιγμή που ένιωσα περήφανη" value={get("moments", "proud")} />
              <Field label="Κάτι μικρό που για μένα ήταν τεράστιο" value={get("moments", "small_big")} />
              <Field label="Μια αγκαλιά που δεν ήθελα να τελειώσει" value={get("moments", "hug")} />
              <Field label="Η στιγμή που σκέφτηκα αυτό είναι η ευτυχία" value={get("moments", "happiness")} />
            </PageWrapper>
            <PageWrapper>
              <SectionTitle title="Οι μέρες που δεν ήταν εύκολες" />
              <Photo src={photo("hard_days", "photo1")} />
              <Field label="Μια μέρα που ένιωσα ότι δεν τα κατάφερνα" value={get("hard_days", "hard_day")} />
              <Field label="Μια στιγμή που λύγισα" value={get("hard_days", "broke_down")} />
              <Field label="Και παρ' όλα αυτά συνέχισα γιατί" value={get("hard_days", "continued")} />
            </PageWrapper>
            <PageWrapper>
              <SectionTitle title="Τα γενέθλιά σου 🎉" />
              {[1, 2, 3].map((year) => (
                <div key={year} style={{ backgroundColor: lightColor, borderRadius: "4mm", padding: "4mm", marginBottom: "4mm" }}>
                  <p style={{ fontSize: "11pt", color: accentColor, marginBottom: "2mm" }}>{year} ετών 🎂</p>
                  <Field label="Έσβησες την τούρτα με" value={get("birthdays", `year${year}_with`)} />
                  <Field label="Η ευχή μου για σένα" value={get("birthdays", `year${year}_wish`)} />
                </div>
              ))}
            </PageWrapper>
            <PageWrapper>
              <SectionTitle title="Η πρώτη σου μέρα στο σχολείο" />
              <PhotoGrid p1={photo("school", "photo1")} p2={photo("school", "photo2")} />
              <Field label="Και εγώ ένιωσα" value={get("school", "i_felt")} />
              <Field label="Εσύ έδειχνες" value={get("school", "you_looked")} />
              <Field label="Η σκέψη που δεν έφυγε" value={get("school", "thought")} />
              <Field label="Όταν σε ξαναείδα" value={get("school", "saw_again")} />
            </PageWrapper>
            <PageWrapper bg="#F2E8DE">
              <SectionTitle title="Ένα γράμμα για σένα..." />
              <Photo src={photo("letter", "photo1")} />
              <p style={{ fontSize: "11pt", color: "#5C3820", lineHeight: "1.8", fontStyle: "italic", whiteSpace: "pre-wrap" }}>
                {get("letter", "letter")}
              </p>
            </PageWrapper>
          </>
        )}

        {/* ME AND YOU */}
        {templateId === "me-and-you" && (
          <>
            <PageWrapper>
              <SectionTitle title="Πώς ξεκίνησε όλο αυτό" />
              <PhotoGrid p1={photo("how_we_met", "photo1")} p2={photo("how_we_met", "photo2")} />
              <Field label="Πώς γνωριστήκαμε" value={get("how_we_met", "how_met")} />
              <Field label="Η πρώτη μου εντύπωση" value={get("how_we_met", "first_impression")} />
              <Field label="Η πρώτη μας συνάντηση" value={get("how_we_met", "first_date")} />
              <Field label="Η στιγμή που κατάλαβα" value={get("how_we_met", "realized")} />
            </PageWrapper>
            <PageWrapper>
              <SectionTitle title="Αυτός 💙" />
              <Photo src={photo("him", "photo1")} />
              <Field label="Το όνομά του" value={get("him", "name")} />
              <Field label="Αυτό που με τρέλανε" value={get("him", "crazy_about")} />
              <Field label="Αυτό που με κάνει να γελάω" value={get("him", "makes_laugh")} />
              <Field label="Αυτό που αγαπώ περισσότερο" value={get("him", "love_most")} />
            </PageWrapper>
            <PageWrapper>
              <SectionTitle title="Αυτή 🌸" />
              <Photo src={photo("her", "photo1")} />
              <Field label="Το όνομά της" value={get("her", "name")} />
              <Field label="Αυτό που με τρέλανε" value={get("her", "crazy_about")} />
              <Field label="Αυτό που με κάνει να γελάω" value={get("her", "makes_laugh")} />
              <Field label="Αυτό που αγαπώ περισσότερο" value={get("her", "love_most")} />
            </PageWrapper>
            <PageWrapper>
              <SectionTitle title="Οι στιγμές μας" />
              <PhotoGrid p1={photo("our_moments", "photo1")} p2={photo("our_moments", "photo2")} />
              <Field label="Η αγαπημένη μας στιγμή" value={get("our_moments", "favorite_moment")} />
              <Field label="Κάτι μικρό που ήταν τεράστιο" value={get("our_moments", "small_big")} />
              <Field label="Η στιγμή που σκέφτηκα αυτό είναι αγάπη" value={get("our_moments", "this_is_love")} />
            </PageWrapper>
            <PageWrapper>
              <SectionTitle title="Τα ταξίδια μας ✈️" />
              <PhotoGrid p1={photo("our_trips", "photo1")} p2={photo("our_trips", "photo2")} />
              <Field label="Το πρώτο μας ταξίδι" value={get("our_trips", "first_trip")} />
              <Field label="Το αγαπημένο μας μέρος" value={get("our_trips", "favorite_place")} />
              <Field label="Το ταξίδι που θέλουμε να κάνουμε" value={get("our_trips", "dream_trip")} />
            </PageWrapper>
            <PageWrapper bg="#F2E8DE">
              <SectionTitle title="Ένα γράμμα για σένα..." />
              <Photo src={photo("letter", "photo1")} />
              <p style={{ fontSize: "11pt", color: "#5C3820", lineHeight: "1.8", fontStyle: "italic", whiteSpace: "pre-wrap" }}>
                {get("letter", "letter")}
              </p>
            </PageWrapper>
          </>
        )}

        {/* WEDDING */}
        {templateId === "our-wedding" && (
          <>
            <PageWrapper>
              <SectionTitle title="Η πρόταση γάμου 💍" />
              <PhotoGrid p1={photo("proposal", "photo1")} p2={photo("proposal", "photo2")} />
              <Field label="Πού έγινε η πρόταση" value={get("proposal", "where")} />
              <Field label="Τα λόγια που είπες" value={get("proposal", "words")} />
              <Field label="Η πρώτη μου αντίδραση" value={get("proposal", "reaction")} />
            </PageWrapper>
            <PageWrapper>
              <SectionTitle title="Η στιγμή που σε είδα" />
              <PhotoGrid p1={photo("saw_you", "photo1")} p2={photo("saw_you", "photo2")} />
              <Field label="Η πρώτη μου σκέψη" value={get("saw_you", "first_thought")} />
              <Field label="Τι ένιωσα εκείνη τη στιγμή" value={get("saw_you", "feeling")} />
            </PageWrapper>
            <PageWrapper>
              <SectionTitle title="Η τελετή" />
              <PhotoGrid p1={photo("ceremony", "photo1")} p2={photo("ceremony", "photo2")} />
              <Field label="Τα λόγια που είπαμε" value={get("ceremony", "words")} />
              <Field label="Αυτό που σκέφτηκα όταν είπα ναι" value={get("ceremony", "said_yes")} />
              <Field label="Μια λεπτομέρεια που θυμάμαι έντονα" value={get("ceremony", "detail")} />
            </PageWrapper>
            <PageWrapper>
              <SectionTitle title="Τα συναισθήματα της μέρας" />
              <Photo src={photo("feelings", "photo1")} />
              <Field label="Η κυρίαρχη αίσθηση" value={get("feelings", "main_feeling")} />
              <Field label="Η στιγμή που δάκρυσα" value={get("feelings", "cried")} />
              <Field label="Αυτό που ήθελα να κρατήσω για πάντα" value={get("feelings", "keep_forever")} />
            </PageWrapper>
            <PageWrapper>
              <SectionTitle title="Το γλέντι 🎉" />
              <PhotoGrid p1={photo("party", "photo1")} p2={photo("party", "photo2")} />
              <div style={{ backgroundColor: lightColor, borderRadius: "4mm", padding: "4mm", marginBottom: "4mm" }}>
                <p style={{ fontSize: "8pt", color: accentColor, marginBottom: "2mm" }}>🎵 Τραγούδι πρώτου χορού</p>
                <Field label="" value={get("party", "first_dance_song")} />
              </div>
              <Field label="Η στιγμή που χορέψαμε μαζί" value={get("party", "danced_together")} />
            </PageWrapper>
            <PageWrapper bg="#F2E8DE">
              <SectionTitle title="Ένα γράμμα για σένα..." />
              <Photo src={photo("letter", "photo1")} />
              <p style={{ fontSize: "11pt", color: "#5C3820", lineHeight: "1.8", fontStyle: "italic", whiteSpace: "pre-wrap" }}>
                {get("letter", "letter")}
              </p>
            </PageWrapper>
          </>
        )}

      </div>
    </div>
  );
}
