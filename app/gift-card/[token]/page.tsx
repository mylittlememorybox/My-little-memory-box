"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function GiftCardPage() {
  const params = useParams();
  const token = params.token as string;
  const giftUrl = `https://www.mylittlememorybox.gr/gift/${token}`;
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Δημιουργία QR code
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(giftUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#8B5E3C",
          light: "#F9F2EC",
        },
      }).then((url) => setQrCodeUrl(url));
    });
  }, [giftUrl]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#F9F2EC",
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement("a");
      link.download = "my-little-memory-box-gift.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Download error:", error);
      alert("Σφάλμα κατά το download. Δοκιμάστε ξανά.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8DDD4] py-8 px-4 flex flex-col items-center gap-6">

      <header className="w-full max-w-lg flex justify-between items-center">
        <Link href="/" className="text-xs text-[#8B5E3C] uppercase tracking-widest hover:opacity-70">
          ← Αρχική
        </Link>
        <p className="text-xs text-[#B09880] uppercase tracking-widest">Gift Card</p>
      </header>

      {/* GIFT CARD */}
      <div
        ref={cardRef}
        style={{
          width: "500px",
          maxWidth: "100%",
          backgroundColor: "#F9F2EC",
          borderRadius: "24px",
          padding: "35px 35px 40px",
          border: "2px solid #C4A882",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top strip */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "6px",
          background: "linear-gradient(to right, #C49090, #C4A882, #C49090)",
          borderRadius: "24px 24px 0 0",
        }} />

        {/* Logo */}
        <img
          src="/logo.png"
          alt="My Little Memory Box"
          style={{ width: "90px", height: "auto", margin: "10px auto 8px", display: "block" }}
          crossOrigin="anonymous"
        />

        {/* Brand name */}
        <h1 style={{ color: "#8B5E3C", fontSize: "20px", fontWeight: "normal", margin: "0 0 4px" }}>
          My Little Memory Box
        </h1>
        <p style={{ color: "#C4A882", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 20px" }}>
          ✦ &nbsp; Δώρο &nbsp; ✦
        </p>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: "1px solid #C4A882", opacity: 0.3, margin: "0 30px 22px" }} />

        {/* Gift emoji */}
        <div style={{ fontSize: "55px", marginBottom: "12px" }}>🎁</div>

        {/* Main text */}
        <p style={{ color: "#8B5E3C", fontSize: "20px", fontStyle: "italic", marginBottom: "10px" }}>
          Με αγάπη, για εσένα 💛
        </p>
        <p style={{ color: "#7A6055", fontSize: "14px", lineHeight: 1.9, marginBottom: "22px" }}>
          Ένα Memory Box γεμάτο αναμνήσεις<br />
          σε περιμένει να το συμπληρώσεις
        </p>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: "1px solid #C4A882", opacity: 0.3, margin: "0 30px 22px" }} />

        {/* QR */}
        <p style={{ color: "#C4A882", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>
          Σκάναρε για να ανοίξεις το δώρο σου
        </p>

        {qrCodeUrl ? (
          <img
            src={qrCodeUrl}
            alt="QR Code"
            style={{ width: "160px", height: "160px", margin: "0 auto 15px", display: "block", borderRadius: "12px" }}
          />
        ) : (
          <div style={{
            width: "160px", height: "160px", margin: "0 auto 15px",
            background: "white", borderRadius: "12px",
            border: "2px solid #C4A882", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "12px", color: "#C4A882"
          }}>
            Φόρτωση...
          </div>
        )}

        {/* Link */}
        <p style={{ color: "#B09880", fontSize: "12px", marginBottom: "6px" }}>
          Ή αντέγραψε αυτό το link:
        </p>
        <div style={{
          background: "white", borderRadius: "10px",
          padding: "10px 15px", margin: "0 10px 20px",
          border: "1px solid rgba(196,168,130,0.3)"
        }}>
          <p style={{ color: "#8B5E3C", fontSize: "11px", wordBreak: "break-all", margin: 0, fontFamily: "monospace" }}>
            {giftUrl}
          </p>
        </div>

        {/* Footer */}
        <p style={{ color: "#C4A882", fontSize: "10px", margin: 0 }}>
          © 2025 My Little Memory Box · info@mylittlememorybox.gr
        </p>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={downloading || !qrCodeUrl}
        className="px-10 py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-widest text-sm hover:opacity-90 transition-all disabled:opacity-50"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {downloading ? "⏳ Κατέβασμα..." : "⬇️ Κατέβασε την Gift Card"}
      </button>

      <p className="text-xs text-[#8B5E3C] opacity-60 font-light" style={{ fontFamily: "Georgia, serif" }}>
        Στείλτη μέσω Viber, WhatsApp ή Instagram!
      </p>

      <Link
        href="/"
        className="text-xs text-[#C4A882] uppercase tracking-widest hover:text-[#8B5E3C] transition-colors"
      >
        ← Επιστροφή στην αρχική
      </Link>
    </div>
  );
}
