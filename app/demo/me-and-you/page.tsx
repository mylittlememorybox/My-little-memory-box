"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const PAGES = [
  { key: "cover", title: "Εξώφυλλο" },
  { key: "how_we_met", title: "Πώς ξεκίνησε όλο αυτό" },
  { key: "him", title: "Αυτός" },
  { key: "her", title: "Αυτή" },
  { key: "our_moments", title: "Οι στιγμές μας" },
  { key: "our_trips", title: "Τα ταξίδια μας" },
  { key: "hard_days", title: "Οι δύσκολες μέρες" },
  { key: "what_i_love", title: "Αυτό που αγαπώ σε σένα" },
  { key: "our_dreams", title: "Τα όνειρά μας" },
  { key: "letter", title: "Ένα γράμμα για σένα" },
];

function TextField({ placeholder, multiline = false }: { placeholder: string; multiline?: boolean }) {
  const [value, setValue] = useState("");
  const inputRef = useRef<any>(null);

  const baseClass = "w-full bg-transparent border-b-2 border-dotted border-[#C4A882] text-[#5C3820] font-light text-sm focus:outline-none focus:border-[#8B5E3C] placeholder-[#C4A882] py-1 resize-none";

  if (multiline) {
    return (
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
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
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className={baseClass}
      onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
    />
  );
}

function PhotoPlaceholder() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  return (
    <label className="block cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          setPhotoUrl(url);
        }}
      />
      {photoUrl ? (
        <img src={photoUrl} alt="Memory" className="w-full h-48 object-contain bg-[#F2E8DE] rounded-xl border-4 border-white shadow-md" />
      ) : (
        <div className="w-full h-48 bg-[#F2E8DE] rounded-xl border-4 border-dashed border-[#C4A882] flex flex-col items-center justify-center hover:bg-[#EDE0D4] transition-all">
          <span className="text-3xl mb-2">📸</span>
          <span className="text-xs text-[#B09880] font-light">Πατήστε για φωτογραφία</span>
        </div>
      )}
    </label>
  );
}

const F = ({ ph, ml = false }: { ph: string; ml?: boolean }) => (
  <TextField placeholder={ph} multiline={ml} />
);

