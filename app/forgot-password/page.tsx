"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email) { setError("Παρακαλώ εισάγετε το email σας."); return; }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://mylittlememorybox.gr/reset-password",
    });
    if (resetError) {
      console.error("Reset password error:", resetError);
      setError(resetError.message || "Σφάλμα. Δοκιμάστε ξανά.");
    } else {
      setSent(true);
    }
    setLoading(false);
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
          <h1 className="text-4xl font-serif text-[#8B5E3C] mb-4">
            Ξεχάσατε τον Κωδικό;
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            <span className="text-[#C4A882] text-xs">✦</span>
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-4xl">📧</p>
              <p className="text-[#7A6055] font-light">
                Σας στείλαμε email με οδηγίες επαναφοράς κωδικού!
              </p>
              <p className="text-sm text-[#B09880] font-light">
                Ελέγξτε και τα spam/ανεπιθύμητα!
              </p>
              <Link
                href="/login"
                className="inline-block px-8 py-3 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all mt-4"
              >
                Επιστροφή στη Σύνδεση
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#B09880] font-light mb-6 text-center">
                Εισάγετε το email σας και θα σας στείλουμε οδηγίες για να ορίσετε νέο κωδικό.
              </p>
              <div className="space-y-4 mb-6">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                className="w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {loading ? "Αποστολή..." : "Αποστολή Email"}
              </button>
              <Link
                href="/login"
                className="block w-full py-3 text-center text-[#C4A882] text-sm font-light hover:text-[#8B5E3C] transition-colors mt-4"
              >
                Επιστροφή στη Σύνδεση
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
