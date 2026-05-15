"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const PAGES = [
  { key: "cover", title: "Εξώφυλλο" },
  { key: "first_moments", title: "Οι πρώτες σου στιγμές" },
  { key: "your_world", title: "Ο κόσμος σου" },
  { key: "first_achievements", title: "Οι πρώτες σου κατακτήσεις" },
  { key: "first_steps", title: "Τα πρώτα σου βήματα" },
  { key: "moments", title: "Στιγμές που με έκανες να νιώθω τα πάντα" },
  { key: "hard_days", title: "Οι μέρες που δεν ήταν εύκολες" },
  { key: "personality", title: "Η προσωπικότητά σου" },
  { key: "birthdays", title: "Τα γενέθλιά σου" },
  { key: "school", title: "Η πρώτη σου μέρα στο σχολείο" },
  { key: "when_you_grow", title: "Για σένα όταν μεγαλώσεις" },
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

export default function DemoFirstYearsPage() {
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
            <img src="/logo.png" alt="Logo" className="w-48 h-auto mb-8 drop-shadow-lg" />
            <h1 className="text-3xl font-script text-[#8B5E3C] mb-6 leading-relaxed">
              Τα πρώτα χρόνια ζωής σου
            </h1>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882]">✦</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>
            <div className="w-full max-w-xs">
              <p className="text-xs tracking-widest uppercase text-[#B09880] mb-2">Όνομα</p>
              <F ph="Το όνομα του παιδιού σου..." />
            </div>
          </div>
        );

      case "first_moments":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι πρώτες σου στιγμές</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <PhotoPlaceholder />
              <PhotoPlaceholder />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η πρώτη φορά που σε κράτησα:</p>
                <F ph="..." ml />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#8B5E3C] mb-1">Ζύγιζες:</p>
                  <F ph="π.χ. 3.2 κιλά" />
                </div>
                <div>
                  <p className="text-xs text-[#8B5E3C] mb-1">Ύψος:</p>
                  <F ph="π.χ. 50 εκ" />
                </div>
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η πρώτη φορά που χαμογέλασες:</p>
                <F ph="..." ml />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Οι πρώτες στιγμές στο σπίτι μας:</p>
                <F ph="..." ml />
              </div>
            </div>
          </div>
        );

      case "your_world":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Ο κόσμος σου</h2>
            <div className="space-y-4">
              {[
                { label: "Οι γονείς σου" },
                { label: "Τα αδέρφια σου" },
                { label: "Οι θείοι σου" },
                { label: "Γιαγιάδες & Παππούδες" },
                { label: "Νονός/α" },
                { label: "Φίλοι που έγιναν οικογένεια" },
                { label: "Τι αξίες θέλουμε να σου δώσουμε" },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F ph="..." ml />
                  <PhotoPlaceholder />
                </div>
              ))}
            </div>
          </div>
        );

      case "first_achievements":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι πρώτες σου κατακτήσεις</h2>
            <div className="space-y-4">
              <PhotoPlaceholder />
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Το πρώτο σου δοντάκι (και το πρώτο μου ξενύχτι 😅):</p>
                <F ph="..." ml />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η πρώτη φορά που μπουσούλησες:</p>
                <F ph="..." ml />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η πρώτη φορά που σηκώθηκες όρθια:</p>
                <F ph="..." ml />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η πρώτη φορά που έτρεξες προς το μέρος μου (εκεί... έλιωσα ❤️):</p>
                <F ph="..." ml />
              </div>
              <PhotoPlaceholder />
            </div>
          </div>
        );

      case "first_steps":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα πρώτα σου βήματα προς τον κόσμο</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η πρώτη φορά που έπαιξες με άλλα παιδάκια:</p>
                <F ph="..." ml />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η πρώτη σου φιλία (όπως την είδα εγώ):</p>
                <F ph="..." ml />
              </div>
              <PhotoPlaceholder />
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Κάτι που σε ενθουσίασε πολύ:</p>
                <F ph="..." ml />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Κάτι που σε φόβισε:</p>
                <F ph="..." ml />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η στιγμή που κατάλαβα ότι μεγαλώνεις:</p>
                <F ph="..." ml />
              </div>
            </div>
          </div>
        );

      case "moments":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Στιγμές που με έκανες να νιώθω τα πάντα</h2>
            <div className="space-y-4">
              <PhotoPlaceholder />
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η στιγμή που ένιωσα περήφανη για σένα:</p>
                <F ph="..." ml />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Κάτι μικρό που για μένα ήταν τεράστιο:</p>
                <F ph="..." ml />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Μια αγκαλιά που δεν ήθελα να τελειώσει:</p>
                <F ph="..." ml />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η στιγμή που σκέφτηκα αυτό είναι η ευτυχία:</p>
                <F ph="..." ml />
              </div>
              <PhotoPlaceholder />
            </div>
          </div>
        );

      case "hard_days":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι μέρες που δεν ήταν εύκολες αλλά ήταν δικές μας</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Μια μέρα που ένιωσα ότι δεν τα κατάφερνα:</p>
                <F ph="..." ml />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Μια στιγμή που λύγισα (αλλά δεν το έδειξα):</p>
                <F ph="..." ml />
              </div>
              <PhotoPlaceholder />
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Κάτι που με δυσκόλεψε περισσότερο απ' όσο περίμενα:</p>
                <F ph="..." ml />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Και παρ' όλα αυτά... συνέχισα γιατί:</p>
                <F ph="..." ml />
              </div>
            </div>
          </div>
        );

      case "personality":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η προσωπικότητά σου από τα μάτια της μαμάς</h2>
            <div className="space-y-4">
              <PhotoPlaceholder />
              {[
                "Αυτό που σε κάνει να γελάς",
                "Αυτό που σε θυμώνει",
                "Αυτό που σε ηρεμεί",
                "Το πιο όμορφο κομμάτι του χαρακτήρα σου",
                "Κάτι που σε κάνει μοναδικό πλάσμα",
              ].map((label, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{label}:</p>
                  <F ph="..." ml />
                </div>
              ))}
            </div>
          </div>
        );

      case "birthdays":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα γενέθλιά σου 🎉</h2>
            <div className="space-y-4">
              <PhotoPlaceholder />
              {[1, 2, 3].map((year) => (
                <div key={year} className="bg-[#F9F2EC] rounded-2xl p-3">
                  <p className="text-sm font-serif text-[#8B5E3C] mb-2">{year} ετών 🎂</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-[#8B5E3C] mb-1">Έσβησες την τούρτα με:</p>
                      <F ph="..." />
                    </div>
                    <div>
                      <p className="text-xs text-[#8B5E3C] mb-1">Η ευχή μου για σένα:</p>
                      <F ph="..." ml />
                    </div>
                    <PhotoPlaceholder />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "school":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η πρώτη σου μέρα στο σχολείο</h2>
            <div className="space-y-4">
              <PhotoPlaceholder />
              {[
                "Και εγώ ένιωσα",
                "Εσύ έδειχνες",
                "Η στιγμή που σε άφησα",
                "Η σκέψη που δεν έφυγε από το μυαλό μου",
                "Όταν σε ξαναείδα",
              ].map((label, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{label}:</p>
                  <F ph="..." ml />
                </div>
              ))}
              <PhotoPlaceholder />
            </div>
          </div>
        );

      case "when_you_grow":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Για σένα όταν μεγαλώσεις...</h2>
            <div className="space-y-4">
              <PhotoPlaceholder />
              {[
                "Αν μπορούσα να σου πω κάτι για τη ζωή...",
                "Αν μπορούσα να σε προστατέψω από κάτι...",
                "Αν μπορούσα να σου αφήσω μόνο μια σκέψη...",
              ].map((label, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{label}</p>
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
    <div className="min-h-screen bg-[#8B5E3C] flex flex-col items-center justify-center p-4">
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
