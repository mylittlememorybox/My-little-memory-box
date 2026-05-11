"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = createClientComponentClient();

  const handleReset = async () => {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://mylittlememorybox.gr/reset-password",
    });
    setSent(true);
  };

  if (sent) return <p>Στείλαμε email ανάκτησης! Τσέκαρε το inbox σου. 💜</p>;

  return (
    <div>
      <h2>Ξέχασες τον κωδικό;</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email σου" />
      <button onClick={handleReset}>Αποστολή</button>
    </div>
  );
}
