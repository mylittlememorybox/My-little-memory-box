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

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const giftToken = searchParams.get("gift_token");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    dataProcessing: false,
    newsletter: false,
    withdrawal: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Παρακαλώ συμπληρώστε όλα τα πεδία.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Οι κωδικοί δεν ταιριάζουν.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.");
      return;
    }

    if (!consents.terms || !consents.privacy || !consents.dataProcessing || !consents.withdrawal) {
      setError("Παρακαλώ αποδεχτείτε όλες τις υποχρεωτικές συγκαταθέσεις.");
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            newsletter: consents.newsletter,
          },
        },
      });

      if (signUpError) {
        setError("Σφάλμα κατά την εγγραφή: " + signUpError.message);
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
        router.push("/dashboard");
        return;
      }

      router.push("/register-success");
    } catch (err) {
      setError("Σφάλμα κατά την εγγραφή. Δοκιμάστε ξανά.");
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
              🎁 Εγγραφή για το δώρο σας
            </div>
          )}
          <h1 className="text-4xl font-serif text-[#8B5E3C] mb-4">
            Δημιουργία Λογαριασμού
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
              type="text"
              placeholder="Όνομα και Επώνυμο"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-5 py-4 rounded-full border border-[#C4A882] text-[#7A6055] font-light focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-5 py-4 rounded-full border border-[#C4A882] text-[#7A6055] font-light focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]"
            />
            <input
              type="password"
              placeholder="Κωδικός (τουλάχιστον 8 χαρακτήρες)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-5 py-4 rounded-full border border-[#C4A882] text-[#7A6055] font-light focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]"
            />
            <input
              type="password"
              placeholder="Επιβεβαίωση Κωδικού"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-5 py-4 rounded-full border border-[#C4A882] text-[#7A6055] font-light focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]"
            />
          </div>

          <hr className="h-px bg-[#C4A882] opacity-15 my-6" />

          <div className="space-y-4 mb-8">
            <p className="text-xs tracking-widest uppercase text-[#C4A882] mb-4">
              Συγκαταθέσεις GDPR
            </p>

            <label className="flex gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.terms}
                onChange={(e) => setConsents({ ...consents, terms: e.target.checked })}
                className="mt-1 w-4 h-4 accent-[#C49090] flex-shrink-0"
              />
              <span className="text-sm font-light text-[#7A6055] leading-relaxed">
                <span className="text-[#C47878]">*</span> Έχω διαβάσει και αποδέχομαι τους{" "}
                <Link href="/terms" target="_blank" className="text-[#C4A882] hover:text-[#8B5E3C] underline">
                  Όρους και Προϋποθέσεις
                </Link>{" "}
                χρήσης της υπηρεσίας.
              </span>
            </label>

            <label className="flex gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.privacy}
                onChange={(e) => setConsents({ ...consents, privacy: e.target.checked })}
                className="mt-1 w-4 h-4 accent-[#C49090] flex-shrink-0"
              />
              <span className="text-sm font-light text-[#7A6055] leading-relaxed">
                <span className="text-[#C47878]">*</span> Έχω διαβάσει και αποδέχομαι την{" "}
                <Link href="/privacy" target="_blank" className="text-[#C4A882] hover:text-[#8B5E3C] underline">
                  Πολιτική Απορρήτου
                </Link>{" "}
                και την επεξεργασία των προσωπικών μου δεδομένων.
              </span>
            </label>

            <label className="flex gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.dataProcessing}
                onChange={(e) => setConsents({ ...consents, dataProcessing: e.target.checked })}
                className="mt-1 w-4 h-4 accent-[#C49090] flex-shrink-0"
              />
              <span className="text-sm font-light text-[#7A6055] leading-relaxed">
                <span className="text-[#C47878]">*</span> Συναινώ στη συλλογή και επεξεργασία των προσωπικών μου δεδομένων για την παροχή της υπηρεσίας Memory Box, σύμφωνα με τον GDPR 2016/679.
              </span>
            </label>

            <label className="flex gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.withdrawal}
                onChange={(e) => setConsents({ ...consents, withdrawal: e.target.checked })}
                className="mt-1 w-4 h-4 accent-[#C49090] flex-shrink-0"
              />
              <span className="text-sm font-light text-[#7A6055] leading-relaxed">
                <span className="text-[#C47878]">*</span> Κατανοώ ότι για ψηφιακά προϊόντα που αρχίζω να χρησιμοποιώ αμέσως, παραιτούμαι του δικαιώματος υπαναχώρησης των 14 ημερών, σύμφωνα με τον Ν. 2251/1994.
              </span>
            </label>

            <label className="flex gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.newsletter}
                onChange={(e) => setConsents({ ...consents, newsletter: e.target.checked })}
                className="mt-1 w-4 h-4 accent-[#C49090] flex-shrink-0"
              />
              <span className="text-sm font-light text-[#7A6055] leading-relaxed">
                Επιθυμώ να λαμβάνω ενημερωτικό newsletter με προσφορές και νέα. (Προαιρετικό)
              </span>
            </label>

            <p className="text-xs text-[#B09880] mt-2">
              <span className="text-[#C47878]">*</span> Υποχρεωτικά πεδία
            </p>
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
            {loading ? "Δημιουργία..." : "Δημιουργία Λογαριασμού"}
          </button>

          <Link
            href="/forgot-password"
            className="block w-full py-3 text-center text-[#C4A882] text-sm font-light hover:text-[#8B5E3C] transition-colors"
          >
            Ξεχάσατε τον κωδικό σας;
          </Link>
        </div>

        <p className="text-center text-sm text-[#B09880] font-light mt-6">
          Έχετε ήδη λογαριασμό;{" "}
          <Link
            href={giftToken ? `/login?gift_token=${giftToken}` : "/login"}
            className="text-[#C4A882] hover:text-[#8B5E3C]"
          >
            Συνδεθείτε εδώ
          </Link>
        </p>
      </div>

      <footer className="bg-[#F2E8DE] py-8 px-6 text-center border-t border-[rgba(196,168,130,0.2)] mt-12">
        <p className="text-xs font-light text-[#B09880]">
          © 2025 My Little Memory Box - Όλα τα δικαιώματα διατηρούνται
        </p>
      </footer>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center"><p className="text-[#B09880]">Φόρτωση...</p></div>}>
      <RegisterContent />
    </Suspense>
  );
}
