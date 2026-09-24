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
  const [copied, setCopied] = useState(false);
  const cardWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("qrcode")
      .then((QRCode) =>
        QRCode.toDataURL(giftUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: "#C49090",
            light: "#F9F2EC",
          },
        })
      )
      .then((url) => {
        if (!cancelled) setQrCodeUrl(url);
      })
      .catch((error) => {
        console.error("QR code generation error:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [giftUrl]);

  const handleDownload = async () => {
    if (!cardWrapperRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardWrapperRef.current, {
        scale: 2,
        backgroundColor: "#E8DDD4",
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement("a");
      link.download = "my-little-memory-box-gift.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Download error:", error);
      alert("Σφάλμα κατά τη λήψη. Δοκιμάστε ξανά.");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(giftUrl);
      } else {
        // Fallback for browsers/contexts without the async Clipboard API
        const textarea = document.createElement("textarea");
        textarea.value = giftUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy error:", error);
      alert("Δεν ήταν δυνατή η αντιγραφή. Δοκιμάστε να επιλέξετε το link χειροκίνητα.");
    }
  };

  return (
    <div className="min-h-screen bg-[#E8DDD4] py-8 px-4 flex flex-col items-center gap-6">

      <header className="w-full max-w-lg flex justify-between items-center">
        <Link href="/" className="text-xs text-[#C49090] uppercase tracking-widest hover:opacity-70">
          ← Αρχική
        </Link>
        <p className="text-xs text-[#B09880] uppercase tracking-widest">Gift Card</p>
      </header>

      {/*
        cardWrapperRef wraps the card WITH extra top padding equal to the
        medallion's overlap (30px) and matching page background, so that
        html2canvas captures the medallion (which overflows the card's own
        box via a negative top offset) instead of clipping it.
      */}
      <div
        ref={cardWrapperRef}
        style={{
          width: "500px",
          maxWidth: "100%",
          boxSizing: "border-box",
          backgroundColor: "#E8DDD4",
          padding: "30px 12px 12px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {/* GIFT CARD */}
        <div
          style={{
            width: "100%",
            backgroundColor: "#FBF3E7",
            border: "1px solid #D4BC98",
            boxSizing: "border-box",
            textAlign: "center",
            position: "relative",
            boxShadow: "0 20px 48px rgba(196,144,144,0.16)",
          }}
        >
          {/* wax-seal medallion overlapping the top edge */}
          <div
            style={{
              position: "absolute",
              top: "-30px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#C49090",
              border: "2px solid #FBF3E7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 14px rgba(196,144,144,0.3)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F2E8DE" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20s-7.5-4.6-7.5-10.2C4.5 6.6 6.6 4.5 9.2 4.5c1.4 0 2.6.7 3.3 1.8.7-1.1 1.9-1.8 3.3-1.8 2.6 0 4.7 2.1 4.7 5.3C20.5 15.4 12 20 12 20Z" />
            </svg>
          </div>

          <div style={{ padding: "40px 40px 0" }}>
            <img
              src="/logo.png"
              alt="My Little Memory Box"
              crossOrigin="anonymous"
              style={{ width: "128px", height: "auto", margin: "0 auto 14px", display: "block" }}
            />
            <div style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: "#A99075", marginBottom: "34px" }}>
              Ένα Δώρο Για Εσένα
            </div>

            <div style={{ fontSize: "38px", fontStyle: "italic", color: "#C49090", lineHeight: 1.15, marginBottom: "40px" }}>
              Με αγάπη,<br />για εσένα
            </div>
          </div>

          {/* ticket-stub perforation: cut-outs match the outer page background */}
          <div style={{ position: "relative", height: 0 }}>
            <div style={{ position: "absolute", left: "-12px", top: "-12px", width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#E8DDD4" }} />
            <div style={{ position: "absolute", right: "-12px", top: "-12px", width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#E8DDD4" }} />
            <div style={{ position: "absolute", left: "24px", right: "24px", top: "-1px", borderTop: "2px dashed #D4BC98" }} />
          </div>

          <div style={{ padding: "34px 40px 40px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: "#B08D5E", marginBottom: "16px" }}>
              Σκάναρε για να ανοίξεις το δώρο σου
            </div>

            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                style={{ width: "138px", height: "138px", margin: "0 auto 26px", display: "block", backgroundColor: "#ffffff", border: "1px solid #D4BC98" }}
              />
            ) : (
              <div
                style={{
                  width: "138px",
                  height: "138px",
                  margin: "0 auto 26px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #D4BC98",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  color: "#B08D5E",
                }}
              >
                Φόρτωση...
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#ffffff",
                border: "1px solid #D4BC98",
                borderRadius: "999px",
                padding: "9px 8px 9px 18px",
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: "11.5px",
                  color: "#C49090",
                  textAlign: "left",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {giftUrl.replace("https://www.", "")}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Αντιγραφή link"
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#C49090",
                  border: "none",
                  borderRadius: "999px",
                  padding: "8px 14px",
                  fontFamily: "Georgia, serif",
                  fontSize: "10.5px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "#FBF3E7",
                  cursor: "pointer",
                }}
              >
                {copied ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FBF3E7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FBF3E7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
                {copied ? "Αντιγράφηκε" : "Αντιγραφή"}
              </button>
            </div>

            <div style={{ fontSize: "9.5px", color: "#B08D5E", marginTop: "24px", letterSpacing: "0.5px" }}>
              © {new Date().getFullYear()} My Little Memory Box · info@mylittlememorybox.gr
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS — outside the captured card, so they never appear in the downloaded image */}
      <div className="w-full max-w-lg flex flex-col gap-3">
        <Link
          href={`/gift/${token}`}
          className="flex items-center justify-center gap-2.5 w-full py-4 bg-[#C49090] text-white uppercase tracking-[2.5px] text-sm hover:opacity-90 transition-all text-center"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" />
            <path d="M3 8.5V17l9 4.5 9-4.5V8.5" />
          </svg>
          Άνοιγμα Δώρου
        </Link>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || !qrCodeUrl}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-[#C4A882] text-[#C49090] uppercase tracking-[1.5px] text-xs hover:opacity-90 transition-all disabled:opacity-50"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C49090" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            {downloading ? "Λήψη..." : "Λήψη ως Εικόνα"}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-[#C4A882] text-[#C49090] uppercase tracking-[1.5px] text-xs hover:opacity-90 transition-all"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {copied ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C49090" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C49090" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
            {copied ? "Αντιγράφηκε" : "Αντιγραφή Link"}
          </button>
        </div>
      </div>

      <p className="text-xs text-[#C49090] opacity-60 font-light text-center" style={{ fontFamily: "Georgia, serif" }}>
        Στείλτο μέσω Viber, WhatsApp ή Instagram
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
