"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MyStoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [storyUrl, setStoryUrl] = useState("");

  useEffect(() => {
    loadStory();
  }, []);

  const loadStory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: box } = await supabase
      .from("memory_boxes")
      .select("*")
      .eq("id", params.id)
      .single();

    if (box) {
      setStatus(box.story_status || "pending");
      setStoryUrl(box.story_url || "");
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center">
        <p className="text-[#B09880] font-light">Φορτωση...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F2EC]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="My Little Memory Box" className="w-16 h-auto object-contain" />
          </Link>
          <Link href="/dashboard" className="text-xs font-light tracking-widest uppercase text-[#8B5E3C] hover:text-[#5C3820]">
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="pt-12 pb-20 px-6 max-w-xl mx-auto text-center">
        {status === "pending" && (
          <>
            <div className="text-7xl mb-8">✨</div>
            <h1 className="text-3xl font-serif text-[#8B5E3C] mb-4">
              Το Παραμυθι σας ετοιμαζεται!
            </h1>
            <div className="flex items-center justify-center gap-2 my-6">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882] text-xs">✦</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
              <div className="text-4xl mb-4">📖</div>
              <p className="text-[#7A6055] font-light leading-relaxed mb-4">
                Εχουμε λαβει τα στοιχεια σας και δημιουργουμε το προσωποποιημενο παραμυθι σας με αγαπη!
              </p>
              <p className="text-[#B09880] font-light text-sm leading-relaxed">
                Θα λαβετε email μολις ειναι ετοιμο. Η διαδικασια συνηθως διαρκει 2-3 εργασιμες ημερες.
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <div className="w-3 h-3 rounded-full bg-[#C49090] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-3 h-3 rounded-full bg-[#C4A882] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-3 h-3 rounded-full bg-[#D4B8A8] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>

            <div className="bg-[#F2E8DE] rounded-3xl p-6 text-left">
              <h3 className="font-serif text-[#8B5E3C] mb-4">Τι γινεται τωρα:</h3>
              <div className="space-y-3 text-sm font-light text-[#7A6055]">
                <div className="flex gap-3">
                  <span className="text-[#C49090]">✓</span>
                  <span>Ελαβαμε τα στοιχεια σας</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#C4A882]">⏳</span>
                  <span>Δημιουργουμε το παραμυθι σας</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#B09880]">○</span>
                  <span>Θα λαβετε email με το παραμυθι σας</span>
                </div>
              </div>
            </div>
          </>
        )}

        {status === "ready" && (
          <>
            <div className="text-7xl mb-8">🎉</div>
            <h1 className="text-3xl font-serif text-[#8B5E3C] mb-4">
              Το Παραμυθι σας ειναι ετοιμο!
            </h1>
            <div className="flex items-center justify-center gap-2 my-6">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882] text-xs">✦</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-[#7A6055] font-light leading-relaxed mb-6">
                Το παραμυθι σας ειναι ετοιμο! Μπορειτε να το κατεβασετε τωρα.
              </p>

              {storyUrl && (
                <a
                  href={storyUrl}
                  target="_blank"
                  className="block w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all text-center mb-4"
                >
                  📥 Κατεβαστε το Παραμυθι σας
                </a>
              )}
            </div>
          </>
        )}

        <Link
          href="/dashboard"
          className="inline-block px-8 py-3 border-2 border-[#C49090] text-[#8B5E3C] rounded-full font-light uppercase tracking-widest text-xs hover:bg-[rgba(196,144,144,0.08)] transition-all mt-4"
        >
          ← Επιστροφη στο Dashboard
        </Link>
      </div>

      <footer className="bg-[#F2E8DE] py-8 px-6 text-center border-t border-[rgba(196,168,130,0.2)] mt-12">
        <p className="text-xs font-light text-[#B09880]">
          © 2025 My Little Memory Box - Ολα τα δικαιωματα διατηρουνται
        </p>
      </footer>
    </div>
  );
}
