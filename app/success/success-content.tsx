"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "normal";
  const sessionId = searchParams.get("session_id");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [memoryBoxId, setMemoryBoxId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      createMemoryBox();
    }
  }, [sessionId]);

  const createMemoryBox = async () => {
    try {
      const response = await fetch("/api/create-memory-box", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await response.json();
      if (data.memoryBoxId) {
        setMemoryBoxId(data.memoryBoxId);
      }
    } catch (error) {
      console.error("Error creating memory box:", error);
    }
  };

  const handleSendGift = async () => {
    if (!email) {
      alert("Παρακαλώ εισάγετε το email σας");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/send-gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, memoryBoxId }),
      });
      if (response.ok) {
        setSent(true);
      } else {
        alert("Σφάλμα κατά την αποστολή. Δοκιμάστε ξανά.");
      }
    } catch (error) {
      alert("Σφάλμα κατά την αποστολή. Δοκιμάστε ξανά.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F2EC]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-6 flex justify-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img
              src="/logo.png"
              alt="My Little Memory Box"
              className="w-24 h-auto object-contain"
            />
          </Link>
        </div>
      </header>

      <div className="pt-16 pb-20 px-6 max-w-xl mx-auto text-center">
        {type === "normal" ? (
          <>
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-serif text-[#8B5E3C] mb-4">
              Η αγορά σας ολοκληρώθηκε!
            </h1>
            <div className="flex items-center justify-center gap-2 my-6">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882] text-xs">✦</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>
            <p className="text-[#B09880] font-light mb-10 leading-relaxed">
              Είστε έτοιμοι να δημιουργήσετε το Memory Box σας. Δημιουργήστε τον λογαριασμό σας για να ξεκινήσετε!
            </p>
            <Link
              href="/register"
              className="inline-block px-10 py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all"
            >
              Δημιουργήστε τον λογαριασμό σας
            </Link>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6">🎁</div>
            <h1 className="text-4xl font-serif text-[#8B5E3C] mb-4">
              Η αγορά σας ολοκληρώθηκε!
            </h1>
            <div className="flex items-center justify-center gap-2 my-6">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882] text-xs">✦</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>

            {!sent ? (
              <>
                <p className="text-[#B09880] font-light mb-10 leading-relaxed">
                  Βάλτε το email του παραλήπτη για να λάβει το QR code του δώρου.
                </p>
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email παραλήπτη"
                    className="w-full px-5 py-4 rounded-full border border-[#C4A882] text-[#7A6055] font-light mb-4 focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]"
                  />
                  <button
                    onClick={handleSendGift}
                    disabled={loading || !memoryBoxId}
                    className="w-full py-4 bg-[#C47878] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {loading ? "Αποστολή..." : "🎁 Αποστολή QR code"}
                  </button>
                  {!memoryBoxId && (
                    <p className="text-xs text-[#B09880] mt-3">Φόρτωση...</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">✅</div>
                <p className="text-[#B09880] font-light mb-6 leading-relaxed">
                  Στείλαμε το QR code στον παραλήπτη! Μόλις το σκανάρει θα μπορεί να ξεκινήσει το Memory Box του.
                </p>
                <Link
                  href="/"
                  className="inline-block px-10 py-4 border-2 border-[#C49090] text-[#8B5E3C] rounded-full font-light uppercase tracking-widest text-xs hover:bg-[rgba(196,144,144,0.08)] transition-all"
                >
                  Επιστροφή στην αρχική
                </Link>
              </>
            )}
          </>
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
