import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_APP_PASSWORD,
  },
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memoryBoxId = searchParams.get("memoryBoxId");
    const clientEmail = searchParams.get("clientEmail");

    if (!memoryBoxId || !clientEmail) {
      return new NextResponse("Missing params", { status: 400 });
    }

    // Στείλε email στον πελάτη
    await transporter.sendMail({
      from: `"My Little Memory Box" <${process.env.ZOHO_EMAIL}>`,
      to: clientEmail,
      subject: `✨ Το παραμυθι σας ειναι ετοιμο!`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background-color: #F9F2EC; padding: 40px; border-radius: 20px; text-align: center;">
          <img src="${process.env.NEXT_PUBLIC_SITE_URL}/logo.png" width="80" style="margin-bottom: 20px;" />
          <h1 style="color: #8B5E3C;">Το παραμυθι σας ειναι ετοιμο! 🎉</h1>
          <p style="color: #7A6055; font-size: 16px; line-height: 1.8;">
            Με χαρα σας ανακοινωνουμε οτι το προσωποποιημενο σας παραμυθι εχει ολοκληρωθει!
          </p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/my-story/${memoryBoxId}"
             style="background: #C49090; color: white; padding: 16px 40px; border-radius: 999px; text-decoration: none; font-size: 16px; display: inline-block; margin: 20px 0;">
            📚 Δειτε το Παραμυθι σας
          </a>
          <p style="color: #B09880; font-size: 12px; margin-top: 20px;">
            My Little Memory Box · mylittlememorybox.gr
          </p>
        </div>
      `,
    });

    // Ενημέρωσε το status στη Supabase σε "ready"
    await supabase
      .from("memory_boxes")
      .update({ story_status: "ready" })
      .eq("id", memoryBoxId);

    // Εμφάνισε επιβεβαίωση
    return new NextResponse(`
      <html>
        <body style="font-family: Georgia, serif; background: #F9F2EC; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0;">
          <div style="text-align: center; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="font-size: 60px; margin-bottom: 20px;">✅</div>
            <h1 style="color: #8B5E3C;">Εστειλες!</h1>
            <p style="color: #7A6055;">Το email στάλθηκε στον πελάτη επιτυχώς.</p>
          </div>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Error sending email", { status: 500 });
  }
}
