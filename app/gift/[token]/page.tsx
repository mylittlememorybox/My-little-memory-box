"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GiftPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gift, setGift] = useState<any>(null);

  useEffect(() => {
    loadGift();
  }, []);

  const loadGift = async () => {
    const { data } = await supabase
      .from("memory_boxes")
      .select("*")
      .eq("gift_token", params.token)
      .eq("is_gift", true)
      .single();

    if (!data) {
      setLoading(false);
      return;
    }

    // ΔΙΟΡΘΩΣΗ: Δεν υπάρχει πλέον λήξη — το δώρο παραμένει έγκυρο
    // μέχρι να χρησιμοποιηθεί (βλ. claim-gift/route.ts).
    // Αφαιρέθηκε ο έλεγχος gift_expires_at και το countdown.
    setGift(data);
    setLoading(false);
  };

  const TEMPLATE_NAMES: Record<string, string> = {
    "first-years": "Τα Πρώτα Χρόνια 🍼",
    "me-and-you": "Εγώ & Εσύ 💑",
    "our-wedding": "Ο Γάμος Μας 💍",
    "travel": "Travel Memory Box ✈️",
  };

  const TEMPLATE_PATHS: Record<string, string> = {
    "first-years": "memory-box",
    "me-and-you": "memory-box-couple",
    "our-wedding": "memory-box-wedding",
    "travel": "memory-box-travel",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center">
        <p className="text-[#B09880] font-light">Φόρτωση...</p>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-serif text-[#8B5E3C] mb-4">
            Το δώρο δεν βρέθηκε
          </h1>
          <p className="text-[#B09880] font-light mb-6">
            Ο σύνδεσμος δώρου δεν είναι έγκυρος.
          </p>
          <Link href="/" className="inline-block px-8 py-3 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all">
            Επιστροφή στην αρχική
          </Link>
        </div>
      </div>
    );
  }

  // Αν το δώρο έχει ήδη χρησιμοποιηθεί (user_id δεν είναι πια null),
  // ενημερώνουμε καθαρά αντί να αφήνουμε τη φόρμα εγγραφής ανοιχτή.
  if (gift.user_id) {
    return (
      <div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-serif text-[#8B5E3C] mb-4">
            Αυτό το δώρο έχει ήδη χρησιμοποιηθεί
          </h1>
          <p className="text-[#B09880] font-light mb-6">
            Ο σύνδεσμος αυτός έχει ήδη χρησιμοποιηθεί για τη δημιουργία λογαριασμού. Αν πιστεύετε ότι πρόκειται για λάθος, επικοινωνήστε μαζί μας.
          </p>
          <a href="mailto:info@mylittlememorybox.gr" className="text-[#C4A882] hover:text-[#8B5E3C]">
            info@mylittlememorybox.gr
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F2EC]">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-6 flex justify-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="My Little Memory Box" className="w-24 h-auto object-contain" />
          </Link>
        </div>
      </header>

      <div className="pt-12 pb-20 px-6 max-w-xl mx-auto text-center">
        <div className="text-7xl mb-6">🎁</div>

        <h1 className="text-4xl font-serif text-[#8B5E3C] mb-4">
          Σου χαρίζουν ένα Memory Box!
        </h1>

        <div className="flex items-center justify-center gap-2 my-6">
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          <span className="text-[#C4A882] text-xs">✦</span>
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <div className="text-3xl mb-3">
            {TEMPLATE_NAMES[gift.template_id] || gift.template_id}
          </div>
          <p className="text-[#7A6055] font-light leading-relaxed mb-6">
            Κάποιος σε σκέφτηκε και σου χάρισε ένα ξεχωριστό δώρο. Δημιούργησε τον λογαριασμό σου για να το ανοίξεις και να αρχίσεις να το συμπληρώνεις!
          </p>

          <div className="space-y-3">
            <Link
              href={`/register?gift_token=${params.token}`}
              className="block w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all"
            >
              ✨ Δημιούργησε τον λογαριασμό σου
            </Link>
            <Link
              href={`/login?gift_token=${params.token}`}
              className="block w-full py-4 bg-[#F2E8DE] text-[#8B5E3C] rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all"
            >
              Έχω ήδη λογαριασμό
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
