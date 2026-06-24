"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>(FALLBACK_REVIEWS);
  const [loading, setLoading] = useState(true);

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
          // μένει το fallback
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F2EC]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="Logo" className="w-14 h-auto" />
          </Link>
          <Link href="/" className="text-xs text-[#8B5E3C] uppercase tracking-widest hover:text-[#5C3820]">
            ← Αρχική
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase text-[#C4A882] mb-3">Αξιολογήσεις</p>
          <h1 className="text-4xl font-serif text-[#8B5E3C] mb-4">Τι λένε οι πελάτες μας</h1>
          <div className="flex items-center justify-center gap-2 my-4">
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            <span className="text-[#C4A882] text-xs">✦</span>
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          </div>
          {!loading && (
            <p className="text-sm text-[#B09880] font-light">{reviews.length} αξιολογήσεις</p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-[#B09880] font-light">Φόρτωση...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-3xl shadow-sm p-6">
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
        )}

        <div className="text-center mt-12">
          <Link href="/#boxes" className="inline-block px-10 py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-widest text-xs hover:opacity-90 transition-all">
            ✨ Δες τα Memory Boxes
          </Link>
        </div>
      </div>

      <footer className="bg-[#F2E8DE] py-8 px-6 text-center border-t border-[rgba(196,168,130,0.2)] mt-12">
        <p className="text-xs font-light text-[#B09880]">
          © 2025 My Little Memory Box - Όλα τα δικαιώματα διατηρούνται
        </p>
      </footer>
    </div>
  );
}
