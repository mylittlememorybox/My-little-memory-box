"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const router = useRouter();
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
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Παρακαλω συμπληρωστε ολα τα πεδια.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Οι κωδικοι δεν ταιριαζουν.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Ο κωδικος πρεπει να εχει τουλαχιστον 8 χαρακτηρες.");
      return;
    }

    if (!consents.terms || !consents.privacy || !consents.dataProcessing || !consents.withdrawal) {
      setError("Παρακαλω αποδεχτειτε ολες τις υποχρεωτικες συγκαταθεσεις.");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
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
        setError("Σφαλμα κατα την εγγραφη: " + signUpError.message);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Σφαλμα κατα την εγγραφη. Δοκιμαστε ξανα.");
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
          <h1 className="text-4xl font-serif text-[#8B5E3C] mb-4">
            Δημιουργια Λογαριασμου
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
              placeholder="Ονομα και Επωνυμο"
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
              placeholder="Κωδικος (τουλαχιστον 8 χαρακτηρες)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-5 py-4 rounded-full border border-[#C4A882] text-[#7A6055] font-light focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]"
            />
            <input
              type="password"
              placeholder="Επιβεβαιωση Κωδικου"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-5 py-4 rounded-full border border-[#C4A882] text-[#7A6055] font-light focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]"
            />
          </div>

          <hr className="h-px bg-[#C4A882] opacity-15 my-6" />

          <div className="space-y-4 mb-8">
            <p className="text-xs tracking-widest uppercase text-[#C4A882] mb-4">
              Συγκαταθεσεις GDPR
            </p>

            <label className="flex gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.terms}
                onChange={(e) => setConsents({ ...consents, terms: e.target.checked })}
                className="mt-1 w-4 h-4 accent-[#C49090] flex-shrink-0"
              />
              <span className="text-sm font-light text-[#7A6055] leading-relaxed">
                <span className="text-[#C47878]">*</span> Εχω διαβασει και αποδεχομαι τους{" "}
                <Link href="/terms" target="_blank" className="text-[#C4A882] hover:text-[#8B5E3C] underline">
                  Ορους και Προϋποθεσεις
                </Link>{" "}
                χρησης της υπηρεσιας.
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
                <span className="text-[#C47878]">*</span> Εχω διαβασει και αποδεχομαι την{" "}
                <Link href="/privacy" target="_blank" className="text-[#C4A882] hover:text-[#8B5E3C] underline">
                  Πολιτικη Απορρητου
                </Link>{" "}
                και την επεξεργασια των προσωπικων μου δεδομενων.
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
                <span className="text-[#C47878]">*</span> Συναινω στη συλλογη και επεξεργασια των προσωπικων μου δεδομενων για την παροχη της υπηρεσιας Memory Box, συμφωνα με τον GDPR 2016/679.
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
                <span className="text-[#C47878]">*</span> Κατανοω οτι για ψηφιακα προϊοντα που αρχιζω να χρησιμοποιω αμεσως, παραιτουμαι του δικαιωματος υπαναχωρησης των 14 ημερων, συμφωνα με τον Ν. 2251/1994.
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
                Επιθυμω να λαμβανω ενημερωτικο newsletter με προσφορες και νεα. (Προαιρετικο)
              </span>
            </label>

            <p className="text-xs text-[#B09880] mt-2">
              <span className="text-[#C47878]">*</span> Υποχρεωτικα πεδια
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
            {loading ? "Δημιουργια..." : "Δημιουργια Λογαριασμου"}
          </button>

          <Link
            href="/forgot-password"
            className="block w-full py-3 text-center text-[#C4A882] text-sm font-light hover:text-[#8B5E3C] transition-colors"
          >
            Ξεχασατε τον κωδικο σας;
          </Link>
        </div>

        <p className="text-center text-sm text-[#B09880] font-light mt-6">
          Εχετε ηδη λογαριασμο;{" "}
          <Link href="/login" className="text-[#C4A882] hover:text-[#8B5E3C]">
            Συνδεθειτε εδω
          </Link>
        </p>
      </div>

      <footer className="bg-[#F2E8DE] py-8 px-6 text-center border-t border-[rgba(196,168,130,0.2)] mt-12">
        <p className="text-xs font-light text-[#B09880]">
          © 2025 My Little Memory Box - Ολα τα δικαιωματα διατηρουνται
        </p>
      </footer>
    </div>
  );
}

