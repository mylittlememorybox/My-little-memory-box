import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  "https://jephluxdlbabgufalgtz.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Backward-compatible fallback mapping (χρησιμοποιείται μόνο αν
// το Stripe Product δεν έχει metadata.template_id ορισμένο)
const PRICE_TO_TEMPLATE: Record<string, string> = {
  // Live prices
  "price_1TTP6PI6cMM6olNfgyRPXeoy": "first-years",
  "price_1TUvjoI6cMM6olNfqYPKW6f5": "me-and-you",
  "price_1TUvpKI6cMM6olNfvpuY7qxq": "our-wedding",
  "price_1TcS0TI6cMM6olNfBCI2S324": "travel",
  // Test prices
  "price_1TVZwoI6cMM6olNfrNnb8iZH": "first-years",
  "price_1TVnLhI6cMM6olNfsjcnoeI2": "me-and-you",
  "price_1TVnMzI6cMM6olNfkwq1wvwO": "our-wedding",
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  try {
    // Αυτόματη επιλογή test ή live
    const isTest = body.includes("cs_test_") || body.includes("_test_");
    const stripeKey = isTest
      ? process.env.STRIPE_SECRET_KEY_TEST
      : process.env.STRIPE_SECRET_KEY;
    const webhookSecret = isTest
      ? process.env.STRIPE_WEBHOOK_SECRET_TEST
      : process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Missing webhook secret");
      return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
    }

    const stripe = require("stripe")(stripeKey);

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email;

      // Expand το product ώστε να έχουμε πρόσβαση στο metadata του
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price.product"],
      });
      const price = lineItems.data[0]?.price;
      const product = price?.product as any;

      if (!customerEmail || !price) {
        console.error("Missing email or price");
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
      }

      // 1) Προτεραιότητα στο metadata.template_id του Stripe Product
      //    (ανθεκτικό σε νέα prices, coupons, discounts)
      // 2) Fallback στο hardcoded mapping (παλιά prices)
      // 3) Αν αποτύχουν και τα δύο -> ΔΕΝ κάνουμε σιωπηλό default,
      //    log error ώστε να το προσέξουμε αμέσως
      const templateId: string | null =
        product?.metadata?.template_id || PRICE_TO_TEMPLATE[price.id] || null;

      if (!templateId) {
        console.error(
          "UNKNOWN TEMPLATE — no mapping found. price:",
          price.id,
          "product:",
          product?.id,
          "session:",
          session.id
        );
      }

      // Έλεγχος αν υπάρχει ήδη
      const { data: existingBox } = await supabase
        .from("memory_boxes")
        .select("id")
        .eq("stripe_session_id", session.id)
        .maybeSingle();

      if (existingBox) {
        console.log("Memory box already exists:", existingBox.id);
        return NextResponse.json({ received: true });
      }

      // Βρες χρήστη
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const user = users?.find((u: any) => u.email === customerEmail);

      // Δημιούργησε memory box
      const { data: newBox, error } = await supabase
        .from("memory_boxes")
        .insert({
          user_id: user?.id || null,
          template_id: templateId, // μπορεί να είναι null αν δεν βρέθηκε mapping — επίτηδες, για να το εντοπίσεις άμεσα
          status: "in_progress",
          story_status: "pending",
          gift_email: customerEmail,
          stripe_session_id: session.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ error: "Failed to create memory box" }, { status: 500 });
      }

      console.log("Memory box created:", newBox?.id, "template:", templateId ?? "UNKNOWN");
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
