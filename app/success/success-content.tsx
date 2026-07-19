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
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [giftLink, setGiftLink] = useState<string | null>(null);
  const [loadingBox, setLoadingBox] = useState(false);
  const [giftToken, setGiftToken] = useState<string | null>(null);
  // ΝΕΟ: παρακολουθούμε αν το create-memory-box απέτυχε, ώστε να μπλοκάρουμε την αποστολή
  const [boxError, setBoxError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId && type === "gift") {
      createMemoryBox();
    } else if (type === "gift" && !sessionId) {
      // ΝΕΟ: αν λείπει το session_id εντελώς, δεν προχωράμε καθόλου
      setBoxError("Λείπει το αναγνωριστικό πληρωμής (session_id). Ανανεώστε τη σελίδα ή επικοινωνήστε μαζί μας.");
    }
  }, [sessionId, type]);

  const createMemoryBox = async () => {
    setLoadingBox(true);
    setBoxError(null);
    try {
      const response = await fetch("/api/create-memory-box", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await response.json();

      // ΝΕΟ: αυστηρός έλεγχος — πρέπει να έχουμε ΚΑΙ response.ok ΚΑΙ έγκυρο memoryBoxId.
      // Πριν, ένα αποτυχημένο request περνούσε απαρατήρητο και το memoryBoxId έμενε null,
      // πράγμα που άφηνε ανοιχτό το ενδεχόμενο λάθος memory box να σταλεί ως δώρο.
      if (!response.ok || !data.memoryBoxId) {
        console.error("create-memory-box failed:", data);
        setBoxError(
          "Δεν καταφέραμε να ετοιμάσουμε το Memory Box σας. Μην στείλετε ακόμα το δώρο — ανανεώστε τη σελίδα ή επικοινωνήστε μαζί μας στο info@mylittlememorybox.gr"
        );
        setMemoryBoxId(null);
        return;
      }

      setMemoryBoxId(data.memoryBoxId);
    } catch (error) {
      console.error("Error creating memory box:", error);
      setBoxError(
        "Παρουσιάστηκε σφάλμα κατά την προετοιμασία του Memory Box. Ανανεώστε τη σελίδα ή επικοινωνήστε μαζί μας στο info@mylittlememorybox.gr"
      );
      setMemoryBoxId(null);
    } finally {
      setLoadingBox(false);
    }
  };

  const handleSendGift = async () => {
    if (!email) {
      alert("Παρακαλώ εισάγετε το email του παραλήπτη");
      return;
    }
    if (loadingBox) {
      alert("Παρακαλώ περιμένετε να φορτώσει το Memory Box...");
      return;
    }
    // ΝΕΟ: σκληρό μπλοκάρισμα — χωρίς έγκυρο memoryBoxId δεν στέλνουμε ΤΙΠΟΤΑ.
    // Αυτό είναι το τελευταίο σημείο ελέγχου πριν φύγει το αίτημα.
    if (!memoryBoxId) {
      alert(
        "Δεν είναι δυνατή η αποστολή γιατί το Memory Box δεν έχει ετοιμαστεί σωστά. Ανανεώστε τη σελίδα ή επικοινωνήστε μαζί μας στο info@mylittlememorybox.gr — μην ξαναδοκιμάσετε χωρίς αυτό, ώστε να μην σταλεί λάθος δώρο."
      );
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/send-gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, memoryBoxId }),
      });
      const data = await response.json();
      if (response.ok) {
        setQrCodeUrl(data.qrCodeDataUrl);
        setGiftLink(data.giftUrl);
        setGiftToken(data.giftToken);
        setSent(true);
      } else {
        console.error("send-gift failed:", data);
        alert("Σφάλμα κατά την αποστολή. Δοκιμάστε ξανά ή επικοινωνήστε μαζί μας.");
      }
    } catch (error) {
      alert("Σφάλμα κατά την αποστολή. Δοκιμάστε ξανά.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = "gift-qr-code.png";
    link.click();
  };

  const handleCopyLink = () => {
    if (!giftLink) return;
    navigator.clipboard.writeText(giftLink);
    alert("Το link αντιγράφηκε! 🎁");
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
                  {loadingBox && (
                    <div className="bg-[#F2E8DE] rounded-2xl p-4 mb-4 text-center">
                      <p className="text-sm text-[#8B5E3C] font-light">
                        ⏳ Φόρτωση Memory Box... παρακαλώ περιμένετε
                      </p>
                    </div>
                  )}
                  {!loadingBox && memoryBoxId && (
                    <div className="bg-[#F2E8DE] rounded-2xl p-4 mb-4 text-center">
                      <p className="text-sm text-[#8B5E3C] font-light">
                        ✅ Το Memory Box είναι έτοιμο!
                      </p>
                    </div>
                  )}
                  {/* ΝΕΟ: εμφανές μήνυμα σφάλματος αν κάτι πήγε στραβά */}
                  {!loadingBox && boxError && (
                    <div className="bg-[#FBEAEA] border border-[#E0A0A0] rounded-2xl p-4 mb-4 text-center">
                      <p className="text-sm text-[#A03A3A] font-light">
                        ⚠️ {boxError}
                      </p>
                      <button
                        onClick={createMemoryBox}
                        className="mt-3 text-xs uppercase tracking-wider text-[#8B5E3C] underline"
                      >
                        Δοκιμάστε ξανά
                      </button>
                    </div>
                  )}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email παραλήπτη"
                    className="w-full px-5 py-4 rounded-full border border-[#C4A882] text-[#7A6055] font-light mb-4 focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]"
                  />
                  <button
                    onClick={handleSendGift}
                    // ΝΕΟ: το κουμπί είναι απενεργοποιημένο αν δεν υπάρχει έγκυρο memoryBoxId
                    disabled={loading || loadingBox || !memoryBoxId}
                    className="w-full py-4 bg-[#C47878] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {loading
                      ? "Αποστολή..."
                      : loadingBox
                      ? "⏳ Φόρτωση..."
                      : !memoryBoxId
                      ? "⚠️ Μη διαθέσιμο"
                      : "🎁 Αποστολή QR code"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">✅</div>
                <p className="text-[#B09880] font-light mb-8 leading-relaxed">
                  Στείλαμε το QR code στον παραλήπτη! Μπορείτε επίσης να κατεβάσετε την Gift Card για να τη στείλετε μέσω Viber, WhatsApp κλπ.
                </p>

                {qrCodeUrl && (
                  <div className="bg-white rounded-3xl p-8 shadow-lg mb-6">
                    <p className="text-xs tracking-widest uppercase text-[#C4A882] mb-4">
                      QR Code Δώρου
                    </p>
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-48 h-48 mx-auto mb-6"
                    />
                    <div className="space-y-3">

                      {/* Gift Card button */}
                      {giftToken && (
                        <Link
                          href={`/gift-card/${giftToken}`}
                          target="_blank"
                          className="block w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all text-center"
                        >
                          🎀 Κατέβασε την Gift Card
                        </Link>
                      )}

                      <button
                        onClick={handleDownloadQR}
                        className="w-full py-4 bg-[#F2E8DE] text-[#8B5E3C] rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all"
                      >
                        📥 Κατέβασε μόνο το QR
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="w-full py-4 bg-[#F2E8DE] text-[#8B5E3C] rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all"
                      >
                        🔗 Αντιγραφή Link Δώρου
                      </button>
                    </div>
                    <p className="text-xs text-[#B09880] mt-4 font-light">
                      Στείλτε την Gift Card ή το link μέσω Viber, WhatsApp, SMS ή όπου θέλετε!
                    </p>
                  </div>
                )}

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
