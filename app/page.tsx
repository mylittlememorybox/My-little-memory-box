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

const TEMPLATE_NAMES: Record<string, string> = {
  "first-years": "Τα Πρώτα Χρόνια 🍼",
  "me-and-you": "Εγώ & Εσύ 💑",
  "our-wedding": "Ο Γάμος Μας 💍",
  "travel": "Travel Memory Box ✈️",
};

const FALLBACK_REVIEWS = [
  {
    id: "fallback-1",
    name: "Μαρία Κ",
    template_id: "travel",
    rating: 5,
    content: "Αγόρασα το Travel Memory Box για να μαζέψω όλες τις αναμνήσεις από τα ταξίδια μου και ειλικρινά δεν περίμενα να είναι τόσο ωραίο! Κάθε ταξίδι έχει τη δική του σελίδα — και οι passport σφραγίδες για κάθε προορισμό είναι απλά τέλειες! 🗺️✈️",
  }
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>(FALLBACK_REVIEWS);

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
    fetch("/api/get-reviews")
      .then((res) => res.text())
      .then((text) => {
        try {
          const data = JSON.parse(text);
          if (data.reviews && data.reviews.length > 0) {
            setReviews(data.reviews);
          }
        } catch (e) {
          // parsing error — μένει το fallback
        }
      })
      .catch(() => {
        // network error — μένει το fallback
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
      <ReviewsSection reviews={reviews} />
      <HowItWorksSection />
      <FAQSection />
      <Footer />
    </div>
  );
}

function Nav({ scrolled, user }: { scrolled: boolean; user: any }) {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-8 py-4 flex justify-center gap-40 transition-all ${
      scrolled ? "bg-[rgba(249,242,236,0.96)] backdrop-blur-md shadow-sm" : ""
    }`}>
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
        <Link href="#boxes" className="inline-block px-10 py-4 border-2 border-[#C49090] text-[#8B5E3C] rounded-full font-light uppercase tracking-widest text-xs hover:bg-[rgba(196,144,144,0.08)] transition-all">
          Δες τα Memory Boxes ↓
        </Link>
      </div>
      <div className="mt-14 flex flex-col items-center gap-2">
        <p className="text-[#B09880] text-xs tracking-wider uppercase">Scroll</p>
        <div className="w-px h-10 bg-gradient-to-b from-[#C4A882] to-transparent" />
      </div>
    </section>
  );
}

function TemplatesSection({ templates }: { templates: Template[] }) {
  return (
    <section id="boxes" className="py-20 px-6 bg-[#F2E8DE]">
      <div className="text-center mb-16">
        <p className="text-xs tracking-widest uppercase text-[#C4A882] mb-3 reveal">Τα λευκώματά μας</p>
        <h2 className="text-[#8B5E3C] font-serif text-4xl font-normal mb-4 reveal">Επίλεξε το Memory Box σου</h2>
        <div className="flex items-center justify-center gap-2 mt-4 reveal">
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          <span className="text-[#C4A882] text-xs">✦</span>
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 max-w-7xl mx-auto">
        {templates.map((box) => (
          <div key={box.id} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all reveal">
            <div className={`h-1 bg-gradient-to-r ${box.stripColor}`} />
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">{box.emoji}</div>
              <h3 className="text-2xl font-serif font-normal text-[#5C3820] mb-1">{box.name}</h3>
              <p className="text-xs tracking-widest uppercase text-[#B09880] mb-4">{box.tagline}</p>
              <p className="text-sm font-light text-[#7A6055] leading-relaxed text-left mb-4">{box.description}</p>
            </div>
            <hr className="h-px bg-[#C4A882] opacity-15 mx-7 my-5" />
            <ul className="px-7 space-y-1.5 text-sm font-light text-[#7A6055]">
              {box.features.map((feat, i) => (
                <li key={i} className="flex gap-2.5 border-b border-[rgba(196,168,130,0.12)] pb-1.5 last:border-b-0">
                  <div className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5" style={{ background: box.accentColor }} />
                  {feat}
                </li>
              ))}
            </ul>
            <div className="p-7 text-center border-t border-[rgba(196,168,130,0.15)]">
              <div className="text-2xl font-serif font-normal text-[#5C3820] mb-4">{box.price}</div>
              <div className="flex flex-col gap-2">
                <Link href={`/checkout?template=${box.id}`} className="block w-full py-3 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-xs hover:opacity-90 hover:-translate-y-0.5 transition-all text-center">
                  ✨ Δημιούργησε το δικό σου
                </Link>
                <Link href={`/checkout?template=${box.id}&gift=true`} className="block w-full py-3 bg-[#C47878] text-white rounded-full font-light uppercase tracking-wider text-xs hover:opacity-90 hover:-translate-y-0.5 transition-all text-center">
                  🎁 Κάντο Δώρο
                </Link>
                <Link href={box.previewPath} className="block w-full py-3 bg-white text-[#8B5E3C] rounded-full font-light uppercase tracking-wider text-xs hover:opacity-90 hover:-translate-y-0.5 transition-all text-center border border-[#C4A882]">
                  👁️ Δες ένα δείγμα
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReviewsSection({ reviews }: { reviews: any[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-[#F9F2EC]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase text-[#C4A882] mb-3 reveal">Αξιολογήσεις</p>
          <h2 className="text-[#8B5E3C] font-serif text-4xl font-normal mb-4 reveal">Τι λένε οι πελάτες μας</h2>
          <div className="flex items-center justify-center gap-2 mt-4 reveal">
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            <span className="text-[#C4A882] text-xs">✦</span>
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="bg-white rounded-3xl shadow-sm p-6 reveal">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-normal text-[#5C3820]">{review.name}</p>
                <p className="text-sm">{"⭐".repeat(review.rating)}</p>
              </div>
              {review.template_id && (
                <p className="text-xs text-[#C4A882] tracking-wider mb-3">
                  {TEMPLATE_NAMES[review.template_id]}
                </p>
              )}
              <p className="text-sm font-light text-[#7A6055] leading-relaxed">
                "{review.content}"
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/reviews" className="inline-block px-10 py-4 border-2 border-[#C49090] text-[#8B5E3C] rounded-full font-light uppercase tracking-widest text-xs hover:bg-[rgba(196,144,144,0.08)] transition-all">
            Δες όλες τις αξιολογήσεις →
          </Link>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="py-20 px-6 bg-[#F2E8DE] text-center">
      <p className="text-xs tracking-widest uppercase text-[#C4A882] mb-3 reveal">Απλά και γρήγορα</p>
      <h2 className="text-[#8B5E3C] font-serif text-4xl font-normal mb-2 reveal">Πώς λειτουργεί</h2>
      <div className="flex items-center justify-center gap-2 mt-4 mb-12 reveal">
        <div className="w-12 h-px bg-[#C4A882] opacity-40" />
        <span className="text-[#C4A882] text-xs">✦</span>
        <div className="w-12 h-px bg-[#C4A882] opacity-40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-2xl mx-auto">
        {[
          { num: "01", title: "Επίλεξε Memory Box", desc: "Διάλεξε αυτό που ταιριάζει στην περίσταση" },
          { num: "02", title: "Συμπλήρωσε το", desc: "Πρόσθεσε φωτογραφίες και λόγια αγάπης" },
          { num: "03", title: "Μοιράσου το", desc: "Λήψη PDF ή αποστολή ως ψηφιακό δώρο με QR code" },
        ].map((step) => (
          <div key={step.num} className="reveal">
            <div className="text-4xl font-serif font-light text-[rgba(196,168,130,0.35)] mb-2">{step.num}</div>
            <h3 className="text-[#8B5E3C] font-serif text-lg font-normal mb-2">{step.title}</h3>
            <p className="text-sm font-light text-[#B09880] leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-6 bg-[#F9F2EC]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase text-[#C4A882] mb-3 reveal">Βοήθεια</p>
          <h2 className="text-[#8B5E3C] font-serif text-4xl font-normal mb-4 reveal">Συχνές Ερωτήσεις</h2>
          <div className="flex items-center justify-center gap-2 mt-4 reveal">
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            <span className="text-[#C4A882] text-xs">✦</span>
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-sm p-8 reveal">
          {FAQ_PREVIEW.map((item, i) => (
            <div key={i} className="border-b border-[rgba(196,168,130,0.2)] last:border-0">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left py-5 flex items-center justify-between gap-4"
              >
                <span className="text-sm font-normal text-[#5C3820] leading-relaxed">{item.q}</span>
                <span className={`text-[#C4A882] text-lg flex-shrink-0 transition-transform duration-200 ${openIndex === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {openIndex === i && (
                <div className="pb-5 pr-8">
                  <p className="text-sm font-light text-[#7A6055] leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-8 reveal">
          <Link href="/faq" className="inline-block px-10 py-4 border-2 border-[#C49090] text-[#8B5E3C] rounded-full font-light uppercase tracking-widest text-xs hover:bg-[rgba(196,144,144,0.08)] transition-all">
            Δες όλες τις ερωτήσεις →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#F2E8DE] py-14 px-6 text-center border-t border-[rgba(196,168,130,0.2)]">
      <div className="font-script text-2xl text-[#8B5E3C] mb-1">My Little Memory Box</div>
      <p className="text-xs tracking-widest uppercase text-[#C4A882] mb-4">mylittlememorybox.gr</p>
      <hr className="w-16 mx-auto my-5 border-none h-px bg-[rgba(196,168,130,0.3)]" />
      <div className="flex justify-center gap-6 mb-4 text-xs text-[#B09880]">
        <Link href="/faq" className="hover:text-[#8B5E3C] transition-colors">Συχνές Ερωτήσεις</Link>
        <span>·</span>
        <Link href="/privacy" className="hover:text-[#8B5E3C] transition-colors">Πολιτική Απορρήτου</Link>
        <span>·</span>
        <Link href="/terms" className="hover:text-[#8B5E3C] transition-colors">Όροι Χρήσης</Link>
        <span>·</span>
        <Link href="/cookies" className="hover:text-[#8B5E3C] transition-colors">Cookies</Link>
      </div>
      <p className="text-xs font-light text-[#B09880] mb-2">© 2025 My Little Memory Box - Όλα τα δικαιώματα διατηρούνται</p>
      <a href="mailto:info@mylittlememorybox.gr" className="text-xs text-[#C4A882] hover:text-[#8B5E3C] block">
        info@mylittlememorybox.gr
      </a>
    </footer>
  );
}
