"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ADMIN_EMAIL = "info@mylittlememorybox.gr";

const TEMPLATE_NAMES: Record<string, string> = {
  "first-years": "Τα Πρώτα Χρόνια 🍼",
  "me-and-you": "Εγώ & Εσύ 💑",
  "our-wedding": "Ο Γάμος Μας 💍",
  "travel": "Travel Memory Box ✈️",
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<"pending" | "approved">("pending");

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        window.location.href = "/";
        return;
      }
      setIsAdmin(true);
      loadReviews();
    };
    checkAdmin();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    await supabase
      .from("reviews")
      .update({ approved: true })
      .eq("id", id);
    loadReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Σίγουρα θέλεις να διαγράψεις αυτή την αξιολόγηση;")) return;
    await supabase
      .from("reviews")
      .delete()
      .eq("id", id);
    loadReviews();
  };

  const filtered = reviews.filter(r => filter === "pending" ? !r.approved : r.approved);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#F9F2EC]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="Logo" className="w-14 h-auto" />
          </Link>
          <p className="text-xs tracking-widest uppercase text-[#8B5E3C]">Admin — Αξιολογήσεις</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-[#8B5E3C] mb-2">Διαχείριση Αξιολογήσεων</h1>
          <p className="text-sm text-[#B09880] font-light">
            Εκκρεμείς: {reviews.filter(r => !r.approved).length} · 
            Εγκεκριμένες: {reviews.filter(r => r.approved).length}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 justify-center mb-8">
          <button
            onClick={() => setFilter("pending")}
            className={`px-6 py-2 rounded-full text-xs font-light tracking-wider uppercase transition-all ${
              filter === "pending"
                ? "bg-[#C49090] text-white"
                : "bg-white text-[#8B5E3C] border border-[#C4A882]"
            }`}
          >
            Εκκρεμείς ({reviews.filter(r => !r.approved).length})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-6 py-2 rounded-full text-xs font-light tracking-wider uppercase transition-all ${
              filter === "approved"
                ? "bg-[#C49090] text-white"
                : "bg-white text-[#8B5E3C] border border-[#C4A882]"
            }`}
          >
            Εγκεκριμένες ({reviews.filter(r => r.approved).length})
          </button>
        </div>

        {loading ? (
          <p className="text-center text-[#B09880] font-light">Φόρτωση...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center bg-white rounded-3xl p-12 shadow-sm">
            <p className="text-4xl mb-4">✨</p>
            <p className="text-[#B09880] font-light">
              {filter === "pending" ? "Δεν υπάρχουν εκκρεμείς αξιολογήσεις!" : "Δεν υπάρχουν εγκεκριμένες αξιολογήσεις ακόμα."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((review) => (
              <div key={review.id} className="bg-white rounded-3xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-normal text-[#5C3820] mb-1">{review.name}</p>
                    <p className="text-xs text-[#C4A882]">{TEMPLATE_NAMES[review.template_id] || review.template_id}</p>
                    <p className="text-xs text-[#B09880] mt-1">
                      {new Date(review.created_at).toLocaleDateString("el-GR")}
                    </p>
                  </div>
                  <p className="text-lg">{"⭐".repeat(review.rating)}</p>
                </div>

                <p className="text-sm font-light text-[#7A6055] leading-relaxed italic mb-4">
                  "{review.content}"
                </p>

                <div className="flex gap-3">
                  {!review.approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="px-6 py-2 bg-[#C49090] text-white rounded-full text-xs font-light uppercase tracking-wider hover:opacity-90 transition-all"
                    >
                      ✅ Έγκριση
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="px-6 py-2 bg-red-100 text-red-500 rounded-full text-xs font-light uppercase tracking-wider hover:opacity-90 transition-all"
                  >
                    🗑️ Διαγραφή
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
