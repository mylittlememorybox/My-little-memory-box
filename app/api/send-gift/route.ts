import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";

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

    const giftToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    if (memoryBoxId) {
      await supabase
        .from("memory_boxes")
        .update({
          gift_token: giftToken,
          gift_email: email,
          gift_expires_at: expiryDate.toISOString(),
          is_gift: true,
        })
        .eq("id", memoryBoxId);
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
            <p style="color: #8B5E3C; font-size: 18px; margin-bottom: 20px;">Έχετε λάβει ένα Memory Box! 🎁</p>
            <p style="color: #7A6055; font-size: 14px; line-height: 1.8; margin-bottom: 30px;">
              Σκανάρετε το QR code ή πατήστε το link για να δημιουργήσετε τον λογαριασμό σας και να ξεκινήσετε το Memory Box σας.
            </p>
            <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px; margin-bottom: 20px;" />
            <br />
            <a href="${giftUrl}" style="display: inline-block; background-color: #C49090; color: white; padding: 15px 30px; border-radius: 50px; text-decoration: none; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
              Ανοίξτε το Memory Box σας
            </a>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #B09880; font-size: 12px;">
              Το link ισχύει έως: ${expiryDate.toLocaleDateString("el-GR")}
            </p>
            <p style="color: #B09880; font-size: 11px; margin-top: 10px;">
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

    // Επιστρέφουμε και το QR και το link για το frontend
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
