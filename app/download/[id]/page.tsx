"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DownloadPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<Record<string, Record<string, string>>>({});
  const [photos, setPhotos] = useState<Record<string, Record<string, string>>>({});
  const [templateId, setTemplateId] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: box } = await supabase
      .from("memory_boxes")
      .select("*")
      .eq("id", params.id)
      .single();

    if (box) setTemplateId(box.template_id);

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
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#F9F2EC",
          logging: false,
          imageTimeout: 15000,
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
                       "o-gamos-mas";

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

  const PageWrapper = ({ children, bgColor = "#F9F2EC" }: {
    children: React.ReactNode;
    bgColor?: string
  }) => (
    <div
      className="pdf-page"
      style={{
        backgroundColor: bgColor,
        width: "210mm",
        minHeight: "297mm",
        padding: "20mm",
        fontFamily: "Georgia, serif",
        position: "relative",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "8mm", borderBottom: "1px solid rgba(196,168,130,0.3)", paddingBottom: "4mm" }}>
        <img src="/logo.png" alt="Logo" style={{ width: "35mm", height: "auto", margin: "0 auto" }} />
      </div>
      {children}
      <div style={{ position: "absolute", bottom: "8mm", left: "20mm", right: "20mm", textAlign: "center", borderTop: "1px solid rgba(196,168,130,0.3)", paddingTop: "3mm" }}>
        <p style={{ fontSize: "7pt", color: "#B09880" }}>© My Little Memory Box · mylittlememorybox.gr</p>
      </div>
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <div style={{ textAlign: "center", marginBottom: "6mm" }}>
      <h2 style={{ fontSize: "16pt", color: "#8B5E3C", fontFamily: "Georgia, serif", fontWeight: "normal" }}>
        {title}
      </h2>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "3mm", marginTop: "2mm" }}>
        <div style={{ width: "15mm", height: "1px", backgroundColor: "#C4A882", opacity: 0.4 }} />
        <span style={{ color: "#C4A882", fontSize: "8pt" }}>✦</span>
        <div style={{ width: "15mm", height: "1px", backgroundColor: "#C4A882", opacity: 0.4 }} />
      </div>
    </div>
  );

  const Field = ({ label, value }: { label: string; value: string }) => (
    value ? (
      <div style={{ marginBottom: "5mm" }}>
        <p style={{ fontSize: "7pt", color: "#8B5E3C", marginBottom: "1mm", textTransform: "uppercase", letterSpacing: "1px" }}>
          {label}
        </p>
        <p style={{ fontSize: "10pt", color: "#5C3820", borderBottom: "1px dotted #C4A882", paddingBottom: "1mm", lineHeight: "1.6" }}>
          {value}
        </p>
      </div>
    ) : null
  );

  const Photo = ({ src }: { src: string }) => (
    src ? (
      <div style={{ textAlign: "center", marginBottom: "5mm" }}>
        <img
          src={src}
          alt="Memory"
          crossOrigin="anonymous"
          style={{
            width: "100mm",
            height: "70mm",
            objectFit: "contain",
            backgroundColor: "#F2E8DE",
            borderRadius: "4mm",
            border: "3px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
          }}
        />
      </div>
    ) : null
  );

  const PhotoGrid = ({ p1, p2 }: { p1: string; p2?: string }) => (
    (p1 || p2) ? (
      <div style={{ display: "flex", gap: "4mm", marginBottom: "5mm", justifyContent: "center" }}>
        {p1 && (
          <img
            src={p1}
            alt="Memory"
            crossOrigin="anonymous"
            style={{
              width: p2 ? "75mm" : "120mm",
              height: "60mm",
              objectFit: "contain",
              backgroundColor: "#F2E8DE",
              borderRadius: "4mm",
              border: "3px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}
          />
        )}
        {p2 && (
          <img
            src={p2}
            alt="Memory"
            crossOrigin="anonymous"
            style={{
              width: "75mm",
              height: "60mm",
              objectFit: "contain",
              backgroundColor: "#F2E8DE",
              borderRadius: "4mm",
              border: "3px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}
          />
        )}
      </div>
    ) : null
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center">
        <p className="text-[#B09880] font-light">Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F2EC]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><img src="/logo.png" alt="Logo" className="w-16 h-auto" /></Link>
          <Link href="/dashboard" className="text-xs text-[#8B5E3C] uppercase tracking-widest">
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 text-center">
        <div className="text-6xl mb-4">
          {templateId === "first-years" ? "🍼" : templateId === "me-and-you" ? "💑" : "💍"}
        </div>
        <h1 className="text-3xl font-serif text-[#8B5E3C] mb-2">
          {templateId === "first-years" ? "Τα Πρώτα Χρόνια" :
           templateId === "me-and-you" ? "Εγώ & Εσύ" : "Ο Γάμος Μας"}
        </h1>
        <p className="text-[#B09880] font-light mb-8">
          Κατεβάστε το Memory Box σας σε μορφή PDF
        </p>

        <button
          onClick={handleDownload}
          disabled={generating}
          className="inline-block px-10 py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all disabled:opacity-50 mb-4"
        >
          {generating ? `Δημιουργία PDF... ${progress}%` : "⬇️ Κατέβασε το PDF"}
        </button>

        {generating && (
          <div className="w-full max-w-xs mx-auto bg-[#F2E8DE] rounded-full h-2 mb-8">
            <div
              className="bg-[#C49090] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <p className="text-xs text-[#B09880] font-light">
          Η δημιουργία PDF μπορεί να πάρει 1-2 λεπτά ανάλογα με τις φωτογραφίες
        </p>
      </div>

      {/* PDF Content */}
      <div ref={contentRef} style={{ position: "absolute", left: "-9999px", top: 0 }}>

        {/* COVER */}
        <PageWrapper>
          <div style={{ textAlign: "center", padding: "15mm 0" }}>
            <h1 style={{ fontSize: "26pt", color: "#8B5E3C", fontFamily: "Georgia, serif", fontWeight: "normal", marginBottom: "4mm" }}>
              {templateId === "first-years" ? "Τα Πρώτα Χρόνια" :
               templateId === "me-and-you" ? "Εγώ & Εσύ" : "Ο Γάμος Μας"}
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "3mm", margin: "4mm 0" }}>
              <div style={{ width: "20mm", height: "1px", backgroundColor: "#C4A882" }} />
              <span style={{ color: "#C4A882", fontSize: "14pt" }}>
                {templateId === "first-years" ? "🍼" : templateId === "me-and-you" ? "💑" : "💍"}
              </span>
              <div style={{ width: "20mm", height: "1px", backgroundColor: "#C4A882" }} />
            </div>
            {templateId === "first-years" && (
              <p style={{ fontSize: "20pt", color: "#8B5E3C", fontStyle: "italic" }}>
                {get("cover", "child_name")}
              </p>
            )}
            {templateId === "me-and-you" && (
              <div>
                <p style={{ fontSize: "18pt", color: "#8B5E3C", fontStyle: "italic" }}>
                  {get("cover", "his_name")} & {get("cover", "her_name")}
                </p>
                <p style={{ fontSize: "11pt", color: "#B09880", marginTop: "2mm" }}>
                  {get("cover", "start_date")}
                </p>
              </div>
            )}
            {templateId === "our-wedding" && (
              <div>
                <p style={{ fontSize: "18pt", color: "#8B5E3C", fontStyle: "italic" }}>
                  {get("cover", "groom_name")} & {get("cover", "bride_name")}
                </p>
                <p style={{ fontSize: "11pt", color: "#B09880", marginTop: "2mm" }}>
                  {get("cover", "wedding_date")}
                </p>
                <p style={{ fontSize: "11pt", color: "#B09880" }}>
                  {get("cover", "wedding_location")}
                </p>
              </div>
            )}
            {photo("cover", "cover_photo") && (
              <div style={{ marginTop: "8mm" }}>
                <img
                  src={photo("cover", "cover_photo")}
                  crossOrigin="anonymous"
                  style={{
                    width: "110mm",
                    height: "110mm",
                    objectFit: "contain",
                    backgroundColor: "#F2E8DE",
                    borderRadius: "5mm",
                    border: "4px solid white",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                  }}
                />
              </div>
            )}
          </div>
        </PageWrapper>

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
              <Field label="Οι θείοι σου" value={get("your_world", "uncles")} />
              <Field label="Γιαγιάδες & Παππούδες" value={get("your_world", "grandparents")} />
              <Field label="Νονός/α" value={get("your_world", "godparents")} />
              <Field label="Φίλοι που έγιναν οικογένεια" value={get("your_world", "friends_family")} />
              <Field label="Τι αξίες θέλουμε να σου δώσουμε" value={get("your_world", "values")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Οι πρώτες σου κατακτήσεις" />
              <PhotoGrid p1={photo("first_achievements", "photo1")} p2={photo("first_achievements", "photo2")} />
              <Field label="Το πρώτο σου δοντάκι" value={get("first_achievements", "first_tooth")} />
              <Field label="Η πρώτη φορά που μπουσούλησες" value={get("first_achievements", "first_crawl")} />
              <Field label="Η πρώτη φορά που σηκώθηκες όρθια" value={get("first_achievements", "first_stand")} />
              <Field label="Η πρώτη φορά που έτρεξες προς το μέρος μου" value={get("first_achievements", "first_run")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Τα πρώτα σου βήματα προς τον κόσμο" />
              <Photo src={photo("first_steps", "photo1")} />
              <Field label="Η πρώτη φορά που έπαιξες με άλλα παιδάκια" value={get("first_steps", "first_play")} />
              <Field label="Η πρώτη σου φιλία" value={get("first_steps", "first_friend")} />
              <Field label="Κάτι που σε ενθουσίασε πολύ" value={get("first_steps", "excited")} />
              <Field label="Κάτι που σε φόβισε" value={get("first_steps", "scared")} />
              <Field label="Η στιγμή που κατάλαβα ότι μεγαλώνεις" value={get("first_steps", "growing_up")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Στιγμές που με έκανες να νιώθω τα πάντα" />
              <PhotoGrid p1={photo("moments", "photo1")} p2={photo("moments", "photo2")} />
              <Field label="Η στιγμή που ένιωσα περήφανη για σένα" value={get("moments", "proud")} />
              <Field label="Κάτι μικρό που για μένα ήταν τεράστιο" value={get("moments", "small_big")} />
              <Field label="Μια αγκαλιά που δεν ήθελα να τελειώσει" value={get("moments", "hug")} />
              <Field label="Η στιγμή που σκέφτηκα αυτό είναι η ευτυχία" value={get("moments", "happiness")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Οι μέρες που δεν ήταν εύκολες" />
              <Photo src={photo("hard_days", "photo1")} />
              <Field label="Μια μέρα που ένιωσα ότι δεν τα κατάφερνα" value={get("hard_days", "hard_day")} />
              <Field label="Μια στιγμή που λύγισα" value={get("hard_days", "broke_down")} />
              <Field label="Κάτι που με δυσκόλεψε" value={get("hard_days", "difficult")} />
              <Field label="Και παρ' όλα αυτά συνέχισα γιατί" value={get("hard_days", "continued")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Η προσωπικότητά σου" />
              <Photo src={photo("personality", "photo1")} />
              <Field label="Αυτό που σε κάνει να γελάς" value={get("personality", "laugh")} />
              <Field label="Αυτό που σε θυμώνει" value={get("personality", "angry")} />
              <Field label="Αυτό που σε ηρεμεί" value={get("personality", "calm")} />
              <Field label="Το πιο όμορφο κομμάτι του χαρακτήρα σου" value={get("personality", "best_trait")} />
              <Field label="Κάτι που σε κάνει μοναδικό πλάσμα" value={get("personality", "unique")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Τα γενέθλιά σου 🎉" />
              <Photo src={photo("birthdays", "photo1")} />
              {[1, 2, 3].map((year) => (
                <div key={year} style={{ backgroundColor: "white", borderRadius: "4mm", padding: "4mm", marginBottom: "4mm" }}>
                  <p style={{ fontSize: "11pt", color: "#8B5E3C", fontFamily: "Georgia, serif", marginBottom: "2mm" }}>
                    {year} ετών 🎂
                  </p>
                  <Field label="Έσβησες την τούρτα με" value={get("birthdays", `year${year}_with`)} />
                  <Field label="Η ευχή μου για σένα" value={get("birthdays", `year${year}_wish`)} />
                  <Photo src={photo("birthdays", `photo_year${year}`)} />
                </div>
              ))}
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Η πρώτη σου μέρα στο σχολείο" />
              <PhotoGrid p1={photo("school", "photo1")} p2={photo("school", "photo2")} />
              <Field label="Και εγώ ένιωσα" value={get("school", "i_felt")} />
              <Field label="Εσύ έδειχνες" value={get("school", "you_looked")} />
              <Field label="Η στιγμή που σε άφησα" value={get("school", "left_you")} />
              <Field label="Η σκέψη που δεν έφυγε από το μυαλό μου" value={get("school", "thought")} />
              <Field label="Όταν σε ξαναείδα" value={get("school", "saw_again")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Για σένα όταν μεγαλώσεις..." />
              <Photo src={photo("when_you_grow", "photo1")} />
              <Field label="Αν μπορούσα να σου πω κάτι για τη ζωή..." value={get("when_you_grow", "life")} />
              <Field label="Αν μπορούσα να σε προστατέψω από κάτι..." value={get("when_you_grow", "protect")} />
              <Field label="Αν μπορούσα να σου αφήσω μόνο μια σκέψη..." value={get("when_you_grow", "thought")} />
            </PageWrapper>

            <PageWrapper bgColor="#F2E8DE">
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
              <Field label="Το πιο αστείο χαρακτηριστικό" value={get("him", "funny_trait")} />
              <Field label="Το ταλέντο του" value={get("him", "talent")} />
              <Field label="Αυτό που αγαπώ περισσότερο" value={get("him", "love_most")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Αυτή 🌸" />
              <Photo src={photo("her", "photo1")} />
              <Field label="Το όνομά της" value={get("her", "name")} />
              <Field label="Αυτό που με τρέλανε" value={get("her", "crazy_about")} />
              <Field label="Αυτό που με κάνει να γελάω" value={get("her", "makes_laugh")} />
              <Field label="Το πιο αστείο χαρακτηριστικό" value={get("her", "funny_trait")} />
              <Field label="Το ταλέντο της" value={get("her", "talent")} />
              <Field label="Αυτό που αγαπώ περισσότερο" value={get("her", "love_most")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Οι στιγμές μας" />
              <PhotoGrid p1={photo("our_moments", "photo1")} p2={photo("our_moments", "photo2")} />
              <Field label="Η αγαπημένη μας στιγμή" value={get("our_moments", "favorite_moment")} />
              <Field label="Μια στιγμή που δεν θα ξεχάσω" value={get("our_moments", "unforgettable")} />
              <Field label="Κάτι μικρό που ήταν τεράστιο" value={get("our_moments", "small_big")} />
              <Field label="Η στιγμή που σκέφτηκα αυτό είναι αγάπη" value={get("our_moments", "this_is_love")} />
              <div style={{ backgroundColor: "#F2E8DE", borderRadius: "4mm", padding: "4mm", marginTop: "3mm" }}>
                <p style={{ fontSize: "8pt", color: "#8B5E3C", marginBottom: "2mm" }}>🎵 Το αγαπημένο μας τραγούδι</p>
                <Field label="Τίτλος" value={get("our_moments", "song_title")} />
                <Field label="Γιατί είναι το τραγούδι μας" value={get("our_moments", "song_reason")} />
              </div>
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Τα ταξίδια μας ✈️" />
              <PhotoGrid p1={photo("our_trips", "photo1")} p2={photo("our_trips", "photo2")} />
              <Field label="Το πρώτο μας ταξίδι" value={get("our_trips", "first_trip")} />
              <Field label="Το αγαπημένο μας μέρος" value={get("our_trips", "favorite_place")} />
              <Field label="Μια αστεία στιγμή" value={get("our_trips", "funny_moment")} />
              <Field label="Το ταξίδι που θέλουμε να κάνουμε" value={get("our_trips", "dream_trip")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Οι δύσκολες μέρες" />
              <Photo src={photo("hard_days", "photo1")} />
              <Field label="Μια δύσκολη στιγμή" value={get("hard_days", "hard_moment")} />
              <Field label="Αυτό που μας έκανε πιο δυνατούς" value={get("hard_days", "stronger")} />
              <Field label="Η στιγμή που κατάλαβα ότι μπορώ να βασιστώ σε σένα" value={get("hard_days", "trust")} />
              <Field label="Συνεχίσαμε γιατί" value={get("hard_days", "continued")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Αυτό που αγαπώ σε σένα ❤️" />
              <PhotoGrid p1={photo("what_i_love", "photo1")} p2={photo("what_i_love", "photo2")} />
              <Field label="Τρία πράγματα που αγαπώ σε σένα" value={get("what_i_love", "three_things")} />
              <Field label="Αυτό που με κάνεις να νιώθω" value={get("what_i_love", "how_you_make_feel")} />
              <Field label="Κάτι που έμαθα από σένα" value={get("what_i_love", "learned")} />
              <Field label="Αυτό που με κάνει να σε επιλέγω κάθε μέρα" value={get("what_i_love", "choose_you")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Τα όνειρά μας 🌟" />
              <Photo src={photo("our_dreams", "photo1")} />
              <Field label="Ένα όνειρο που έχουμε μαζί" value={get("our_dreams", "dream")} />
              <Field label="Κάτι που θέλουμε να κάνουμε μαζί" value={get("our_dreams", "bucket_list")} />
              <Field label="Πού βλέπουμε τον εαυτό μας σε 10 χρόνια" value={get("our_dreams", "future")} />
              <Field label="Η υπόσχεση που δίνουμε ο ένας στον άλλον" value={get("our_dreams", "promise")} />
            </PageWrapper>

            <PageWrapper bgColor="#F2E8DE">
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
              <Field label="Πώς το σχεδίασες" value={get("proposal", "planned")} />
              <Field label="Τα λόγια που είπες" value={get("proposal", "words")} />
              <Field label="Η πρώτη μου αντίδραση" value={get("proposal", "reaction")} />
              <Field label="Ο πρώτος που το μοιραστήκαμε" value={get("proposal", "first_told")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Η μέρα πριν" />
              <PhotoGrid p1={photo("day_before", "photo1")} p2={photo("day_before", "photo2")} />
              <Field label="Τι ένιωθα το βράδυ πριν" value={get("day_before", "evening_feeling")} />
              <Field label="Τι σκεφτόμουν ξαπλωμένος/η" value={get("day_before", "thoughts")} />
              <Field label="Το τελευταίο μήνυμα που έστειλα" value={get("day_before", "last_message")} />
              <Field label="Πώς κοιμήθηκα" value={get("day_before", "sleep")} />
              <Field label="Το πρωινό της ημέρας" value={get("day_before", "morning")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Η στιγμή που σε είδα" />
              <PhotoGrid p1={photo("saw_you", "photo1")} p2={photo("saw_you", "photo2")} />
              <Field label="Η πρώτη μου σκέψη" value={get("saw_you", "first_thought")} />
              <Field label="Πώς ήσουν ντυμένος/η" value={get("saw_you", "outfit")} />
              <Field label="Αυτό που παρατήρησα πρώτα" value={get("saw_you", "noticed_first")} />
              <Field label="Τι ένιωσα εκείνη τη στιγμή" value={get("saw_you", "feeling")} />
              <Field label="Αν μπορούσα να σταματήσω τον χρόνο" value={get("saw_you", "freeze_time")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Η τελετή" />
              <PhotoGrid p1={photo("ceremony", "photo1")} p2={photo("ceremony", "photo2")} />
              <Field label="Η στιγμή που έδωσα τα χέρια μου" value={get("ceremony", "hands")} />
              <Field label="Τα λόγια που είπαμε" value={get("ceremony", "words")} />
              <Field label="Η στιγμή που φόρεσα το δαχτυλίδι" value={get("ceremony", "ring")} />
              <Field label="Αυτό που σκέφτηκα όταν είπα ναι" value={get("ceremony", "said_yes")} />
              <Field label="Μια λεπτομέρεια που θυμάμαι έντονα" value={get("ceremony", "detail")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Οι άνθρωποι της μέρας μας" />
              <PhotoGrid p1={photo("people", "photo1")} p2={photo("people", "photo2")} />
              <Field label="Αυτοί που ήταν εκεί για μας" value={get("people", "were_there")} />
              <Field label="Κάποιος που με συγκίνησε" value={get("people", "moved_me")} />
              <Field label="Ένα πρόσωπο που κοίταξα και χαμογέλασα" value={get("people", "smiled")} />
              <Field label="Κάποιος που έλειψε αλλά ήταν στην καρδιά μας" value={get("people", "missed")} />
              <Field label="Κουμπάρος/α" value={get("people", "godparents")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Τα συναισθήματα της μέρας" />
              <Photo src={photo("feelings", "photo1")} />
              <Field label="Η κυρίαρχη αίσθηση της ημέρας" value={get("feelings", "main_feeling")} />
              <Field label="Η στιγμή που δάκρυσα" value={get("feelings", "cried")} />
              <Field label="Η στιγμή που γέλασα" value={get("feelings", "laughed")} />
              <Field label="Κάτι που δεν περίμενα να νιώσω" value={get("feelings", "unexpected")} />
              <Field label="Αυτό που ήθελα να κρατήσω για πάντα" value={get("feelings", "keep_forever")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Στιγμές που δεν θέλουμε να ξεχάσουμε" />
              <PhotoGrid p1={photo("moments", "photo1")} p2={photo("moments", "photo2")} />
              <Field label="Η πιο αστεία στιγμή" value={get("moments", "funny")} />
              <Field label="Κάτι που πήγε στραβά αλλά έγινε ανάμνηση" value={get("moments", "went_wrong")} />
              <Field label="Μια μικρή λεπτομέρεια που με συγκίνησε" value={get("moments", "small_detail")} />
              <Field label="Η στιγμή που σκέφτηκα αυτό θέλω να θυμάμαι" value={get("moments", "remember")} />
              <Field label="Μια έκπληξη της ημέρας" value={get("moments", "surprise")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Το γλέντι 🎉" />
              <PhotoGrid p1={photo("party", "photo1")} p2={photo("party", "photo2")} />
              <div style={{ backgroundColor: "#F2E8DE", borderRadius: "4mm", padding: "4mm", marginBottom: "4mm" }}>
                <p style={{ fontSize: "8pt", color: "#8B5E3C", marginBottom: "2mm" }}>🎵 Τραγούδι πρώτου χορού</p>
                <Field label="" value={get("party", "first_dance_song")} />
              </div>
              <Field label="Πώς ήταν η πίστα" value={get("party", "dance_floor")} />
              <Field label="Κάποιος που χόρεψε απρόσμενα" value={get("party", "unexpected_dancer")} />
              <Field label="Η στιγμή που χορέψαμε μαζί" value={get("party", "danced_together")} />
              <Field label="Το αγαπημένο μου στιγμιότυπο" value={get("party", "favorite_moment")} />
            </PageWrapper>

            <PageWrapper>
              <SectionTitle title="Η νύχτα μας 🌙" />
              <Photo src={photo("our_night", "photo1")} />
              <Field label="Πότε φύγαμε" value={get("our_night", "left_when")} />
              <Field label="Η πρώτη στιγμή που μείναμε μόνοι" value={get("our_night", "alone")} />
              <Field label="Τι είπαμε ο ένας στον άλλον" value={get("our_night", "said")} />
              <Field label="Πώς τελείωσε αυτή η μέρα" value={get("our_night", "ended")} />
              <Field label="Τι ονειρεύτηκα εκείνη τη νύχτα" value={get("our_night", "dreamed")} />
            </PageWrapper>

            <PageWrapper bgColor="#F2E8DE">
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
