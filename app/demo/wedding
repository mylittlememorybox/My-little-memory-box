"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const PAGES = [
  { key: "cover", title: "Εξώφυλλο" },
  { key: "proposal", title: "Η πρόταση γάμου" },
  { key: "day_before", title: "Η μέρα πριν" },
  { key: "saw_you", title: "Η στιγμή που σε είδα" },
  { key: "ceremony", title: "Η τελετή" },
  { key: "people", title: "Οι άνθρωποι της μέρας μας" },
  { key: "feelings", title: "Τα συναισθήματα της μέρας" },
  { key: "moments", title: "Στιγμές που δεν θέλουμε να ξεχάσουμε" },
  { key: "party", title: "Το γλέντι" },
  { key: "our_night", title: "Η νύχτα μας" },
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

export default function DemoWeddingPage() {
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
            <h1 className="text-3xl font-script text-[#8B5E3C] mb-4">Ο Γάμος Μας</h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882]">💍</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>
            <div className="w-full max-w-xs space-y-3 mb-6">
              <F ph="Όνομα γαμπρού..." />
              <F ph="Όνομα νύφης..." />
              <F ph="Ημερομηνία γάμου..." />
              <F ph="Τοποθεσία γάμου..." />
            </div>
            <PhotoPlaceholder />
          </div>
        );

      case "proposal":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η πρόταση γάμου 💍</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder />
              <PhotoPlaceholder />
            </div>
            <div className="space-y-4">
              {[
                { label: "Πού έγινε η πρόταση", ml: false },
                { label: "Πώς το σχεδίασα/σχεδίασες", ml: true },
                { label: "Τι φορούσαμε εκείνη τη στιγμή", ml: false },
                { label: "Τα λόγια που είπα/είπες", ml: true },
                { label: "Η πρώτη μου αντίδραση", ml: true },
                { label: "Αυτό που ένιωσα εκείνη τη στιγμή", ml: true },
                { label: "Ο πρώτος που το μοιραστήκαμε", ml: false },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "day_before":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η μέρα πριν</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder />
              <PhotoPlaceholder />
            </div>
            <div className="space-y-4">
              {[
                "Τι ένιωθα το βράδυ πριν",
                "Τι σκεφτόμουν ξαπλωμένος/η",
                "Το τελευταίο μήνυμα που έστειλα σε σένα",
                "Πώς κοιμήθηκα (ή δεν κοιμήθηκα 😄)",
                "Το πρωινό της ημέρας του γάμου",
              ].map((label, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{label}:</p>
                  <F ph="..." ml />
                </div>
              ))}
            </div>
          </div>
        );

      case "saw_you":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η στιγμή που σε είδα</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder />
              <PhotoPlaceholder />
            </div>
            <div className="space-y-4">
              {[
                { label: "Η πρώτη μου σκέψη όταν σε είδα", ml: true },
                { label: "Πώς ήσουν ντυμένος/η", ml: true },
                { label: "Αυτό που παρατήρησα πρώτα", ml: false },
                { label: "Τι ένιωσα εκείνη τη στιγμή", ml: true },
                { label: "Αν μπορούσα να σταματήσω τον χρόνο εκείνη τη στιγμή", ml: true },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "ceremony":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η τελετή</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder />
              <PhotoPlaceholder />
            </div>
            <div className="space-y-4">
              {[
                "Η στιγμή που έδωσα τα χέρια μου",
                "Τα λόγια που είπαμε",
                "Η στιγμή που φόρεσα/φόρεσες το δαχτυλίδι",
                "Αυτό που σκέφτηκα όταν είπα ναι",
                "Μια λεπτομέρεια που θυμάμαι έντονα",
              ].map((label, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{label}:</p>
                  <F ph="..." ml />
                </div>
              ))}
            </div>
          </div>
        );

      case "people":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι άνθρωποι της μέρας μας</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder />
              <PhotoPlaceholder />
            </div>
            <div className="space-y-4">
              {[
                { label: "Αυτοί που ήταν εκεί για μας", ml: true },
                { label: "Κάποιος που με συγκίνησε", ml: true },
                { label: "Ένα πρόσωπο που κοίταξα και χαμογέλασα", ml: false },
                { label: "Κάποιος που έλειψε αλλά ήταν στην καρδιά μας", ml: true },
                { label: "Κουμπάρος/α", ml: false },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "feelings":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα συναισθήματα της μέρας</h2>
            <PhotoPlaceholder />
            <div className="space-y-4 mt-4">
              {[
                "Η κυρίαρχη αίσθηση της ημέρας",
                "Η στιγμή που δάκρυσα",
                "Η στιγμή που γέλασα",
                "Κάτι που δεν περίμενα να νιώσω",
                "Αυτό που ήθελα να κρατήσω για πάντα",
              ].map((label, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{label}:</p>
                  <F ph="..." ml />
                </div>
              ))}
            </div>
          </div>
        );

      case "moments":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Στιγμές που δεν θέλουμε να ξεχάσουμε</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder />
              <PhotoPlaceholder />
            </div>
            <div className="space-y-4">
              {[
                "Η πιο αστεία στιγμή της ημέρας",
                "Κάτι που πήγε στραβά αλλά έγινε ανάμνηση",
                "Μια μικρή λεπτομέρεια που με συγκίνησε",
                "Η στιγμή που σκέφτηκα αυτό θέλω να θυμάμαι",
                "Μια έκπληξη της ημέρας",
              ].map((label, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{label}:</p>
                  <F ph="..." ml />
                </div>
              ))}
            </div>
          </div>
        );

      case "party":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Το γλέντι 🎉</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder />
              <PhotoPlaceholder />
            </div>
            <div className="space-y-4">
              <div className="bg-[#F2E8DE] rounded-2xl p-4">
                <p className="text-xs text-[#8B5E3C] mb-3 font-serif">🎵 Το τραγούδι του πρώτου μας χορού</p>
                <F ph="Τίτλος - Καλλιτέχνης..." />
              </div>
              {[
                { label: "Πώς ήταν η πίστα", ml: true },
                { label: "Κάποιος που χόρεψε και δεν το περιμέναμε 😄", ml: false },
                { label: "Η στιγμή που χορέψαμε μαζί", ml: true },
                { label: "Το αγαπημένο μου στιγμιότυπο από το γλέντι", ml: true },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "our_night":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η νύχτα μας 🌙</h2>
            <PhotoPlaceholder />
            <div className="space-y-4 mt-4">
              {[
                { label: "Πότε φύγαμε", ml: false },
                { label: "Η πρώτη στιγμή που μείναμε μόνοι", ml: true },
                { label: "Τι είπαμε ο ένας στον άλλον", ml: true },
                { label: "Πώς τελείωσε αυτή η μέρα", ml: true },
                { label: "Τι ονειρεύτηκα εκείνη τη νύχτα", ml: true },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F ph="..." ml={item.ml} />
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
