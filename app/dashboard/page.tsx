"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TEMPLATE_INFO: Record<string, any> = {
  "first-years": {
    emoji: "🍼",
    name: "Τα Πρώτα Χρόνια",
    hasStory: true,
    color: "from-[#C49090] to-[#D4ACAC]",
    bookPath: "memory-box",
  },
  "me-and-you": {
    emoji: "💑",
    name: "Εγώ & Εσύ",
    hasStory: true,
    color: "from-[#C4A882] to-[#D4BC98]",
    bookPath: "memory-box-couple",
  },
  "our-wedding": {
    emoji: "💍",
    name: "Ο Γάμος Μας",
    hasStory: false,
    color: "from-[#D4B8A8] to-[#E8CCC0]",
    bookPath: "memory-box-wedding",
  },
  "travel": {
    emoji: "✈️",
    name: "Travel Memory Box",
    hasStory: false,
    color: "from-[#2C5F8A] to-[#4A8AB4]",
    bookPath: "memory-box-travel",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [memoryBoxes, setMemoryBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);
    await loadMemoryBoxes(user.id);
    await checkReviewPopup(user.id);
  };

  const loadMemoryBoxes = async (userId: string) => {
    const { data } = await supabase
      .from("memory_boxes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setMemoryBoxes(data);
    setLoading(false);
  };

  const checkReviewPopup = async (userId: string) => {
    const { data } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (!data || data.length === 0) {
      setTimeout(() => setShowReviewPopup(true), 1500);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center">
        <p className="text-[#B09880] font-light">Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F2EC]">

      {/* Review Popup */}
      {showReviewPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-6"
          onClick={() => setShowReviewPopup(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-4">💛</div>
            <h2 className="text-2xl font-serif text-[#8B5E3C] mb-3">Πώς σας φάνηκε;</h2>
            <div className="flex items-center justify-center gap-2 my-4">
              <div className="w-8 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882] text-xs">✦</span>
              <div className="w-8 h-px bg-[#C4A882] opacity-40" />
            </div>
            <p className="text-sm font-light text-[#7A6055] leading-relaxed mb-6">
              Η εμπειρία σας μετράει πολύ για εμάς! Αφιερώστε ένα λεπτό για να μας πείτε τη γνώμη σας. 🌸
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/review")}
                className="block w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all"
              >
                ✨ Αφήστε μας ένα Review
              </button>
              <button
                onClick={() => setShowReviewPopup(false)}
                className="block w-full py-4 bg-[#F2E8DE] text-[#8B5E3C] rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all"
              >
                Αργότερα
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="My Little Memory Box" className="w-16 h-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-xs text-[#B09880] font-light hidden md:block">
              {user?.email}
            </p>
            <button
              onClick={handleLogout}
              className="text-xs font-light tracking-widest uppercase text-[#C47878] hover:text-[#8B5E3C] transition-colors"
            >
              Αποσύνδεση
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-[#8B5E3C] mb-3">Καλώς ήρθατε!</h1>
          <div className="flex items-center justify-center gap-2 my-4">
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            <span className="text-[#C4A882] text-xs">✦</span>
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          </div>
          <p className="text-[#B09880] font-light">Τα Memory Boxes σας</p>
        </div>

        {memoryBoxes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-[#B09880] font-light mb-6">Δεν έχετε ακόμα Memory Box</p>
            <Link
              href="/#boxes"
              className="inline-block px-8 py-3 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all"
            >
              Αγοράστε το πρώτο σας Memory Box
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {memoryBoxes.map((box) => {
              const info = TEMPLATE_INFO[box.template_id] || {};
              return (
                <div key={box.id} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                  <div className={`h-2 bg-gradient-to-r ${info.color}`} />
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{info.emoji}</span>
                      <div>
                        <h3 className="font-serif text-lg text-[#5C3820]">{info.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-light ${
                          box.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : "bg-[#F2E8DE] text-[#C4A882]"
                        }`}>
                          {box.status === "completed" ? "Ολοκληρωμένο" : "Σε εξέλιξη"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Link
                        href={`/${info.bookPath}/${box.id}`}
                        className="block w-full py-3 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-xs hover:opacity-90 hover:-translate-y-0.5 transition-all text-center"
                      >
                        📖 Συμπλήρωσε το Memory Box
                      </Link>
                      {info.hasStory && (
                        <>
                          <Link
                            href={`/story-details/${box.id}`}
                            className="block w-full py-3 bg-[#F2E8DE] text-[#8B5E3C] rounded-full font-light uppercase tracking-wider text-xs hover:opacity-90 hover:-translate-y-0.5 transition-all text-center"
                          >
                            ✨ Στοιχεία Παραμυθιού
                          </Link>
                          <Link
                            href={`/my-story/${box.id}`}
                            className="block w-full py-3 bg-[#F2E8DE] text-[#8B5E3C] rounded-full font-light uppercase tracking-wider text-xs hover:opacity-90 hover:-translate-y-0.5 transition-all text-center"
                          >
                            📚 Το Παραμύθι μου
                          </Link>
                        </>
                      )}
                      <Link
                        href={`/download/${box.id}`}
                        className="block w-full py-3 bg-[#C4A882] text-white rounded-full font-light uppercase tracking-wider text-xs hover:opacity-90 hover:-translate-y-0.5 transition-all text-center"
                      >
                        ⬇️ Download PDF
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="bg-[#F2E8DE] py-8 px-6 text-center border-t border-[rgba(196,168,130,0.2)] mt-12">
        <p className="text-xs font-light text-[#B09880]">
          © 2025 My Little Memory Box - Όλα τα δικαιώματα διατηρούνται
        </p>
      </footer>
    </div>
  );
}
