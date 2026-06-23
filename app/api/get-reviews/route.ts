import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  "https://jephluxdlbabgufalgtz.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      return NextResponse.json({ reviews: [], error: error.message });
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (err) {
    return NextResponse.json({ reviews: [] });
  }
}
