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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!email) {
      setError("Παρακαλω εισαγετε το email σας.");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: "https://mylittlememorybox.gr/reset-password",
        }
      );

      if (resetError) {
        setError("Σφαλμα κατα την αποστολη. Δοκιμαστε ξανα.");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Σφαλμα κατα την αποστολη. Δοκιμαστε ξανα.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-6">✉️</div>
          <h2 className="text-3xl font-serif text-[#8B5E3C] mb-4">
            Ελεγξτε το email σας!
          </h2>
          <p className="text-[#7A6055] font-light leading-relaxed mb-6">
            Σας στειλαμε οδηγιες ανακτησης κωδικου στο <strong>{email}</strong>. Πατηστε τον συνδεσμο για να ορισετε νεο κωδικο.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all"
          >
            Επιστροφη στη Συνδεση
          </Link>
        </div>
      </div>
    );
  }

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
            Ανακτηση Κωδικου
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            <span className="text-[#C4A882] text-xs">✦</span>
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          </div>
          <p className="text-[#B09880] font-light mt-6 text-sm leading-relaxed">
            Εισαγετε το email σας και θα σας στειλουμε οδηγιες για να ορισετε νεο κωδικο.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="space-y-4 mb-8">
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
            className="w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 mb-4"
          >
            {loading ? "Αποστολη..." : "Αποστολη Οδηγιων"}
          </button>

          <Link
            href="/login"
            className="block w-full py-3 text-center text-[#C4A882] text-sm font-light hover:text-[#8B5E3C] transition-colors"
          >
            Επιστροφη στη Συνδεση
          </Link>
        </div>
      </div>

      <footer className="bg-[#F2E8DE] py-8 px-6 text-center border-t border-[rgba(196,168,130,0.2)] mt-12">
        <p className="text-xs font-light text-[#B09880]">
          © 2025 My Little Memory Box - Ολα τα δικαιωματα διατηρουνται
        </p>
      </footer>
    </div>
  );
}
