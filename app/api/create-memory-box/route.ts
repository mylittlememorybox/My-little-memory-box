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
  // Live prices
  "price_1TTP6PI6cMM6olNfgyRPXeoy": "first-years",
  "price_1TUvjoI6cMM6olNfqYPKW6f5": "me-and-you",
  "price_1TUvpKI6cMM6olNfvpuY7qxq": "our-wedding",
  // Test prices
  "price_1TVZwoI6cMM6olNfrNnb8iZH": "first-years",
  "price_1TVnLhI6cMM6olNfsjcnoeI2": "me-and-you",
  "price_1TVnMzI6cMM6olNfkwq1wvwO": "our-wedding",
};

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const customerEmail = session.customer_details?.email;
    const priceId = session.line_items?.data[0]?.price?.id;
    const templateId = PRICE_TO_TEMPLATE[priceId] || "first-years";

    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users?.find((u: any) => u.email === customerEmail);

    const existingBox = await supabase
      .from("memory_boxes")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .single();

    if (existingBox.data) {
      return NextResponse.json({ success: true, memoryBoxId: existingBox.data.id });
    }

    const { data: newBox } = await supabase
      .from("memory_boxes")
      .insert({
        user_id: user?.id || null,
        template_id: templateId,
        status: "in_progress",
        story_status: "pending",
        gift_email: customerEmail,
        stripe_session_id: sessionId,
      })
      .select()
      .single();

    return NextResponse.json({ success: true, memoryBoxId: newBox?.id });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
