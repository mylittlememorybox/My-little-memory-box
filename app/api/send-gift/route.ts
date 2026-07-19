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

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const { data: updatedBox, error: updateError } = await supabase
      .from("memory_boxes")
      .update({
        gift_token: giftToken,
        gift_email: email,
        gift_expires_at: expiryDate.toISOString(),
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
      subject: "Το δώρο σου από το My Little Memory Box 🎁",
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background-color: #F9F2EC; padding: 40px; border-radius: 20px;">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 10px;">
            <h1 style="color: #8B5E3C; font-size: 26px; margin-bottom: 5px; font-weight: normal;">My Little Memory Box</h1>
            <p style="color: #C4A882; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin: 0;">✦ &nbsp; Δώρο &nbsp; ✦</p>
          </div>

          <hr style="border: none; border-top: 1px solid #C4A882; opacity: 0.3; margin: 20px 40px;" />

          <!-- Gift card -->
          <div style="background: white; border-radius: 20px; padding: 40px 30px; text-align: center; margin-bottom: 20px; border: 1px solid rgba(196,168,130,0.2);">
            
            <div style="font-size: 50px; margin-bottom: 20px;">🎁</div>

            <p style="color: #8B5E3C; font-size: 22px; font-style: italic; margin-bottom: 10px;">
              Με αγάπη, για εσένα 💛
            </p>
            <p style="color: #7A6055; font-size: 15px; line-height: 1.9; margin-bottom: 30px;">
              Ένα Memory Box γεμάτο αναμνήσεις<br/>
              σε περιμένει να το συμπληρώσεις
            </p>

            <hr style="border: none; border-top: 1px solid #C4A882; opacity: 0.2; margin: 0 40px 30px;" />

            <!-- QR -->
            <p style="color: #C4A882; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 15px;">Σκάναρε για να ανοίξεις το δώρο σου</p>
            <img src="cid:qrcode" alt="QR Code" style="width: 180px; height: 180px; margin-bottom: 20px;" />

            <!-- Link -->
            <p style="color: #B09880; font-size: 12px; margin-bottom: 8px;">Ή αντέγραψε αυτό το link:</p>
            <div style="background: #F9F2EC; border-radius: 10px; padding: 12px 20px; margin: 0 20px 25px;">
              <p style="color: #8B5E3C; font-size: 12px; word-break: break-all; margin: 0; font-family: monospace;">
                ${giftUrl}
              </p>
            </div>

            <a href="${giftUrl}" style="display: inline-block; background-color: #C49090; color: white; padding: 15px 35px; border-radius: 50px; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">
              ✨ Άνοιξε το Memory Box σου
            </a>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 10px;">
            <p style="color: #B09880; font-size: 12px; margin-bottom: 5px;">
              Το δώρο ισχύει έως: <strong>${expiryDate.toLocaleDateString("el-GR")}</strong>
            </p>
            <p style="color: #C4A882; font-size: 11px; margin: 0;">
              © 2025 My Little Memory Box · info@mylittlememorybox.gr
            </p>
          </div>

        </div>
      `,
      attachments: [
        {
          filename: "qrcode.png",
          content: base64QR,
          encoding: "base64",
          cid: "qrcode",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      giftToken,
      qrCodeDataUrl,
      giftUrl,
    });

  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
