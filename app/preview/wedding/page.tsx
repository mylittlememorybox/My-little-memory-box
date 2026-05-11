"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const PAGES = [
  { key: "cover", title: "Εξώφυλλο" },
  { key: "proposal", title: "Η πρόταση γάμου" },
  { key: "saw_you", title: "Η στιγμή που σε είδα" },
  { key: "party", title: "Το γλέντι" },
  { key: "locked", title: "Κλειδωμένο" },
];

const TYPED_CONTENT: Record<string, Record<string, string>> = {
  cover: {
    groom_name: "Νίκος",
    bride_name: "Μαρία",
    wedding_date: "15 Ιουνίου 2024",
    wedding_location: "Σαντορίνη",
  },
  proposal: {
    where: "Στο αγαπημένο μας εστιατόριο στη Θεσσαλονίκη",
    planned: "Με τη βοήθεια των φίλων μας, χωρίς να καταλάβω τίποτα",
    words: "Θέλω να περνάω κάθε μέρα δίπλα σου",
    reaction: "Έκλαψα, γέλασα και είπα ναι τρεις φορές",
    first_told: "Πήραμε αμέσως τηλέφωνο τη μαμά μου",
  },
  saw_you: {
    first_thought: "Δεν μπορούσα να πιστέψω πόσο όμορφος ήσουν",
    outfit: "Το μαύρο σου κοστούμι με την άσπρη γραβάτα",
    noticed_first: "Τα μάτια σου που γέλαγαν",
    feeling: "Ότι ήθελα αυτή τη στιγμή να μη τελειώσει ποτέ",
  },
  party: {
    first_dance_song: "Can't Help Falling in Love",
    unexpected_dancer: "Ο παππούς σου που είπε δεν χορεύει ποτέ 😄",
    danced_together: "Όταν άρχισε το τραγούδι μας ένιωσα ότι ήμασταν μόνοι μας",
  },
};

