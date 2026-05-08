"use client";
import { useState } from "react";
export default function GiftPaymentSuccessPage() {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim() || !recipientName.trim()) {
      setError("Συμπληρώσε όλα τα πεδία!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/generate-gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail, recipientName }),
      });
      if (!response.ok) throw new Error("Error");
      setSuccess(true);
    } catch (err) {
      setError("Κάτι πήγε στραβά");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F6EFE8", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "480px", width: "100%", backgroundColor: "#FFF8F3", borderRadius: "28px", padding: "28px 22px", textAlign: "center", boxShadow: "0 10px 28px rgba(0,0,0,0.08)" }}>
        <img src="/logo.png" alt="Logo" style={{ width: "180px", marginBottom: "22px" }} />
        <h1 style={{ color: "#7D6457", fontSize: "26px", marginBottom: "14px" }}>Η πληρωμή ολοκληρώθηκε ✨</h1>
        {!success ? (
          <>
            <p style={{ fontSize: "17px", marginBottom: "24px" }}>Συμπλήρωσε το email του/της αποδέκτη</p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Ένα δώρο για τον/την..." style={{ width: "100%", padding: "12px", border: "1px solid #DED3CC", borderRadius: "10px", boxSizing: "border-box" }} />
              <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="Email" style={{ width: "100%", padding: "12px", border: "1px solid #DED3CC", borderRadius: "10px", boxSizing: "border-box" }} />
              {error && <p style={{ color: "#C62828" }}>{error}</p>}
              <button type="submit" disabled={loading} style={{ padding: "16px", borderRadius: "999px", backgroundColor: "#DCC4B8", border: "none", cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
                {loading ? "⏳ Δημιουργία..." : "🎁 Δημιουργία κάρτας"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p style={{ fontSize: "17px", marginBottom: "24px" }}>✅ Στάλθηκε στο email!</p>
            <a href="/" style={{ display: "block", padding: "16px", borderRadius: "999px", backgroundColor: "#DCC4B8", textDecoration: "none", color: "#4F4039" }}>🏠 Αρχική</a>
          </>
        )}
      </div>
    </main>
  );
}
