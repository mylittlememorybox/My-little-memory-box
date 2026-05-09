"use client";

import { Suspense } from "react";
import Link from "next/link";
import CheckoutContent from "./checkout-content";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center"><p>Φόρτωση...</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
