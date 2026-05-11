"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const PAGES = [
  { key: "cover", title: "Εξώφυλλο" },
  { key: "first_moments", title: "Οι πρώτες σου στιγμές" },
  { key: "your_world", title: "Ο κόσμος σου" },
  { key: "first_achievements", title: "Οι πρώτες σου κατακτήσεις" },
  { key: "first_steps", title: "Τα πρώτα σου βήματα" },
  { key: "moments", title: "Στιγμές που με έκανες να νιώθω τα πάντα" },
  { key: "hard_days", title: "Οι μέρες που δεν ήταν εύκολες" },
  { key: "birthdays", title: "Τα γενέθλιά σου" },
  { key: "school", title: "Η πρώτη σου μέρα στο σχολείο" },
  { key: "locked", title: "Κλειδωμένο" },
];

const TYPED_CONTENT: Record<string, any> = {
  cover: {
    child_name: "Αριάδνη",
  },
  first_moments: {
    first_hold: "Ήμουν τόσο νευρική που τρεμούλιαζαν τα χέρια μου. Και μετά με κοίταξες και όλα σταμάτησαν.",
    weight: "3.4 κιλά",
    height: "51 εκ",
    first_smile: "Ήταν νύχτα. Σε κοιτούσα και ξαφνικά χαμογέλασες. Δεν κοιμήθηκα καθόλου από τη χαρά μου.",
    first_home: "Κάθισα και σε κοιτούσα για ώρες. Δεν μπορούσα να πιστέψω ότι ήσουν εδώ.",
  },
  your_world: {
    parents: "Εγώ και ο μπαμπάς σου. Οι δύο άνθρωποι που σε αγαπούν περισσότερο από οτιδήποτε άλλο.",
    grandparents: "Τέσσερις άνθρωποι που σε περίμεναν με αγωνία και σε λατρεύουν από την πρώτη στιγμή.",
    godparents: "Η καλύτερή μου φίλη, που ορκίστηκε να σε χαλάει με δώρα.",
  },
  first_achievements: {
    first_tooth: "Έκλαιγες τρεις νύχτες. Εγώ μαζί σου.",
    first_crawl: "Μια Κυριακή πρωί. Ο μπαμπάς σου έτρεξε να πάρει το κινητό για να σε φωτογραφίσει.",
    first_stand: "Κρατήθηκες από τον καναπέ και κοίταξες τριγύρω σαν να είπες το κατάφερα.",
    first_run: "Εκεί έλιωσα εντελώς.",
  },
  first_steps: {
    first_play: "Στον παιδότοπο. Στεκόσουν και τα κοιτούσες πρώτα. Μετά μπήκες κατευθείαν στο παιχνίδι σαν να τα ήξερες χρόνια.",
    first_friend: "Ένα αγοράκι στη γειτονιά. Μοιραζόσασταν τα παιχνίδια χωρίς καμία διαπραγμάτευση.",
    excited: "Η πρώτη φορά που είδες θάλασσα. Δεν ήθελες να φύγεις.",
    scared: "Ο ήχος της ηλεκτρικής σκούπας. Για μήνες.",
    growing_up: "Όταν άρχισες να με διορθώνεις.",
  },
  moments: {
    proud: "Η πρώτη φορά που είπες μαμά με σιγουριά και με κοίταξες στα μάτια.",
    small_big: "Όταν μου έφερες ένα λουλούδι από τον κήπο. Ήταν τσαλακωμένο και ήταν τέλειο.",
    hug: "Κάθε βράδυ πριν κοιμηθείς. Σφίγγεσαι τόσο δυνατά.",
    happiness: "Μια απλή Κυριακή στο σπίτι που παίζαμε όλοι μαζί στο πάτωμα.",
  },
  hard_days: {
    hard_day: "Όταν ήσουν άρρωστη και έκλαιγες όλη νύχτα και δεν ήξερα τι να κάνω.",
    broke_down: "Όταν έπεσες και χτύπησες στον παιδότοπο. Έμεινα ήρεμη μπροστά σου αλλά έκλαψα μετά.",
    difficult: "Οι νύχτες χωρίς ύπνο τον πρώτο χρόνο.",
    continued: "Γιατί κάθε πρωί με κοιτούσες και χαμογελούσες και όλα ξεχνιόνταν.",
  },
  birthdays: [
    {
      year: 1,
      with: "Τον μπαμπά, τη γιαγιά και τον παππού",
      wish: "Να είσαι πάντα τόσο χαρούμενη όσο είσαι σήμερα.",
    },
    {
      year: 2,
      with: "Όλη την οικογένεια και τις πρώτες σου φίλες",
      wish: "Να συνεχίσεις να χαμογελάς έτσι.",
    },
    {
      year: 3,
      with: "Τα παιδάκια από τον παιδικό",
      wish: "Κάθε χρόνο σε βλέπω να μεγαλώνεις και να με εκπλήσσεις.",
    },
  ],
  school: {
    i_felt: "Περήφανη και λυπημένη ταυτόχρονα.",
    you_looked: "Λίγο φοβισμένη αλλά περίεργη.",
    left_you: "Γύρισες και μου έκανες νόημα με το χεράκι σου. Έκλαψα στο αμάξι.",
    thought: "Ότι χθες ήσουν μωρό και σήμερα πας σχολείο.",
    saw_again: "Μου είπες ότι έκανες μια φίλη που λέγεται Μαρία.",
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

export default function FirstYearsPreviewPage() {
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
            <h1 className="text-3xl font-script text-[#8B5E3C] mb-4">Τα πρώτα χρόνια ζωής σου</h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882]">🍼</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>
            <div className="w-full max-w-xs mb-6">
              <p className="text-xs tracking-widest uppercase text-[#B09880] mb-2">Όνομα</p>
              <div className="border-b-2 border-dotted border-[#C4A882] py-1 text-sm font-light">
                <TypedText text={TYPED_CONTENT.cover.child_name} delay={500} />
              </div>
            </div>
            <img src="/preview/first-years/baby-cover.jpeg" alt="Baby Cover" className={imgClass} />
          </div>
        );

      case "first_moments":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι πρώτες σου στιγμές</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <img src="/preview/first-years/baby-first-moments-1.jpeg" alt="" className={imgClass} />
              <img src="/preview/first-years/baby-first-moments-2.jpeg" alt="" className={imgClass} />
            </div>
            <Field label="Η πρώτη φορά που σε κράτησα" value={TYPED_CONTENT.first_moments.first_hold} delay={200} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ζύγιζες" value={TYPED_CONTENT.first_moments.weight} delay={800} />
              <Field label="Ύψος" value={TYPED_CONTENT.first_moments.height} delay={1000} />
            </div>
            <Field label="Η πρώτη φορά που χαμογέλασες" value={TYPED_CONTENT.first_moments.first_smile} delay={1400} />
            <Field label="Οι πρώτες στιγμές στο σπίτι μας" value={TYPED_CONTENT.first_moments.first_home} delay={2000} />
          </div>
        );

      case "your_world":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Ο κόσμος σου</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <img src="/preview/first-years/baby-world-1.jpeg" alt="" className={imgClass} />
              <img src="/preview/first-years/baby-world-2.jpeg" alt="" className={imgClass} />
            </div>
            <Field label="Οι γονείς σου" value={TYPED_CONTENT.your_world.parents} delay={200} />
            <Field label="Γιαγιάδες & Παππούδες" value={TYPED_CONTENT.your_world.grandparents} delay={800} />
            <Field label="Νονός/α" value={TYPED_CONTENT.your_world.godparents} delay={1400} />
          </div>
        );

      case "first_achievements":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι πρώτες σου κατακτήσεις</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <img src="/preview/first-years/baby-achievements-1.jpeg" alt="" className={imgClass} />
              <img src="/preview/first-years/baby-achievements-2.jpeg" alt="" className={imgClass} />
            </div>
            <Field label="Το πρώτο σου δοντάκι (και το πρώτο μου ξενύχτι 😅)" value={TYPED_CONTENT.first_achievements.first_tooth} delay={200} />
            <Field label="Η πρώτη φορά που μπουσούλησες" value={TYPED_CONTENT.first_achievements.first_crawl} delay={800} />
            <Field label="Η πρώτη φορά που σηκώθηκες όρθια" value={TYPED_CONTENT.first_achievements.first_stand} delay={1400} />
            <Field label="Η πρώτη φορά που έτρεξες προς το μέρος μου (εκεί... έλιωσα ❤️)" value={TYPED_CONTENT.first_achievements.first_run} delay={2000} />
          </div>
        );

      case "first_steps":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα πρώτα σου βήματα προς τον κόσμο</h2>
            <img src="/preview/first-years/baby-steps-1.jpeg" alt="" className={`${imgClass} mb-4`} />
            <Field label="Η πρώτη φορά που έπαιξες με άλλα παιδάκια" value={TYPED_CONTENT.first_steps.first_play} delay={200} />
            <Field label="Η πρώτη σου φιλία (όπως την είδα εγώ)" value={TYPED_CONTENT.first_steps.first_friend} delay={800} />
            <Field label="Κάτι που σε ενθουσίασε πολύ" value={TYPED_CONTENT.first_steps.excited} delay={1400} />
            <Field label="Κάτι που σε φόβισε" value={TYPED_CONTENT.first_steps.scared} delay={2000} />
            <Field label="Η στιγμή που κατάλαβα ότι μεγαλώνεις" value={TYPED_CONTENT.first_steps.growing_up} delay={2600} />
          </div>
        );

      case "moments":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Στιγμές που με έκανες να νιώθω τα πάντα</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <img src="/preview/first-years/baby-moments-1.jpeg" alt="" className={imgClass} />
              <img src="/preview/first-years/baby-moments-2.jpeg" alt="" className={imgClass} />
            </div>
            <Field label="Η στιγμή που ένιωσα περήφανη για σένα" value={TYPED_CONTENT.moments.proud} delay={200} />
            <Field label="Κάτι μικρό που για μένα ήταν τεράστιο" value={TYPED_CONTENT.moments.small_big} delay={800} />
            <Field label="Μια αγκαλιά που δεν ήθελα να τελειώσει" value={TYPED_CONTENT.moments.hug} delay={1400} />
            <Field label="Η στιγμή που σκέφτηκα αυτό είναι η ευτυχία" value={TYPED_CONTENT.moments.happiness} delay={2000} />
          </div>
        );

      case "hard_days":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι μέρες που δεν ήταν εύκολες αλλά ήταν δικές μας</h2>
            <img src="/preview/first-years/baby-hard-days.jpeg" alt="" className={`${imgClass} mb-4`} />
            <Field label="Μια μέρα που ένιωσα ότι δεν τα καταφέρνω" value={TYPED_CONTENT.hard_days.hard_day} delay={200} />
            <Field label="Μια στιγμή που λύγισα (αλλά δεν το έδειξα)" value={TYPED_CONTENT.hard_days.broke_down} delay={800} />
            <Field label="Κάτι που με δυσκόλεψε περισσότερο απ' όσο περίμενα" value={TYPED_CONTENT.hard_days.difficult} delay={1400} />
            <Field label="Και παρ' όλα αυτά... συνέχισα γιατί" value={TYPED_CONTENT.hard_days.continued} delay={2000} />
          </div>
        );

      case "birthdays":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα γενέθλιά σου 🎉</h2>
            <img src="/preview/first-years/baby-birthday.jpeg" alt="" className={`${imgClass} mb-4`} />
            {TYPED_CONTENT.birthdays.map((birthday: any, index: number) => (
              <div key={birthday.year} className="bg-[#F9F2EC] rounded-2xl p-3 mb-3">
                <p className="text-sm font-serif text-[#8B5E3C] mb-2">{birthday.year} ετών 🎂</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-[#8B5E3C] mb-1">Έσβησες την τούρτα με:</p>
                    <div className="border-b-2 border-dotted border-[#C4A882] py-1 text-sm font-light min-h-[24px]">
                      <TypedText text={birthday.with} delay={index * 1000 + 300} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#8B5E3C] mb-1">Η ευχή μου για σένα:</p>
                    <div className="border-b-2 border-dotted border-[#C4A882] py-1 text-sm font-light min-h-[24px]">
                      <TypedText text={birthday.wish} delay={index * 1000 + 800} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "school":
        return (
          <div className="h-full overflow-y-auto px-6 py-4 relative">
            <div className="absolute top-2 right-2 bg-[rgba(139,94,60,0.15)] text-[#8B5E3C] text-xs px-3 py-1 rounded-full font-light tracking-widest uppercase">
              Preview
            </div>
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η πρώτη σου μέρα στο σχολείο</h2>
            <img src="/preview/first-years/baby-school.jpeg" alt="" className={`${imgClass} mb-4`} />
            <Field label="Και εγώ ένιωσα" value={TYPED_CONTENT.school.i_felt} delay={200} />
            <Field label="Εσύ έδειχνες" value={TYPED_CONTENT.school.you_looked} delay={800} />
            <Field label="Η στιγμή που σε άφησα" value={TYPED_CONTENT.school.left_you} delay={1400} />
            <Field label="Η σκέψη που δεν έφυγε από το μυαλό μου" value={TYPED_CONTENT.school.thought} delay={2000} />
            <Field label="Όταν σε ξαναείδα" value={TYPED_CONTENT.school.saw_again} delay={2600} />
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
              <p className="text-xs text-[#8B5E3C] font-serif mb-2">Περιλαμβάνει επίσης:</p>
              <ul className="space-y-1 text-xs text-[#7A6055] font-light">
                <li>✦ Η προσωπικότητά σου</li>
                <li>✦ Για σένα όταν μεγαλώσεις</li>
                <li>✦ Ένα γράμμα για σένα</li>
                <li>✦ Προσωποποιημένο παραμύθι</li>
              </ul>
            </div>
            <Link
              href="/checkout?template=first-years"
              className="block w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all mb-3"
            >
              ✨ Δημιούργησε το δικό σου
            </Link>
            <Link
              href="/checkout?template=first-years&gift=true"
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
