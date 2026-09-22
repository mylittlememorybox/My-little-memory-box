import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { alertAdmin } from "@/lib/alert-admin";

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
  "price_1UDPaRI6cMM6olNfCppcHZXp": "first-years",
  "price_1UDPNTI6cMM6olNfnkLRRjJG": "me-and-you",
  "price_1UDPhrI6cMM6olNfDRWbFEPL": "our-wedding",
  "price_1UDPe2I6cMM6olNf3Xl19WO2": "travel",
};

// Τιμή-placeholder όταν δεν βρίσκουμε αντιστοίχιση, ώστε η εγγραφή
// να μη σκάει ποτέ στο NOT NULL constraint του template_id.
// Ένα memory box με "unknown" χρειάζεται χειροκίνητη διόρθωση,
// αλλά τουλάχιστον ο πελάτης δεν χάνεται.
const UNKNOWN_TEMPLATE_PLACEHOLDER = "unknown";

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
        await alertAdmin("Λείπει email ή price σε webhook αγορά", {
          sessionId: session.id,
          customerEmail: customerEmail || "MISSING",
          hasPrice: !!price,
        });
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
      }

      // 1) Προτεραιότητα στο metadata.template_id του Stripe Product
      //    (ανθεκτικό σε νέα prices, coupons, discounts)
      // 2) Fallback στο hardcoded mapping (παλιά prices)
      // 3) Αν αποτύχουν και τα δύο -> χρησιμοποιούμε placeholder
      //    ώστε η εγγραφή να μη σκάει, + log error + email alert
      const resolvedTemplateId: string | null =
        product?.metadata?.template_id || PRICE_TO_TEMPLATE[price.id] || null;

      const templateIdForInsert = resolvedTemplateId || UNKNOWN_TEMPLATE_PLACEHOLDER;

      if (!resolvedTemplateId) {
        console.error(
          "UNKNOWN TEMPLATE — no mapping found. price:",
          price.id,
          "product:",
          product?.id,
          "session:",
          session.id
        );
        await alertAdmin("Άγνωστο προϊόν σε αγορά (webhook)", {
          sessionId: session.id,
          priceId: price.id,
          productId: product?.id,
          customerEmail,
        });
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

      // Δημιούργησε memory box (ποτέ με null template_id — βλ. UNKNOWN_TEMPLATE_PLACEHOLDER)
      const { data: newBox, error } = await supabase
        .from("memory_boxes")
        .insert({
          user_id: user?.id || null,
          template_id: templateIdForInsert,
          status: "in_progress",
          story_status: "pending",
          gift_email: customerEmail,
          stripe_session_id: session.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        await alertAdmin("Απέτυχε η δημιουργία memory box (webhook, Supabase)", {
          sessionId: session.id,
          customerEmail,
          templateId: templateIdForInsert,
          supabaseError: error.message,
        });
        return NextResponse.json({ error: "Failed to create memory box" }, { status: 500 });
      }

      console.log("Memory box created:", newBox?.id, "template:", templateIdForInsert);

      if (!resolvedTemplateId) {
        await alertAdmin("Memory box δημιουργήθηκε με ΑΓΝΩΣΤΟ template (χρειάζεται χειροκίνητος έλεγχος)", {
          memoryBoxId: newBox?.id,
          sessionId: session.id,
          customerEmail,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
