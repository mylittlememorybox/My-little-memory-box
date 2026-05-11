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

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const pages = contentRef.current.querySelectorAll(".pdf-page");
      const pdf = new jsPDF("p", "mm", "a4");

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#F9F2EC",
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`memory-box-${params.id}.pdf`);
    } catch (error) {
      console.error("PDF error:", error);
      alert("Σφάλμα κατά τη δημιουργία PDF. Δοκιμάστε ξανά.");
    } finally {
      setGenerating(false);
    }
  };

  const get = (page: string, field: string) => data[page]?.[field] || "";
  const photo = (page: string, key: string) => photos[page]?.[key] || "";

  const Field = ({ label, value }: { label: string; value: string }) => (
    value ? (
      <div className="mb-3">
        <p className="text-xs text-[#8B5E3C] font-light mb-1">{label}</p>
        <p className="text-sm text-[#5C3820] font-light border-b border-dotted border-[#C4A882] pb-1">{value}</p>
      </div>
    ) : null
  );

  const Photo = ({ src }: { src: string }) => (
    src ? (
      <img
        src={src}
        alt="Memory"
        className="w-full h-48 object-contain bg-[#F2E8DE] rounded-xl mb-3"
        crossOrigin="anonymous"
      />
    ) : null
  );

  const PageHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-6">
      <img src="/logo.png" alt="Logo" className="w-16 h-auto mx-auto mb-3" />
      <h2 className="text-xl font-script text-[#8B5E3C]">{title}</h2>
      <div className="flex items-center justify-center gap-2 mt-2">
        <div className="w-8 h-px bg-[#C4A882] opacity-40" />
        <span className="text-[#C4A882] text-xs">✦</span>
        <div className="w-8 h-px bg-[#C4A882] opacity-40" />
      </div>
    </div>
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
          <Link href="/">
            <img src="/logo.png" alt="Logo" className="w-16 h-auto" />
          </Link>
          <Link href="/dashboard" className="text-xs text-[#8B5E3C] uppercase tracking-widest">
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 text-center">
        <h1 className="text-3xl font-serif text-[#8B5E3C] mb-4">Download Memory Box</h1>
        <p className="text-[#B09880] font-light mb-8">
          Κατεβάστε το Memory Box σας σε μορφή PDF
        </p>

        <button
          onClick={handleDownload}
          disabled={generating}
          className="inline-block px-10 py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all disabled:opacity-50 mb-12"
        >
          {generating ? "Δημιουργία PDF..." : "⬇️ Κατέβασε το PDF"}
        </button>

        {/* PDF Content */}
        <div ref={contentRef} className="text-left">

          {/* Page 1: Cover */}
          <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl" style={{ minHeight: "297mm" }}>
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <img src="/logo.png" alt="Logo" className="w-48 h-auto mb-8 drop-shadow-lg" />
              <h1 className="text-4xl font-script text-[#8B5E3C] mb-6">
                {templateId === "first-years" ? "Τα πρώτα χρόνια ζωής σου" :
                 templateId === "me-and-you" ? "Εγώ & Εσύ" : "Ο Γάμος Μας"}
              </h1>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-16 h-px bg-[#C4A882] opacity-40" />
                <span className="text-[#C4A882]">✦</span>
                <div className="w-16 h-px bg-[#C4A882] opacity-40" />
              </div>
              {templateId === "first-years" && (
                <p className="text-2xl font-serif text-[#8B5E3C]">{get("cover", "child_name")}</p>
              )}
              {templateId === "me-and-you" && (
                <div className="space-y-2">
                  <p className="text-2xl font-serif text-[#8B5E3C]">{get("cover", "his_name")} & {get("cover", "her_name")}</p>
                  <p className="text-sm text-[#B09880]">{get("cover", "start_date")}</p>
                </div>
              )}
              {templateId === "our-wedding" && (
                <div className="space-y-2">
                  <p className="text-2xl font-serif text-[#8B5E3C]">{get("cover", "groom_name")} & {get("cover", "bride_name")}</p>
                  <p className="text-sm text-[#B09880]">{get("cover", "wedding_date")}</p>
                  <p className="text-sm text-[#B09880]">{get("cover", "wedding_location")}</p>
                </div>
              )}
              {photo("cover", "cover_photo") && (
                <img src={photo("cover", "cover_photo")} alt="" className="w-64 h-64 object-contain rounded-2xl mt-8" crossOrigin="anonymous" />
              )}
            </div>
          </div>

          {/* Pages for first-years */}
          {templateId === "first-years" && (
            <>
              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Οι πρώτες σου στιγμές" />
                <Photo src={photo("first_moments", "photo1")} />
                <Photo src={photo("first_moments", "photo2")} />
                <Field label="Η πρώτη φορά που σε κράτησα" value={get("first_moments", "first_hold")} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Ζύγιζες" value={get("first_moments", "weight")} />
                  <Field label="Ύψος" value={get("first_moments", "height")} />
                </div>
                <Field label="Η πρώτη φορά που χαμογέλασες" value={get("first_moments", "first_smile")} />
                <Field label="Οι πρώτες στιγμές στο σπίτι μας" value={get("first_moments", "first_home")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Ο κόσμος σου" />
                <Field label="Οι γονείς σου" value={get("your_world", "parents")} />
                <Field label="Τα αδέρφια σου" value={get("your_world", "siblings")} />
                <Field label="Οι θείοι σου" value={get("your_world", "uncles")} />
                <Field label="Γιαγιάδες & Παππούδες" value={get("your_world", "grandparents")} />
                <Field label="Νονός/α" value={get("your_world", "godparents")} />
                <Field label="Φίλοι που έγιναν οικογένεια" value={get("your_world", "friends_family")} />
                <Field label="Τι αξίες θέλουμε να σου δώσουμε" value={get("your_world", "values")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Οι πρώτες σου κατακτήσεις" />
                <Photo src={photo("first_achievements", "photo1")} />
                <Field label="Το πρώτο σου δοντάκι" value={get("first_achievements", "first_tooth")} />
                <Field label="Η πρώτη φορά που μπουσούλησες" value={get("first_achievements", "first_crawl")} />
                <Field label="Η πρώτη φορά που σηκώθηκες όρθια" value={get("first_achievements", "first_stand")} />
                <Field label="Η πρώτη φορά που έτρεξες προς το μέρος μου" value={get("first_achievements", "first_run")} />
                <Photo src={photo("first_achievements", "photo2")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Τα πρώτα σου βήματα προς τον κόσμο" />
                <Photo src={photo("first_steps", "photo1")} />
                <Field label="Η πρώτη φορά που έπαιξες με άλλα παιδάκια" value={get("first_steps", "first_play")} />
                <Field label="Η πρώτη σου φιλία" value={get("first_steps", "first_friend")} />
                <Field label="Κάτι που σε ενθουσίασε πολύ" value={get("first_steps", "excited")} />
                <Field label="Κάτι που σε φόβισε" value={get("first_steps", "scared")} />
                <Field label="Η στιγμή που κατάλαβα ότι μεγαλώνεις" value={get("first_steps", "growing_up")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Στιγμές που με έκανες να νιώθω τα πάντα" />
                <Photo src={photo("moments", "photo1")} />
                <Field label="Η στιγμή που ένιωσα περήφανη για σένα" value={get("moments", "proud")} />
                <Field label="Κάτι μικρό που για μένα ήταν τεράστιο" value={get("moments", "small_big")} />
                <Field label="Μια αγκαλιά που δεν ήθελα να τελειώσει" value={get("moments", "hug")} />
                <Field label="Η στιγμή που σκέφτηκα αυτό είναι η ευτυχία" value={get("moments", "happiness")} />
                <Photo src={photo("moments", "photo2")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Οι μέρες που δεν ήταν εύκολες" />
                <Photo src={photo("hard_days", "photo1")} />
                <Field label="Μια μέρα που ένιωσα ότι δεν τα κατάφερνα" value={get("hard_days", "hard_day")} />
                <Field label="Μια στιγμή που λύγισα" value={get("hard_days", "broke_down")} />
                <Field label="Κάτι που με δυσκόλεψε" value={get("hard_days", "difficult")} />
                <Field label="Και παρ' όλα αυτά συνέχισα γιατί" value={get("hard_days", "continued")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Η προσωπικότητά σου" />
                <Photo src={photo("personality", "photo1")} />
                <Field label="Αυτό που σε κάνει να γελάς" value={get("personality", "laugh")} />
                <Field label="Αυτό που σε θυμώνει" value={get("personality", "angry")} />
                <Field label="Αυτό που σε ηρεμεί" value={get("personality", "calm")} />
                <Field label="Το πιο όμορφο κομμάτι του χαρακτήρα σου" value={get("personality", "best_trait")} />
                <Field label="Κάτι που σε κάνει μοναδικό πλάσμα" value={get("personality", "unique")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Τα γενέθλιά σου 🎉" />
                <Photo src={photo("birthdays", "photo1")} />
                {[1, 2, 3].map((year) => (
                  <div key={year} className="bg-white rounded-2xl p-4 mb-3">
                    <p className="text-sm font-serif text-[#8B5E3C] mb-2">{year} ετών 🎂</p>
                    <Field label="Έσβησες την τούρτα με" value={get("birthdays", `year${year}_with`)} />
                    <Field label="Η ευχή μου για σένα" value={get("birthdays", `year${year}_wish`)} />
                    <Photo src={photo("birthdays", `photo_year${year}`)} />
                  </div>
                ))}
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Η πρώτη σου μέρα στο σχολείο" />
                <Photo src={photo("school", "photo1")} />
                <Field label="Και εγώ ένιωσα" value={get("school", "i_felt")} />
                <Field label="Εσύ έδειχνες" value={get("school", "you_looked")} />
                <Field label="Η στιγμή που σε άφησα" value={get("school", "left_you")} />
                <Field label="Η σκέψη που δεν έφυγε από το μυαλό μου" value={get("school", "thought")} />
                <Field label="Όταν σε ξαναείδα" value={get("school", "saw_again")} />
                <Photo src={photo("school", "photo2")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Για σένα όταν μεγαλώσεις..." />
                <Photo src={photo("when_you_grow", "photo1")} />
                <Field label="Αν μπορούσα να σου πω κάτι για τη ζωή..." value={get("when_you_grow", "life")} />
                <Field label="Αν μπορούσα να σε προστατέψω από κάτι..." value={get("when_you_grow", "protect")} />
                <Field label="Αν μπορούσα να σου αφήσω μόνο μια σκέψη..." value={get("when_you_grow", "thought")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Ένα γράμμα για σένα..." />
                <Photo src={photo("letter", "photo1")} />
                <p className="text-sm text-[#5C3820] font-light leading-relaxed whitespace-pre-wrap">
                  {get("letter", "letter")}
                </p>
              </div>
            </>
          )}

          {/* Pages for me-and-you */}
          {templateId === "me-and-you" && (
            <>
              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Πώς ξεκίνησε όλο αυτό" />
                <Photo src={photo("how_we_met", "photo1")} />
                <Photo src={photo("how_we_met", "photo2")} />
                <Field label="Πώς γνωριστήκαμε" value={get("how_we_met", "how_met")} />
                <Field label="Η πρώτη μου εντύπωση" value={get("how_we_met", "first_impression")} />
                <Field label="Η πρώτη μας συνάντηση" value={get("how_we_met", "first_date")} />
                <Field label="Η στιγμή που κατάλαβα" value={get("how_we_met", "realized")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Αυτός 💙" />
                <Photo src={photo("him", "photo1")} />
                <Field label="Το όνομά του" value={get("him", "name")} />
                <Field label="Αυτό που με τρέλανε" value={get("him", "crazy_about")} />
                <Field label="Αυτό που με κάνει να γελάω" value={get("him", "makes_laugh")} />
                <Field label="Το πιο αστείο χαρακτηριστικό" value={get("him", "funny_trait")} />
                <Field label="Το ταλέντο του" value={get("him", "talent")} />
                <Field label="Αυτό που αγαπώ περισσότερο" value={get("him", "love_most")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Αυτή 🌸" />
                <Photo src={photo("her", "photo1")} />
                <Field label="Το όνομά της" value={get("her", "name")} />
                <Field label="Αυτό που με τρέλανε" value={get("her", "crazy_about")} />
                <Field label="Αυτό που με κάνει να γελάω" value={get("her", "makes_laugh")} />
                <Field label="Το πιο αστείο χαρακτηριστικό" value={get("her", "funny_trait")} />
                <Field label="Το ταλέντο της" value={get("her", "talent")} />
                <Field label="Αυτό που αγαπώ περισσότερο" value={get("her", "love_most")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Οι στιγμές μας" />
                <Photo src={photo("our_moments", "photo1")} />
                <Photo src={photo("our_moments", "photo2")} />
                <Field label="Η αγαπημένη μας στιγμή" value={get("our_moments", "favorite_moment")} />
                <Field label="Μια στιγμή που δεν θα ξεχάσω" value={get("our_moments", "unforgettable")} />
                <Field label="Κάτι μικρό που ήταν τεράστιο" value={get("our_moments", "small_big")} />
                <Field label="Η στιγμή που σκέφτηκα αυτό είναι αγάπη" value={get("our_moments", "this_is_love")} />
                <Field label="Αγαπημένο τραγούδι" value={get("our_moments", "song_title")} />
                <Field label="Γιατί είναι το τραγούδι μας" value={get("our_moments", "song_reason")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Τα ταξίδια μας ✈️" />
                <Photo src={photo("our_trips", "photo1")} />
                <Photo src={photo("our_trips", "photo2")} />
                <Field label="Το πρώτο μας ταξίδι" value={get("our_trips", "first_trip")} />
                <Field label="Το αγαπημένο μας μέρος" value={get("our_trips", "favorite_place")} />
                <Field label="Μια αστεία στιγμή" value={get("our_trips", "funny_moment")} />
                <Field label="Το ταξίδι που θέλουμε να κάνουμε" value={get("our_trips", "dream_trip")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Οι δύσκολες μέρες" />
                <Photo src={photo("hard_days", "photo1")} />
                <Field label="Μια δύσκολη στιγμή" value={get("hard_days", "hard_moment")} />
                <Field label="Αυτό που μας έκανε πιο δυνατούς" value={get("hard_days", "stronger")} />
                <Field label="Η στιγμή που κατάλαβα ότι μπορώ να βασιστώ σε σένα" value={get("hard_days", "trust")} />
                <Field label="Συνεχίσαμε γιατί" value={get("hard_days", "continued")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Αυτό που αγαπώ σε σένα ❤️" />
                <Photo src={photo("what_i_love", "photo1")} />
                <Photo src={photo("what_i_love", "photo2")} />
                <Field label="Τρία πράγματα που αγαπώ σε σένα" value={get("what_i_love", "three_things")} />
                <Field label="Αυτό που με κάνεις να νιώθω" value={get("what_i_love", "how_you_make_feel")} />
                <Field label="Κάτι που έμαθα από σένα" value={get("what_i_love", "learned")} />
                <Field label="Αυτό που με κάνει να σε επιλέγω κάθε μέρα" value={get("what_i_love", "choose_you")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Τα όνειρά μας 🌟" />
                <Photo src={photo("our_dreams", "photo1")} />
                <Field label="Ένα όνειρο που έχουμε μαζί" value={get("our_dreams", "dream")} />
                <Field label="Κάτι που θέλουμε να κάνουμε μαζί" value={get("our_dreams", "bucket_list")} />
                <Field label="Πού βλέπουμε τον εαυτό μας σε 10 χρόνια" value={get("our_dreams", "future")} />
                <Field label="Η υπόσχεση που δίνουμε ο ένας στον άλλον" value={get("our_dreams", "promise")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Ένα γράμμα για σένα..." />
                <Photo src={photo("letter", "photo1")} />
                <p className="text-sm text-[#5C3820] font-light leading-relaxed whitespace-pre-wrap">
                  {get("letter", "letter")}
                </p>
              </div>
            </>
          )}

          {/* Pages for our-wedding */}
          {templateId === "our-wedding" && (
            <>
              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Η πρόταση γάμου 💍" />
                <Photo src={photo("proposal", "photo1")} />
                <Photo src={photo("proposal", "photo2")} />
                <Field label="Πού έγινε η πρόταση" value={get("proposal", "where")} />
                <Field label="Πώς το σχεδίασες" value={get("proposal", "planned")} />
                <Field label="Τα λόγια που είπες" value={get("proposal", "words")} />
                <Field label="Η πρώτη μου αντίδραση" value={get("proposal", "reaction")} />
                <Field label="Ο πρώτος που το μοιραστήκαμε" value={get("proposal", "first_told")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Η μέρα πριν" />
                <Photo src={photo("day_before", "photo1")} />
                <Photo src={photo("day_before", "photo2")} />
                <Field label="Τι ένιωθα το βράδυ πριν" value={get("day_before", "evening_feeling")} />
                <Field label="Τι σκεφτόμουν ξαπλωμένος/η" value={get("day_before", "thoughts")} />
                <Field label="Το τελευταίο μήνυμα που έστειλα" value={get("day_before", "last_message")} />
                <Field label="Πώς κοιμήθηκα" value={get("day_before", "sleep")} />
                <Field label="Το πρωινό της ημέρας" value={get("day_before", "morning")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Η στιγμή που σε είδα" />
                <Photo src={photo("saw_you", "photo1")} />
                <Photo src={photo("saw_you", "photo2")} />
                <Field label="Η πρώτη μου σκέψη" value={get("saw_you", "first_thought")} />
                <Field label="Πώς ήσουν ντυμένος/η" value={get("saw_you", "outfit")} />
                <Field label="Αυτό που παρατήρησα πρώτα" value={get("saw_you", "noticed_first")} />
                <Field label="Τι ένιωσα εκείνη τη στιγμή" value={get("saw_you", "feeling")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Η τελετή" />
                <Photo src={photo("ceremony", "photo1")} />
                <Photo src={photo("ceremony", "photo2")} />
                <Field label="Η στιγμή που έδωσα τα χέρια μου" value={get("ceremony", "hands")} />
                <Field label="Τα λόγια που είπαμε" value={get("ceremony", "words")} />
                <Field label="Η στιγμή που φόρεσα/φόρεσες το δαχτυλίδι" value={get("ceremony", "ring")} />
                <Field label="Αυτό που σκέφτηκα όταν είπα ναι" value={get("ceremony", "said_yes")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Το γλέντι 🎉" />
                <Photo src={photo("party", "photo1")} />
                <Photo src={photo("party", "photo2")} />
                <Field label="Τραγούδι πρώτου χορού" value={get("party", "first_dance_song")} />
                <Field label="Κάποιος που χόρεψε απρόσμενα" value={get("party", "unexpected_dancer")} />
                <Field label="Η στιγμή που χορέψαμε μαζί" value={get("party", "danced_together")} />
                <Field label="Αγαπημένο στιγμιότυπο" value={get("party", "favorite_moment")} />
              </div>

              <div className="pdf-page bg-[#F9F2EC] p-8 mb-4 rounded-2xl">
                <PageHeader title="Ένα γράμμα για σένα..." />
                <Photo src={photo("letter", "photo1")} />
                <p className="text-sm text-[#5C3820] font-light leading-relaxed whitespace-pre-wrap">
                  {get("letter", "letter")}
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
