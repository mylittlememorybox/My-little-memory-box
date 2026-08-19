import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  "https://jephluxdlbabgufalgtz.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { giftToken, userId } = await request.json();

    if (!giftToken || !userId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Παίρνουμε το πραγματικό email του παραλήπτη από το Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      console.error("Error fetching user email:", userError);
      return NextResponse.json({ error: "Could not resolve user email" }, { status: 500 });
    }

    const recipientEmail = userData.user.email;

    const { error } = await supabase
      .from("memory_boxes")
      .update({ user_id: userId, gift_email: recipientEmail })
      .eq("gift_token", giftToken)
      .is("user_id", null);

    if (error) {
      console.error("Error:", error);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
