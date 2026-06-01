"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Template {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  price: string;
  stripColor: string;
  accentColor: string;
  previewPath: string;
}

const TEMPLATES: Template[] = [
  {
    id: "first-years",
    emoji: "🍼",
    name: "Τα Πρώτα Χρόνια",
    tagline: "Για τα πρώτα χρόνια ζωής του μωρού",
    description: "Κράτησε κάθε πρώτη φορά — το πρώτο χαμόγελο, τα πρώτα βήματα, τις πρώτες λέξεις.",
    features: [
      "Φωτογραφίες και αναμνήσεις ανά ενότητα",
      "Μήνυμα αγάπης από γονείς",
      "Timeline πρώτων στιγμών",
      "Προσωποποιημένο ebook παραμύθι",
      "Εκτυπώσιμο PDF",
    ],
    price: "29.99€",
    stripColor: "from-[#C49090] to-[#D4ACAC]",
    accentColor: "#C49090",
    previewPath: "/preview/first-years",
  },
  {
    id: "me-and-you",
    emoji: "💑",
    name: "Εγώ & Εσύ",
    tagline: "Η ιστορία του ζευγαριού μας",
    description: "Μια συλλογή από τις πιο ιδιαίτερες στιγμές της σχέσης μας.",
    features: [
      "Χρονολόγιο της σχέσης μας",
      "Αγαπημένες φωτογραφίες μαζί",
      "Μηνύματα αγάπης ο ένας για τον άλλο",
      "Προσωποποιημένο ebook παραμύθι",
      "Εκτυπώσιμο PDF",
    ],
    price: "29.99€",
    stripColor: "from-[#C4A882] to-[#D4BC98]",
    accentColor: "#C4A882",
    previewPath: "/preview/me-and-you",
  },
  {
    id: "our-wedding",
    emoji: "💍",
    name: "Ο Γάμος Μας",
    tagline: "Γεμάτος αναμνήσεις, σκέψεις και συναισθήματα",
    description: "Η πιο σημαντική μέρα της ζωής μας, σε κάθε λεπτομέρεια.",
    features: [
      "Συναισθήματα που μόνο οι φωτογραφίες δεν μπορούν να κρατήσουν ζωντανά",
      "Στιγμές που θέλουμε να θυμόμαστε",
      "Σκέψεις και αστεία γεγονότα που μόνο εμείς οι δύο ζήσαμε",
      "Εκτυπώσιμο PDF",
    ],
    price: "24.99€",
    stripColor: "from-[#D4B8A8] to-[#E8CCC0]",
    accentColor: "#D4B8A8",
    previewPath: "/preview/wedding",
  },
  {
    id: "travel",
    emoji: "✈️",
    name: "Travel Memory Box",
    tagline: "Κάθε ταξίδι — μια ιστορία",
    description: "Κράτησε τις αναμνήσεις από κάθε ταξίδι σου με σφραγίδες διαβατηρίου και templates για 20 προορισμούς.",
    features: [
      "20 ταξίδια με πλήρη templates",
      "Passport style σφραγίδες για κάθε προορισμό",
      "Φωτογραφίες, γεύσεις και αναμνήσεις",
      "Ταξιδιωτικό προφίλ & bucket list",
      "Εκτυπώσιμο PDF",
    ],
    price: "29.99€",
    stripColor: "from-[#2C5F8A] to-[#4A8AB4]",
    accentColor: "#2C5F8A",
    previewPath: "/preview/travel",
  },
];

const FAQ_PREVIEW = [
  {
    q: "Τι ακριβώς είναι τα Memory Box;",
    a: "Είναι ψηφιακά λευκώματα αναμνήσεων που συμπληρώνεις online με φωτογραφίες, κείμενα και συναισθήματα. Στο τέλος κατεβαίνουν ως PDF για να τα κρατήσεις για πάντα!",
  },
  {
    q: "Πόσο καιρό έχω για να συμπληρώσω το Memory Box μου;",
    a: "Έχεις απεριόριστο χρόνο για συμπλήρωση! Μόλις ολοκληρώσεις και θέλεις να κατεβάσεις το PDF, έχεις 30 ημέρες για download.",
  },
  {
    q: "Μετά την αγορά δώρου, βάζω το δικό μου email ή του παραλήπτη;",
    a: "Μπορείς να βάλεις οποιοδήποτε email θέλεις! Αν βάλεις το δικό σου, λαμβάνεις εσύ το QR και το στέλνεις μέσω Viber, WhatsApp ή SMS. Σημαντικό: να δημιουργήσει λογαριασμό ο παραλήπτης — όχι εσύ!",
  },
  {
    q: "Τι είναι το προσωποποιημένο ebook παραμύθι;",
    a: "Είναι ένα μοναδικό ψηφιακό παραμύθι που δημιουργούμε αποκλειστικά για εσένα! Περιλαμβάνεται στα Memory Box Τα Πρώτα Χρόνια και Εγώ & Εσύ.",
  },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-[#F9F2EC] text-[#7A6055] font-jost min-h-screen">
      <Nav scrolled={scrolled} user={user} />
      <HeroSection />
      <TemplatesSection templates={TEMPLATES} />
      <HowItWorksSection />
      <FAQSection />
      <Footer />
    </div>
  );
}

function Nav({ scrolled, user }: { scrolled: boolean; user: any }) {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-8 py-4 flex justify-center gap-40 transition-all ${
        scrolled ? "bg-[rgba(249,242,236,0.96)] backdrop-blur-md shadow-sm" : ""
      }`}
    >
      <div className="flex gap-40">
        <Link href="/" className="text-xs font-normal tracking-widest uppercase text-[#8B5E3C] hover:text-[#5C3820]">
          Αρχική
        </Link>
        <Link href={user ? "/dashboard" : "/login"} className="text-xs font-normal tracking-widest uppercase text-[#8B5E3C] hover:text-[#5C3820]">
          Λογαριασμός μου
        </Link>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="min-h-screen bg-[#F9F2EC] flex flex-col items-center justify-center pt-24 pb-20 px-7 relative overflow-hidden">
      <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-gradient-to-b from-[rgba(196,144,144,0.10)] to-transparent pointer-events-none" />
      <div className="mb-8 mt-4">
        <img src="/logo.png" alt="Logo" className="w-52 h-auto drop-shadow-lg" />
      </div>
      <h1 className="text-center text-[#8B5E3C] leading-tight max-w-3xl font-serif text-4xl md:text-5xl lg:text-6xl font-normal mt-4">
        Ένα μέρος για να κρατήσεις
        <br />
        όλες τις στιγμές που δεν
        <br />
        θέλεις να ξεχαστούν ποτέ.
      </h1>
      <div className="flex items-center gap-3 my-7">
        <div className="w-14 h-px bg-[#C4A882] opacity-50" />
        <span className="text-[#C4A882] text-xs">✦</span>
        <div className="w-14 h-px bg-[#C4A882] opacity-50" />
      </div>
      <p className="text-center text-[#B09880] max-w-sm leading-relaxed font-light text-base">
        Δημιούργησε το δικό σου Memory Box γεμάτο φωτογραφίες και λόγια αγάπης και χάρισε στο παιδί σου ένα προσωποποιημένο ebook παραμύθι.
      </p>
      <div className="mt-9">
        <Link
          href="#boxes"
          className="inline-block px-10 py-4 border-
