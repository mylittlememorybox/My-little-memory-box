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
  // Starts as the plain file; replaced with a background-stripped version
  // once the canvas pass below finishes (falls back to this if it fails).
  const [logoSrc, setLogoSrc] = useState("/logo.png");
  const cardWrapperRef = useRef<HTMLDivElement>(null);

  // Strip the logo's white background client-side, so it sits cleanly on
  // the card both on-screen and in the downloaded image — without touching
  // the actual /logo.png file in the repo.
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Near-white pixels become fully transparent; everything else
          // (the illustration's own soft tones) is left untouched.
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        setLogoSrc(canvas.toDataURL("image/png"));
      } catch (error) {
        // Same-origin /logo.png should never hit a canvas security error,
        // but if it ever does, we simply keep the original file as-is.
        console.error("Logo background removal failed, using original file:", error);
      }
    };
    img.onerror = () => {
      console.error("Could not load /logo.png for background removal.");
    };
    img.src = "/logo.png";
  }, []);

  // Stop iOS Safari's automatic data-detection (email/phone/date) from
  // adding its own styling — e.g. an underline/overline — around the
  // plain "info@mylittlememorybox.gr" text in the card footer. This has
  // to be a real <meta name="format-detection"> tag in <head>; it can't
  // be done with inline styles alone.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "format-detection";
    meta.content = "telephone=no, date=no, address=no, email=no";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

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
              src={logoSrc}
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

            {/*
              Plain, real link — no "copy" button. A button baked into a
              downloaded static image can never do anything when tapped,
              and clipboard permissions are unreliable inside in-app
              browsers (e.g. links opened from within Mail). Tapping this
              text simply navigates to the gift page, which always works,
              on both the live page and — once someone screenshots or
              recognizes the text in the downloaded image — by typing it
              in manually.
            */}
            <a
              href={giftUrl}
              style={{
                display: "block",
                backgroundColor: "#ffffff",
                border: "1px solid #D4BC98",
                borderRadius: "16px",
                padding: "14px 16px",
                fontSize: "11.5px",
                color: "#C49090",
                textAlign: "center",
                wordBreak: "break-all",
                lineHeight: 1.5,
                textDecoration: "none",
              }}
            >
              {giftUrl.replace("https://www.", "")}
            </a>

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

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || !qrCodeUrl}
          className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-[#C4A882] text-[#C49090] uppercase tracking-[1.5px] text-xs hover:opacity-90 transition-all disabled:opacity-50"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C49090" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
          {downloading ? "Λήψη..." : "Λήψη ως Εικόνα"}
        </button>
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
