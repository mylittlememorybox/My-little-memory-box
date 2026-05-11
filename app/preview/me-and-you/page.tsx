"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const PAGES = [
  { key: "cover", title: "Εξώφυλλο" },
  { key: "how_we_met", title: "Πώς ξεκίνησε όλο αυτό" },
  { key: "him", title: "Αυτός" },
  { key: "her", title: "Αυτή" },
  { key: "moments", title: "Οι στιγμές μας" },
  { key: "trips", title: "Τα ταξίδια μας" },
  { key: "locked", title: "Κλειδωμένο" },
];

const TYPED_CONTENT: Record<string, any> = {
  cover: {
    his_name: "Ιάσονας",
    her_name: "Ανδριάνα",
    start_date: "14 Φεβρουαρίου 2022",
  },
  how_we_met: {
    how_met: "Σε ένα πάρτι φίλων. Στεκόμουν στη γωνία και μου μίλησε πρώτος.",
    first_impression: "Ήταν αστείος και χαλαρός. Δεν περίμενα να μου αρέσει τόσο πολύ.",
    first_date: "Πήγαμε για καφέ την επόμενη μέρα και μιλήσαμε για ώρες.",
    realized: "Όταν γέλασε με κάτι που είπα και σκέφτηκα ότι ήθελα να τον ξαναδώ.",
  },
  him: {
    name: "Ιάσονας",
    crazy_about: "Το χαμόγελό του όταν είναι χαρούμενος — αλλάζει ολόκληρο το πρόσωπό του.",
    makes_laugh: "Κάνει τις πιο ανόητες φάρσες και γελάει πρώτος με αυτές.",
    funny_trait: "Χάνει τα κλειδιά του κάθε μέρα χωρίς εξαίρεση.",
    talent: "Μαγειρεύει καλύτερα από μένα και το ξέρει.",
    love_most: "Ότι είναι πάντα εκεί όταν τον χρειάζομαι, χωρίς να χρειάζεται να του το πω.",
  },
  her: {
    name: "Ανδριάνα",
    crazy_about: "Τον τρόπο που μιλά για τα πράγματα που αγαπάει — με τόση ενέργεια.",
    makes_laugh: "Παραγγέλνει πάντα ό,τι έχει το εστιατόριο και μετά μετανιώνει.",
    funny_trait: "Ξεκινά χίλια project ταυτόχρονα και τα τελειώνει όλα αργά ή γρήγορα.",
    talent: "Βρίσκει πάντα τον καλύτερο τρόπο να διακοσμεί οτιδήποτε.",
    love_most: "Ότι κάνει κάθε μέρα να φαίνεται λίγο πιο ωραία από την προηγούμενη.",
  },
  moments: {
    favorite_moment: "Ένα βράδυ που βγήκαμε για λίγο και καταλήξαμε να περπατάμε μέχρι τα ξημερώματα.",
    unforgettable: "Η πρώτη φορά που ταξιδέψαμε μαζί — χάθηκαμε τρεις φορές και γελάσαμε και τις τρεις.",
    small_big: "Όταν μου έφερε καφέ χωρίς να του ζητήσω, ακριβώς όπως τον πίνω.",
    this_is_love: "Μια βαρετή Κυριακή στο σπίτι που δεν κάναμε τίποτα και ήταν τέλεια.",
    song_title: "Photograph - Ed Sheeran",
    song_reason: "Το ακούσαμε στο πρώτο μας ταξίδι και από τότε είναι δικό μας.",
  },
  trips: {
    first_trip: "Πήγαμε Θεσσαλονίκη για ένα Σαββατοκύριακο. Χάθηκαμε, βρήκαμε τυχαία μια ταβέρνα και ήταν η καλύτερη βραδιά.",
    favorite_place: "Η Κρήτη. Πάντα η Κρήτη.",
    funny_moment: "Πήραμε λάθος δρόμο για δύο ώρες και καταλήξαμε σε ένα χωριό που δεν υπήρχε στο χάρτη.",
    dream_trip: "Ιαπωνία. Το λέμε κάθε χρόνο και κάποτε θα το κάνουμε.",
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

export default function CouplePreviewPage() {
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

  const Field = ({ label, value, delay = 0 }: { label: string; value: string; delay?: number }) => (
    <div className="mb-4">
      <p className="text-xs text-[#8B5E3C] font-light mb-1">{label}</p>
      <div className="border-b-2 border-dotted border-[#C4A882] py-1 text-sm font-light min-h-[24px]">
        <TypedText text={value} delay={delay} />
      </div>
    </div>
  );

  const imgClass = "w-full h-36 object-contain bg-[#F2E8DE] rounded-xl border-4 border-white shadow-md";

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
            <h1 className="text-3xl font-script text-[#8B5E3C] mb-4">Εγώ & Εσύ</h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882]">💑</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>
            <div className="w-full max-w-xs space-y-3 mb-6">
              <Field label="Όνομα του" value={TYPED_CONTENT.cover.his_name} delay={300} />
              <Field label="Όνομα της" value={TYPED_CONTENT.cover.her_name} delay={800} />
              <Field label="Η ιστορία μας ξεκίνησε" value={TYPED_CONTENT.cover.start_date} delay={1300} />
            </div>
            <img src="/preview/couple/couple-cover.jpeg" alt="Couple Cover" className={imgClass} />
          </div>
        );

      case "how_we_met":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Πώς ξεκίνησε όλο αυτό</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <img src="/preview/couple/couple-how-met-1.jpeg" alt="" className={imgClass} />
              <img src="/preview/couple/couple-how-met-2.jpeg" alt="" className={imgClass} />
            </div>
            <Field label="Πώς γνωριστήκαμε" value={TYPED_CONTENT.how_we_met.how_met} delay={200} />
            <Field label="Η πρώτη μου εντύπωση για σένα" value={TYPED_CONTENT.how_we_met.first_impression} delay={800} />
            <Field label="Η πρώτη μας συνάντηση ήταν" value={TYPED_CONTENT.how_we_met.first_date} delay={1400} />
            <Field label="Η στιγμή που κατάλαβα ότι ήσουν ο κατάλληλος" value={TYPED_CONTENT.how_we_met.realized} delay={2000} />
          </div>
        );

      case "him":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Αυτός 💙</h2>
            <img src="/preview/couple/couple-him.jpeg" alt="" className={`${imgClass} mb-4`} />
            <Field label="Το όνομά του" value={TYPED_CONTENT.him.name} delay={200} />
            <Field label="Αυτό που με τρέλανε σε αυτόν" value={TYPED_CONTENT.him.crazy_about} delay={600} />
            <Field label="Αυτό που με κάνει να γελάω μαζί του" value={TYPED_CONTENT.him.makes_laugh} delay={1200} />
            <Field label="Το πιο αστείο χαρακτηριστικό του" value={TYPED_CONTENT.him.funny_trait} delay={1800} />
            <Field label="Το ταλέντο του που με εκπλήσσει" value={TYPED_CONTENT.him.talent} delay={2400} />
            <Field label="Αυτό που αγαπώ περισσότερο σε αυτόν" value={TYPED_CONTENT.him.love_most} delay={3000} />
          </div>
        );

      case "her":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Αυτή 🌸</h2>
            <img src="/preview/couple/couple-her.jpeg" alt="" className={`${imgClass} mb-4`} />
            <Field label="Το όνομά της" value={TYPED_CONTENT.her.name} delay={200} />
            <Field label="Αυτό που με τρέλανε σε αυτήν" value={TYPED_CONTENT.her.crazy_about} delay={600} />
            <Field label="Αυτό που με κάνει να γελάω μαζί της" value={TYPED_CONTENT.her.makes_laugh} delay={1200} />
            <Field label="Το πιο αστείο χαρακτηριστικό της" value={TYPED_CONTENT.her.funny_trait} delay={1800} />
            <Field label="Το ταλέντο της που με εκπλήσσει" value={TYPED_CONTENT.her.talent} delay={2400} />
            <Field label="Αυτό που αγαπώ περισσότερο σε αυτήν" value={TYPED_CONTENT.her.love_most} delay={3000} />
          </div>
        );

      case "moments":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι στιγμές μας</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <img src="/preview/couple/couple-moments-1.jpeg" alt="" className={imgClass} />
              <img src="/preview/couple/couple-moments-2.jpeg" alt="" className={imgClass} />
            </div>
            <Field label="Η αγαπημένη μας στιγμή μαζί" value={TYPED_CONTENT.moments.favorite_moment} delay={200} />
            <Field label="Μια στιγμή που δεν θα ξεχάσω ποτέ" value={TYPED_CONTENT.moments.unforgettable} delay={800} />
            <Field label="Κάτι μικρό που για μένα ήταν τεράστιο" value={TYPED_CONTENT.moments.small_big} delay={1400} />
            <Field label="Η στιγμή που σκέφτηκα αυτό είναι αγάπη" value={TYPED_CONTENT.moments.this_is_love} delay={2000} />
            <div className="bg-[#F2E8DE] rounded-2xl p-4 mt-2">
              <p className="text-xs text-[#8B5E3C] mb-2 font-serif">🎵 Το αγαπημένο μας τραγούδι</p>
              <div className="border-b-2 border-dotted border-[#C4A882] py-1 text-sm font-light mb-2">
                <TypedText text={TYPED_CONTENT.moments.song_title} delay={2600} />
              </div>
              <div className="border-b-2 border-dotted border-[#C4A882] py-1 text-sm font-light">
                <TypedText text={TYPED_CONTENT.moments.song_reason} delay={3200} />
              </div>
            </div>
          </div>
        );

      case "trips":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα ταξίδια μας ✈️</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <img src="/preview/couple/couple-trips-1.jpeg" alt="" className={imgClass} />
              <img src="/preview/couple/couple-trips-2.jpeg" alt="" className={imgClass} />
            </div>
            <Field label="Το πρώτο μας ταξίδι μαζί" value={TYPED_CONTENT.trips.first_trip} delay={200} />
            <Field label="Το αγαπημένο μας μέρος" value={TYPED_CONTENT.trips.favorite_place} delay={800} />
            <Field label="Μια αστεία στιγμή σε ταξίδι" value={TYPED_CONTENT.trips.funny_moment} delay={1400} />
            <Field label="Το ταξίδι που θέλουμε να κάνουμε" value={TYPED_CONTENT.trips.dream_trip} delay={2000} />
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
                <li>✦ Οι δύσκολες μέρες που μας έκαναν πιο δυνατούς</li>
                <li>✦ Αυτό που αγαπώ σε σένα</li>
                <li>✦ Τα όνειρά μας</li>
                <li>✦ Ένα γράμμα για σένα</li>
                <li>✦ Προσωποποιημένο παραμύθι</li>
              </ul>
            </div>
            <Link
              href="/checkout?template=me-and-you"
              className="block w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all mb-3"
            >
              ✨ Δημιούργησε το δικό σου
            </Link>
            <Link
              href="/checkout?template=me-and-you&gift=true"
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