export default function DemoMeAndYouPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping] = useState(false);

  const goToPage = (direction: "prev" | "next") => {
    if (flipping) return;
    if (direction === "next" && currentPage < PAGES.length - 1) {
      setFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setFlipping(false);
      }, 400);
    } else if (direction === "prev" && currentPage > 0) {
      setFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setFlipping(false);
      }, 400);
    }
  };

  const renderPage = () => {
    const page = PAGES[currentPage];

    switch (page.key) {
      case "cover":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <img src="/logo.png" alt="Logo" className="w-48 h-auto mb-6 drop-shadow-lg" />
            <h1 className="text-3xl font-script text-[#8B5E3C] mb-6">Εγώ & Εσύ</h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882]">💑</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>
            <div className="w-full max-w-xs space-y-3 mb-6">
              <F ph="Όνομα του..." />
              <F ph="Όνομα της..." />
              <F ph="Η ιστορία μας ξεκίνησε..." />
            </div>
            <PhotoPlaceholder />
          </div>
        );

      case "how_we_met":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Πώς ξεκίνησε όλο αυτό</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder />
              <PhotoPlaceholder />
            </div>
            <div className="space-y-4">
              {[
                "Πώς γνωριστήκαμε",
                "Η πρώτη μου εντύπωση για σένα",
                "Η πρώτη μας συνάντηση ήταν",
                "Η στιγμή που κατάλαβα ότι ήσουν ο/η κατάλληλος/η",
              ].map((label, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{label}:</p>
                  <F ph="..." ml />
                </div>
              ))}
            </div>
          </div>
        );

      case "him":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Αυτός 💙</h2>
            <PhotoPlaceholder />
            <div className="space-y-4 mt-4">
              {[
                { label: "Το όνομά του", ml: false },
                { label: "Αυτό που με τρέλανε σε αυτόν", ml: true },
                { label: "Αυτό που με κάνει να γελάω μαζί του", ml: true },
                { label: "Το πιο αστείο χαρακτηριστικό του", ml: false },
                { label: "Το ταλέντο του που με εκπλήσσει", ml: false },
                { label: "Αυτό που αγαπώ περισσότερο σε αυτόν", ml: true },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "her":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Αυτή 🌸</h2>
            <PhotoPlaceholder />
            <div className="space-y-4 mt-4">
              {[
                { label: "Το όνομά της", ml: false },
                { label: "Αυτό που με τρέλανε σε αυτήν", ml: true },
                { label: "Αυτό που με κάνει να γελάω μαζί της", ml: true },
                { label: "Το πιο αστείο χαρακτηριστικό της", ml: false },
                { label: "Το ταλέντο της που με εκπλήσσει", ml: false },
                { label: "Αυτό που αγαπώ περισσότερο σε αυτήν", ml: true },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "our_moments":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι στιγμές μας</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder />
              <PhotoPlaceholder />
            </div>
            <div className="space-y-4">
              {[
                "Η αγαπημένη μας στιγμή μαζί",
                "Μια στιγμή που δεν θα ξεχάσω ποτέ",
                "Κάτι μικρό που για μένα ήταν τεράστιο",
                "Η στιγμή που σκέφτηκα αυτό είναι αγάπη",
                "Μια αγκαλιά που δεν ήθελα να τελειώσει",
              ].map((label, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{label}:</p>
                  <F ph="..." ml />
                </div>
              ))}
              <div className="bg-[#F2E8DE] rounded-2xl p-4 mt-2">
                <p className="text-xs text-[#8B5E3C] mb-3 font-serif">🎵 Το αγαπημένο μας τραγούδι</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-[#B09880] mb-1">Τίτλος τραγουδιού:</p>
                    <F ph="π.χ. Perfect - Ed Sheeran" />
                  </div>
                  <div>
                    <p className="text-xs text-[#B09880] mb-1">Γιατί είναι το τραγούδι μας:</p>
                    <F ph="..." ml />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "our_trips":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα ταξίδια μας ✈️</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder />
              <PhotoPlaceholder />
            </div>
            <div className="space-y-4">
              {[
                { label: "Το πρώτο μας ταξίδι μαζί", ml: true },
                { label: "Το αγαπημένο μας μέρος", ml: false },
                { label: "Μια αστεία στιγμή σε ταξίδι", ml: true },
                { label: "Το ταξίδι που θέλουμε να κάνουμε", ml: false },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "hard_days":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι δύσκολες μέρες που μας έκαναν πιο δυνατούς</h2>
            <PhotoPlaceholder />
            <div className="space-y-4 mt-4">
              {[
                "Μια δύσκολη στιγμή που περάσαμε μαζί",
                "Αυτό που μας έκανε πιο δυνατούς",
                "Η στιγμή που κατάλαβα ότι μπορώ να βασιστώ σε σένα",
                "Και παρ' όλα αυτά... συνεχίσαμε γιατί",
              ].map((label, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{label}:</p>
                  <F ph="..." ml />
                </div>
              ))}
            </div>
          </div>
        );

      case "what_i_love":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Αυτό που αγαπώ σε σένα ❤️</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder />
              <PhotoPlaceholder />
            </div>
            <div className="space-y-4">
              {[
                "Τρία πράγματα που αγαπώ σε σένα",
                "Αυτό που με κάνεις να νιώθω",
                "Κάτι που έμαθα από σένα",
                "Αυτό που με κάνει να σε επιλέγω κάθε μέρα",
              ].map((label, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{label}:</p>
                  <F ph="..." ml />
                </div>
              ))}
            </div>
          </div>
        );

      case "our_dreams":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα όνειρά μας 🌟</h2>
            <PhotoPlaceholder />
            <div className="space-y-4 mt-4">
              {[
                "Ένα όνειρο που έχουμε μαζί",
                "Κάτι που θέλουμε να κάνουμε μαζί",
                "Πού βλέπουμε τον εαυτό μας σε 10 χρόνια",
                "Η υπόσχεση που δίνουμε ο ένας στον άλλον",
              ].map((label, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{label}:</p>
                  <F ph="..." ml />
                </div>
              ))}
            </div>
          </div>
        );

      case "letter":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Ένα γράμμα για σένα...</h2>
            <PhotoPlaceholder />
            <div className="mt-4">
              <F ph="Αγάπη μου..." ml />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#C4A882] flex flex-col items-center justify-center p-4">
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
