"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ReviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [hasBox, setHasBox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState("");

  const TEMPLATE_NAMES: Record<string, string> = {
    "first-years": "Τα Πρώτα Χρόνια 🍼",
    "me-and-you": "Εγώ & Εσύ 💑",
    "our-wedding": "Ο Γάμος Μας 💍",
    "travel": "Travel Memory Box ✈️",
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setName(user.user_metadata?.full_name || "");

      // Έλεγξε αν έχει αγορασμένο Memory Box
      const { data: boxes } = await supabase
        .from("memory_boxes")
        .select("id, template_id")
        .eq("user_id", user.id)
        .limit(1);

      if (boxes && boxes.length > 0) {
        setHasBox(true);
        setTemplateId(boxes[0].template_id);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (!content) { setError("Παρακαλώ γράψτε την αξιολόγησή σας."); return; }
    if (!name) { setError("Παρακαλώ εισάγετε το όνομά σας."); return; }

    setSubmitting(true);
    const { error: insertError } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        name,
        template_id: templateId,
        rating,
        content,
        approved: false,
      });

    if (insertError) {
      setError("Σφάλμα κατά την υποβολή. Δοκιμάστε ξανά.");
    } else {
      setDone(true);
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center">
      <p className="text-[#B09880] font-light">Φόρτωση...</p>
    </div>
  );

  if (!hasBox) return (
    <div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-serif text-[#8B5E3C] mb-4">Μόνο για αγοραστές</h1>
        <p className="text-[#B09880] font-light mb-6">Πρέπει να έχετε αγοράσει ένα Memory Box για να αφήσετε αξιολόγηση.</p>
        <Link href="/#boxes" className="inline-block px-8 py-3 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all">
          Δείτε τα Memory Box
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F2EC]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-6 flex justify-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="My Little Memory Box" className="w-24 h-auto object-contain" />
          </Link>
        </div>
      </header>

      <div className="pt-12 pb-20 px-6 max-w-xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest uppercase text-[#C4A882] mb-3">Η γνώμη σας μετράει</p>
          <h1 className="text-4xl font-serif text-[#8B5E3C] mb-4">Αφήστε μια Αξιολόγηση</h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            <span className="text-[#C4A882] text-xs">✦</span>
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          {done ? (
            <div className="text-center space-y-4">
              <div className="text-6xl">💛</div>
              <h2 className="text-2xl font-serif text-[#8B5E3C]">Ευχαριστούμε!</h2>
              <p className="text-[#7A6055] font-light">Η αξιολόγησή σας υποβλήθηκε και θα δημοσιευτεί σύντομα!</p>
              <Link href="/dashboard" className="inline-block px-8 py-3 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all mt-4">
                Επιστροφή στο Dashboard
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#C4A882] mb-3">Όνομα</p>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Το όνομά σας"
                    className="w-full px-5 py-4 rounded-full border border-[#C4A882] text-[#7A6055] font-light focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]"
                  />
                </div>

                <div>
                  <p className="text-xs tracking-widest uppercase text-[#C4A882] mb-3">Memory Box</p>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="w-full px-5 py-4 rounded-full border border-[#C4A882] text-[#7A6055] font-light focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]"
                  >
                    {Object.entries(TEMPLATE_NAMES).map(([key, val]) => (
                      <option key={key} value={key}>{val}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs tracking-widest uppercase text-[#C4A882] mb-3">Βαθμολογία</p>
                  <div className="flex gap-3 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-3xl transition-transform hover:scale-110"
                      >
                        {star <= rating ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs tracking-widest uppercase text-[#C4A882] mb-3">Η εμπειρία σας</p>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Πείτε μας για την εμπειρία σας με το Memory Box..."
                    rows={5}
                    className="w-full px-5 py-4 rounded-2xl border border-[#C4A882] text-[#7A6055] font-light focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC] resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 my-4">
                  <p className="text-red-600 text-sm font-light">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all disabled:opacity-50 mt-6"
              >
                {submitting ? "Υποβολή..." : "✨ Υποβολή Αξιολόγησης"}
              </button>
            </>
          )}
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
