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
  "price_1TTP6PI6cMM6olNfgyRPXeoy": "first-years",
  "price_1TUvjoI6cMM6olNfqYPKW6f5": "me-and-you",
  "price_1TUvpKI6cMM6olNfvpuY7qxq": "our-wedding",
  "price_1TVZwoI6cMM6olNfrNnb8iZH": "first-years",
  "price_1TVnLhI6cMM6olNfsjcnoeI2": "me-and-you",
  "price_1TVnMzI6cMM6olNfkwq1wvwO": "our-wedding",
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
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          }
        }
      );
    }

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
    const templateId = PRICE_TO_TEMPLATE[priceId] || "first-years";

    const { data: existingBox } = await supabase
      .from("memory_boxes")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (existingBox) {
      return NextResponse.json(
        { success: true, memoryBoxId: existingBox.id },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          }
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
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        }
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
