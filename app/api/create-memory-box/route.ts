import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  "price_1UDPaRI6cMM6olNfCppcHZXp": "first-years",
  "price_1UDPNTI6cMM6olNfnkLRRjJG": "me-and-you",
  "price_1UDPhrI6cMM6olNfDRWbFEPL": "our-wedding",
  "price_1UDPe2I6cMM6olNf3Xl19WO2": "travel",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        {
          status: 400,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
        }
      );
    }

    const isTest = sessionId.startsWith("cs_test_");
    const stripeKey = isTest
      ? process.env.STRIPE_SECRET_KEY_TEST
      : process.env.STRIPE_SECRET_KEY;

    const stripe = require("stripe")(stripeKey);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const customerEmail = session.customer_details?.email;
    const priceId = session.line_items?.data[0]?.price?.id;
    const templateId = priceId ? PRICE_TO_TEMPLATE[priceId] : undefined;

    if (!templateId) {
      console.error(
        "Unknown price_id, no template mapping:",
        priceId,
        "session:",
        sessionId
      );
      return NextResponse.json(
        { error: "Unrecognized product. Please contact support." },
        { status: 400 }
      );
    }

    const { data: existingBox } = await supabase
      .from("memory_boxes")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (existingBox) {
      return NextResponse.json(
        { success: true, memoryBoxId: existingBox.id },
        {
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
        }
      );
    }

    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users?.find((u: any) => u.email === customerEmail);

    const { data: newBox, error } = await supabase
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

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create memory box" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, memoryBoxId: newBox?.id },
      {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed" },
      { status: 500 }
    );
  }
}
