"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (error) {
          setError("Ο σύνδεσμος έχει λήξει. Ζητήστε νέο.");
        } else {
          setReady(true);
        }
      });
    } else {
      setError("Μη έγκυρος σύνδεσμος. Ζητήστε νέο email επαναφοράς.");
    }
  }, []);

  const handleUpdate = async () => {
    setError("");
    if (!password || !confirm) { setError("Συμπληρώστε και τα δύο πεδία."); return; }
    if (password !== confirm) { setError("Οι κωδικοί δεν ταιριάζουν."); return; }
    if (password.length < 6) { setError("Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες."); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError("Σφάλμα. Δοκιμάστε ξανά.");
    } else {
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
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
            Νέος Κωδικός
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            <span className="text-[#C4A882] text-xs">✦</span>
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          {done ? (
            <div className="text-center space-y-4">
              <p className="text-4xl">✅</p>
              <p className="text-[#7A6055] font-light">Ο κωδικός άλλαξε επιτυχώς!</p>
              <p className="text-sm text-[#C4A882] font-light">Θα μεταφερθείτε στη σύνδεση αυτόματα...</p>
            </div>
          ) : !ready ? (
            <div className="text-center space-y-4">
              {error ? (
                <>
                  <p className="text-4xl">❌</p>
                  <p className="text-red-600 text-sm font-light">{error}</p>
                  <Link
                    href="/forgot-password"
                    className="inline-block px-8 py-3 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all mt-4"
                  >
                    Ζητήστε νέο email
                  </Link>
                </>
              ) : (
                <p className="text-[#B09880] font-light">⏳ Φόρτωση...</p>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <input
                  type="password"
                  placeholder="Νέος κωδικός"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-full border border-[#C4A882] text-[#7A6055] font-light focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]"
                />
                <input
                  type="password"
                  placeholder="Επιβεβαίωση κωδικού"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-5 py-4 rounded-full border border-[#C4A882] text-[#7A6055] font-light focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]"
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                  <p className="text-red-600 text-sm font-light">{error}</p>
                </div>
              )}
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {loading ? "Αποθήκευση..." : "Αποθήκευση Κωδικού"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
