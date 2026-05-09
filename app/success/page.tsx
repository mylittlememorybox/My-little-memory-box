"use client";

import { Suspense } from "react";
import SuccessContent from "./success-content";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center"><p>Φόρτωση...</p></div>}>
      <SuccessContent />
    </Suspense>
  );
}
