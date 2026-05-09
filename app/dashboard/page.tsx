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
    name: "Τα Πρωτα Χρονια",
    hasStory: true,
    color: "from-[#C49090] to-[#D4ACAC]",
  },
  "me-and-you": {
    emoji: "💑",
    name: "Εγω και Εσυ",
    hasStory: true,
    color: "from-[#C4A882] to-[#D4BC98]",
  },
  "our-wedding": {
    emoji: "💍",
    name: "Ο Γαμος Μας",
    hasStory: false,
    color: "from-[#D4B8A8] to-[#E8CCC0]",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [memoryBoxes, setMemoryBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    loadMemoryBoxes(user.id);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
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
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
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
              Αποσυνδεση
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-[#8B5E3C] mb-3">
            Καλως ηρθατε!
          </h1>
          <div className="flex items-center justify-center gap-2 my-4">
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            <span className="text-[#C4A882] text-xs">✦</span>
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          </div>
          <p className="text-[#B09880] font-light">
            Τα Memory Boxes σας
          </p>
        </div>

        {/* Memory Box Cards */}
        {memoryBoxes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-[#B09880] font-light mb-6">
              Δεν εχετε ακομα Memory Box
            </p>
            <Link
              href="/#boxes"
              className="inline-block px-8 py-3 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all"
            >
              Αγορασε το πρωτο σου Memory Box
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {memoryBoxes.map((box) => {
              const info = TEMPLATE_INFO[box.template_id] || {};
              return (
                <div
                  key={box.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                >
                  {/* Top Strip */}
                  <div className={`h-2 bg-gradient-to-r ${info.color}`} />

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{info.emoji}</span>
                      <div>
                        <h3 className="font-serif text-lg text-[#5C3820]">{info.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-light ${
                          box.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : "bg-[#F2E8DE] text-[#C4A882]"
                        }`}>
                          {box.status === "completed" ? "Ολοκληρωμενο" : "Σε εξελιξη"}
                        </span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-2">
                      {/* Memory Box */}
                      <Link
                        href={`/memory-box/${box.id}`}
                        className="block w-full py-3 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-xs hover:opacity-90 hover:-translate-y-0.5 transition-all text-center"
                      >
                        📖 Συμπληρωσε το Memory Box
                      </Link>

                      {/* Story (only for first-years and me-and-you) */}
                      {info.hasStory && (
                        <>
                          <Link
                            href={`/story-details/${box.id}`}
                            className="block w-full py-3 bg-[#F2E8DE] text-[#8B5E3C] rounded-full font-light uppercase tracking-wider text-xs hover:opacity-90 hover:-translate-y-0.5 transition-all text-center"
                          >
                            ✨ Στοιχεια Παραμυθιου
                          </Link>
                          <Link
                            href={`/my-story/${box.id}`}
                            className="block w-full py-3 bg-[#F2E8DE] text-[#8B5E3C] rounded-full font-light uppercase tracking-wider text-xs hover:opacity-90 hover:-translate-y-0.5 transition-all text-center"
                          >
                            📚 Το Παραμυθι μου
                          </Link>
                        </>
                      )}

                      {/* Download */}
                      {box.status === "completed" && (
                        <button
                          className="block w-full py-3 bg-[#C4A882] text-white rounded-full font-light uppercase tracking-wider text-xs hover:opacity-90 hover:-translate-y-0.5 transition-all text-center"
                        >
                          ⬇️ Download
                        </button>
                      )}
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
          © 2025 My Little Memory Box - Ολα τα δικαιωματα διατηρουνται
        </p>
      </footer>
    </div>
  );
}
