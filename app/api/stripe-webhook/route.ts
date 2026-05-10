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

const PRICE_TO_TEMPLATE: Record<string, string> = {
  "price_1TTP6PI6cMM6olNfgyRPXeoy": "first-years",
  "price_1TUvjoI6cMM6olNfqYPKW6f5": "me-and-you",
  "price_1TUvpKI6cMM6olNfvpuY7qxq": "our-wedding",
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email;
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;

      if (!customerEmail || !priceId) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
      }

      const templateId = PRICE_TO_TEMPLATE[priceId];

      const { data: { users } } = await supabase.auth.admin.listUsers();
      const user = users?.find((u: any) => u.email === customerEmail);

      if (user && templateId) {
        await supabase.from("memory_boxes").insert({
          user_id: user.id,
          template_id: templateId,
          status: "in_progress",
          story_status: "pending",
        });
      } else {
        await supabase.from("memory_boxes").insert({
          template_id: templateId || "first-years",
          status: "in_progress",
          story_status: "pending",
          gift_email: customerEmail,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
