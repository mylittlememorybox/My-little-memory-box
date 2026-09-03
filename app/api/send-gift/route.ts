import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  "https://jephluxdlbabgufalgtz.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, memoryBoxId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    if (!memoryBoxId) {
      console.error("send-gift called without memoryBoxId — aborting to avoid corrupting wrong record");
      return NextResponse.json(
        { error: "memoryBoxId is required" },
        { status: 400 }
      );
    }

    const giftToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // ΔΙΟΡΘΩΣΗ: Δεν ορίζουμε πλέον gift_expires_at.
    // Το δώρο παραμένει ενεργό απεριόριστα — η μόνη προστασία είναι
    // η μία χρήση (βλ. claim-gift/route.ts: .is("user_id", null)),
    // που ήδη ακυρώνει το token μόλις γίνει claim μία φορά.
    const { data: updatedBox, error: updateError } = await supabase
      .from("memory_boxes")
      .update({
        gift_token: giftToken,
        gift_email: email,
        gift_expires_at: null,
        is_gift: true,
      })
      .eq("id", memoryBoxId)
      .select()
      .single();

    if (updateError || !updatedBox) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update memory box with gift details" },
        { status: 500 }
      );
    }

    const giftUrl = `https://www.mylittlememorybox.gr/gift/${giftToken}`;

    const qrCodeDataUrl = await QRCode.toDataURL(giftUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#8B5E3C",
        light: "#F9F2EC",
      },
    });

    const base64QR = qrCodeDataUrl.split(",")[1];

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.eu",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"My Little Memory Box" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: "Το δώρο σας από το My Little Memory Box 🎁",
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background-color: #F9F2EC; padding: 40px; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5E3C; font-size: 28px; margin-bottom: 10px;">My Little Memory Box</h1>
            <p style="color: #C4A882; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Ένα ξεχωριστό δώρο για εσάς</p>
          </div>

          <div style="background: white; border-radius: 20px; padding: 30px; text-align: center; margin-bottom: 20px;">
            <p style="color: #8B5E3C; font-size: 18px; margin-bottom: 20px;">Έχετε λάβει ένα Memory Box!</p>
            <img src="cid:giftqr" alt="QR Code" style="width: 250px; height: 250px; margin: 0 auto; display: block;" />
            <p style="color: #B09880; font-size: 14px; margin-top: 20px;">Σκανάρετε τον κωδικό ή πατήστε το παρακάτω κουμπί για να ξεκινήσετε.</p>
            <a href="${giftUrl}" style="display: inline-block; margin-top: 15px; background-color: #8B5E3C; color: white; padding: 12px 30px; border-radius: 30px; text-decoration: none; font-size: 14px;">Άνοιγμα δώρου</a>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "gift-qr.png",
          content: base64QR,
          encoding: "base64",
          cid: "giftqr",
        },
      ],
    });

    return NextResponse.json({ success: true, giftUrl });
  } catch (error) {
    console.error("Error in send-gift:", error);
    return NextResponse.json({ error: "Failed to send gift" }, { status: 500 });
  }
}
