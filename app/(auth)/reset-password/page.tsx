"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const supabase = createClientComponentClient();

  const handleUpdate = async () => {
    await supabase.auth.updateUser({ password });
    // redirect to login
  };

  return (
    <div>
      <h2>Νέος κωδικός</h2>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Νέος κωδικός" />
      <button onClick={handleUpdate}>Αποθήκευση</button>
    </div>
  );
}
