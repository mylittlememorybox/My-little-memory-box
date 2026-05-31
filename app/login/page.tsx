"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const giftToken = searchParams.get("gift_token");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!formData.email || !formData.password) {
      setError("Παρακαλώ συμπληρώστε όλα τα πεδία.");
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError("Λάθος email ή κωδικός. Δοκιμάστε ξανά.");
        return;
      }
if (giftToken && authData.user) {
  await fetch("/api/claim-gift", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      giftToken,
      userId: authData.user.id,
    }),
  });
}

router.push("/dashboard");

    } catch (err) {
      setError("Σφάλμα κατά τη σύνδεση. Δοκιμάστε ξανά.");
    } finally {
      setLoading(false);
    }
  };

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
          {giftToken && (
            <div className="bg-[#F2E8DE] rounded-full py-2 px-6 mb-6 text-sm text-[#C4A882] font-light tracking-widest uppercase">
              🎁 Σύνδεση για το δώρο σας
            </div>
          )}
          <h1 className="text-4xl font-serif text-[#8B5E3C] mb-4">
            Σύνδεση
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            <span className="text-[#C4A882] text-xs">✦</span>
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="space-y-4 mb-8">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-5 py-4 rounded-full border border-[#C4A882] text-[#7A6055] font-light focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]"
            />
            <input
              type="password"
              placeholder="Κωδικός"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-5 py-4 rounded-full border border-[#C4A882] text-[#7A6055] font-light focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-red-600 text-sm font-light">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 mb-4"
          >
            {loading ? "Σύνδεση..." : "Σύνδεση"}
          </button>

          <Link
            href="/forgot-password"
            className="block w-full py-3 text-center text-[#C4A882] text-sm font-light hover:text-[#8B5E3C] transition-colors"
          >
            Ξεχάσατε τον κωδικό σας;
          </Link>
        </div>

        <div className="bg-[#F2E8DE] rounded-3xl p-6 mt-6 text-center">
          <p className="text-sm text-[#7A6055] font-light mb-4">
            Δεν έχετε λογαριασμό;
          </p>
          <div className="space-y-3">
            <Link
              href="/#boxes"
              className="block w-full py-3 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-xs hover:opacity-90 transition-all"
            >
              🛍️ Αγοράστε ένα Memory Box
            </Link>
            <Link
              href={giftToken ? `/register?gift_token=${giftToken}` : "/register"}
              className="block w-full py-3 bg-white text-[#8B5E3C] rounded-full font-light uppercase tracking-wider text-xs hover:opacity-90 transition-all border border-[#C4A882]"
            >
              📝 Έχετε κάνει αγορά; Εγγραφείτε
            </Link>
          </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center"><p className="text-[#B09880]">Φόρτωση...</p></div>}>
      <LoginContent />
    </Suspense>
  );
}