function TypedText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setStarted(false);
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [text, delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, 35);

    return () => clearTimeout(timer);
  }, [displayed, started, text]);

  return (
    <span className="text-[#5C3820]">
      {displayed}
      {displayed.length < text.length && started && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}

export default function WeddingPreviewPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState<"left" | "right">("right");

  const goToPage = (direction: "prev" | "next") => {
    if (flipping) return;
    if (direction === "next" && currentPage < PAGES.length - 1) {
      setFlipDir("right");
      setFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setFlipping(false);
      }, 400);
    } else if (direction === "prev" && currentPage > 0) {
      setFlipDir("left");
      setFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setFlipping(false);
      }, 400);
    }
  };

  const Field = ({ label, value, delay = 0 }: { label: string; value: string; delay?: number }) => (
    <div className="mb-4">
      <p className="text-xs text-[#8B5E3C] font-light mb-1">{label}</p>
      <div className="border-b-2 border-dotted border-[#C4A882] py-1 text-sm font-light min-h-[24px]">
        <TypedText text={value} delay={delay} />
      </div>
    </div>
  );

  const renderPage = () => {
    const page = PAGES[currentPage];

    switch (page.key) {
      case "cover":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <img src="/logo.png" alt="Logo" className="w-36 h-auto mb-6 drop-shadow-lg" />
            <h1 className="text-3xl font-script text-[#8B5E3C] mb-4">Ο Γάμος Μας</h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882]">💍</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>
            <div className="w-full max-w-xs space-y-3 mb-6">
              <Field label="Όνομα γαμπρού" value={TYPED_CONTENT.cover.groom_name} delay={300} />
              <Field label="Όνομα νύφης" value={TYPED_CONTENT.cover.bride_name} delay={800} />
              <Field label="Ημερομηνία γάμου" value={TYPED_CONTENT.cover.wedding_date} delay={1300} />
              <Field label="Τοποθεσία γάμου" value={TYPED_CONTENT.cover.wedding_location} delay={1800} />
            </div>
            <img
              src="/preview/wedding/wedding-cover.jpg"
              alt="Wedding Cover"
              className="w-full h-40 object-cover rounded-2xl border-4 border-white shadow-md"
            />
          </div>
        );

      case "proposal":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η πρόταση γάμου 💍</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <img src="/preview/wedding/wedding-proposal-1.jpg" alt="" className="w-full h-32 object-cover rounded-xl border-4 border-white shadow-md" />
              <img src="/preview/wedding/wedding-proposal-2.jpg" alt="" className="w-full h-32 object-cover rounded-xl border-4 border-white shadow-md" />
            </div>
            <Field label="Πού έγινε η πρόταση" value={TYPED_CONTENT.proposal.where} delay={200} />
            <Field label="Πώς το σχεδίασες" value={TYPED_CONTENT.proposal.planned} delay={600} />
            <Field label="Τα λόγια που είπες" value={TYPED_CONTENT.proposal.words} delay={1200} />
            <Field label="Η πρώτη μου αντίδραση" value={TYPED_CONTENT.proposal.reaction} delay={1800} />
            <Field label="Ο πρώτος που το μοιραστήκαμε" value={TYPED_CONTENT.proposal.first_told} delay={2400} />
          </div>
        );

      case "saw_you":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η στιγμή που σε είδα</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <img src="/preview/wedding/wedding-saw-you-1.jpg" alt="" className="w-full h-32 object-cover rounded-xl border-4 border-white shadow-md" />
              <img src="/preview/wedding/wedding-saw-you-2.jpg" alt="" className="w-full h-32 object-cover rounded-xl border-4 border-white shadow-md" />
            </div>
            <Field label="Η πρώτη μου σκέψη όταν σε είδα" value={TYPED_CONTENT.saw_you.first_thought} delay={200} />
            <Field label="Πώς ήσουν ντυμένος" value={TYPED_CONTENT.saw_you.outfit} delay={800} />
            <Field label="Αυτό που παρατήρησα πρώτα" value={TYPED_CONTENT.saw_you.noticed_first} delay={1400} />
            <Field label="Τι ένιωσα εκείνη τη στιγμή" value={TYPED_CONTENT.saw_you.feeling} delay={2000} />
          </div>
        );

      case "party":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Το γλέντι 🎉</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <img src="/preview/wedding/wedding-party-1.jpg" alt="" className="w-full h-32 object-cover rounded-xl border-4 border-white shadow-md" />
              <img src="/preview/wedding/wedding-party-2.jpg" alt="" className="w-full h-32 object-cover rounded-xl border-4 border-white shadow-md" />
            </div>
            <div className="bg-[#F2E8DE] rounded-2xl p-4 mb-4">
              <p className="text-xs text-[#8B5E3C] mb-2 font-serif">🎵 Το τραγούδι του πρώτου μας χορού</p>
              <div className="border-b-2 border-dotted border-[#C4A882] py-1 text-sm font-light">
                <TypedText text={TYPED_CONTENT.party.first_dance_song} delay={200} />
              </div>
            </div>
            <Field label="Κάποιος που χόρεψε και δεν το περιμέναμε" value={TYPED_CONTENT.party.unexpected_dancer} delay={800} />
            <Field label="Η στιγμή που χορέψαμε μαζί" value={TYPED_CONTENT.party.danced_together} delay={1400} />
          </div>
        );

      case "locked":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-2xl font-serif text-[#8B5E3C] mb-4">
              Και πολλές ακόμα σελίδες...
            </h2>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882] text-xs">✦</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>
            <p className="text-[#B09880] font-light mb-4 text-sm leading-relaxed">
              Οι υπόλοιπες σελίδες ξεκλειδώνονται με την αγορά σου!
            </p>

            <div className="bg-[#F2E8DE] rounded-2xl p-4 mb-6 w-full text-left">
              <p className="text-xs text-[#8B5E3C] font-serif mb-2">Περιλαμβάνει:</p>
              <ul className="space-y-1 text-xs text-[#7A6055] font-light">
                <li>✦ Η μέρα πριν</li>
                <li>✦ Η τελετή</li>
                <li>✦ Οι άνθρωποι της μέρας μας</li>
                <li>✦ Τα συναισθήματα της μέρας</li>
                <li>✦ Στιγμές που δεν θέλουμε να ξεχάσουμε</li>
                <li>✦ Η νύχτα μας</li>
                <li>✦ Ένα γράμμα για σένα</li>
              </ul>
            </div>

            <Link
              href="/checkout?template=our-wedding"
              className="block w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all mb-3"
            >
              ✨ Δημιούργησε το δικό σου
            </Link>
            <Link
              href="/checkout?template=our-wedding&gift=true"
              className="block w-full py-4 bg-[#C47878] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all"
            >
              🎁 Κάντο Δώρο
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#D4B8A8] flex flex-col items-center justify-center p-4">
      <div
        className={`relative bg-[#F9F2EC] rounded-lg shadow-2xl w-full max-w-md transition-all duration-400 ${
          flipping ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
        style={{
          minHeight: "600px",
          boxShadow: "8px 8px 30px rgba(0,0,0,0.4), inset -3px 0 6px rgba(0,0,0,0.1)",
        }}
      >
        <div className="sticky top-0 z-10 bg-[#F9F2EC] pt-4 pb-2 flex justify-center border-b border-[rgba(196,168,130,0.2)]">
          <Link href="/">
            <img src="/logo.png" alt="Logo" className="w-16 h-auto hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        <div className="p-4" style={{ minHeight: "520px" }}>
          {renderPage()}
        </div>

        <div className="text-center py-2 text-xs text-[#B09880]">
          {currentPage + 1} / {PAGES.length}
        </div>
      </div>

      <div className="flex items-center gap-8 mt-6">
        <button
          onClick={() => goToPage("prev")}
          disabled={currentPage === 0 || flipping}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#F2E8DE] transition-all disabled:opacity-30 text-[#8B5E3C] text-xl"
        >
          ←
        </button>
        <span className="text-white text-sm font-light text-center max-w-xs">
          {PAGES[currentPage].title}
        </span>
        <button
          onClick={() => goToPage("next")}
          disabled={currentPage === PAGES.length - 1 || flipping}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#F2E8DE] transition-all disabled:opacity-30 text-[#8B5E3C] text-xl"
        >
          →
        </button>
      </div>

      <Link
        href="/"
        className="mt-6 text-white text-xs font-light hover:opacity-70 transition-opacity tracking-widest uppercase"
      >
        ← Επιστροφή στην αρχική
      </Link>
    </div>
  );
}
