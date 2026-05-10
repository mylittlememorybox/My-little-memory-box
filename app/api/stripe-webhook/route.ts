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
