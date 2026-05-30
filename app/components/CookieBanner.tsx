"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem("cookies_accepted");
      if (!accepted) setVisible(true);
    } catch (e) {
      setVisible(false);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem("cookies_accepted", "true");
    } catch (e) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "calc(100% - 40px)",
      maxWidth: "600px",
      background: "white",
      borderRadius: "16px",
      padding: "20px 24px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      border: "1px solid rgba(196,168,130,0.2)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <span style={{ fontSize: "24px" }}>🍪</span>
        <div>
          <p style={{
            fontSize: "14px",
            color: "#5C3820",
            fontFamily: "Georgia, serif",
            marginBottom: "4px",
          }}>
            χρησιμοποιούμε cookies
          </p>
          <p style={{
            fontSize: "12px",
            color: "#B09880",
            fontWeight: "300",
            lineHeight: "1.6",
          }}>
            χρησιμοποιούμε μόνο απαραίτητα cookies για τη σύνδεση και την ασφάλεια του λογαριασμού σας.{" "}
            <Link href="/cookies" style={{ color: "#8B5E3C", textDecoration: "underline" }}>
              μάθετε περισσότερα
            </Link>
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <Link
          href="/cookies"
          style={{
            padding: "10px 24px",
            background: "transparent",
            color: "#8B5E3C",
            borderRadius: "30px",
            border: "1px solid #C4A882",
            fontSize: "12px",
            fontFamily: "Georgia, serif",
            cursor: "pointer",
            letterSpacing: "1px",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          περισσότερα
        </Link>
        <button
          onClick={accept}
          style={{
            padding: "10px 24px",
            background: "#C49090",
            color: "white",
            borderRadius: "30px",
            border: "none",
            fontSize: "12px",
            fontFamily: "Georgia, serif",
            cursor: "pointer",
            letterSpacing: "1px",
          }}
        >
          αποδοχή
        </button>
      </div>
    </div>
  );
}
