import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import path from "path";
import Jimp from "jimp";

export const dynamic = "force-dynamic";

const supabase = createClient(
  "https://jephluxdlbabgufalgtz.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Reads public/logo.png, makes near-white pixels transparent, and returns
// a PNG buffer — same rule as the client-side canvas version on the gift
// card page (r,g,b > 240 -> alpha 0), done here server-side with Jimp
// since there is no DOM/canvas available in an API route. Falls back to
// the original file untouched if anything goes wrong, so a broken/missing
// file never breaks the email send.
async function getTransparentLogoBuffer(): Promise<Buffer | null> {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const original = await readFile(logoPath);
    const image = await Jimp.read(original);

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (
      _x,
      _y,
      idx
    ) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      if (r > 240 && g > 240 && b > 240) {
        this.bitmap.data[idx + 3] = 0;
      }
    });

    return await image.getBufferAsync(Jimp.MIME_PNG);
  } catch (error) {
    console.error("Logo background removal failed, sending without logo:", error);
    return null;
  }
}

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
    //
    // ΔΙΟΡΘΩΣΗ 2: user_id: null — καθαρίζουμε ρητά τυχόν user_id που
    // μπήκε ήδη στη δημιουργία του box (πχ αν ο αγοραστής έχει ήδη
    // λογαριασμό με το ίδιο email με το οποίο πλήρωσε). Χωρίς αυτό,
    // ένα box που μόλις έγινε "δώρο" μπορεί να έχει ταυτόχρονα
    // is_gift: true ΚΑΙ user_id γεμάτο, οπότε η σελίδα /gift/[token]
    // δείχνει αμέσως "already used" ακόμα και πριν ο παραλήπτης
    // προλάβει να το ανοίξει.
    const { data: updatedBox, error: updateError } = await supabase
      .from("memory_boxes")
      .update({
        gift_token: giftToken,
        gift_email: email,
        gift_expires_at: null,
        is_gift: true,
        user_id: null,
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
        dark: "#C49090",
        light: "#F9F2EC",
      },
    });

    const base64QR = qrCodeDataUrl.split(",")[1];

    const logoBuffer = await getTransparentLogoBuffer();

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.eu",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_APP_PASSWORD,
      },
    });

    const attachments: {
      filename: string;
      content: string | Buffer;
      encoding?: string;
      cid: string;
    }[] = [
      {
        filename: "gift-qr.png",
        content: base64QR,
        encoding: "base64",
        cid: "giftqr",
      },
    ];

    // Only attach/reference the logo if the background-removal step
    // actually produced a buffer — otherwise the email still sends fine,
    // just without the logo image (never blocks the gift from going out).
    if (logoBuffer) {
      attachments.push({
        filename: "logo.png",
        content: logoBuffer,
        cid: "giftlogo",
      });
    }

    await transporter.sendMail({
      from: `"My Little Memory Box" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: "Το δώρο σας από το My Little Memory Box",
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background-color: #F9F2EC; padding: 40px; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            ${logoBuffer ? '<img src="cid:giftlogo" alt="My Little Memory Box" style="width: 110px; height: auto; margin: 0 auto 14px; display: block;" />' : '<h1 style="color: #C49090; font-size: 28px; margin-bottom: 10px;">My Little Memory Box</h1>'}
            <p style="color: #C4A882; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Ένα ξεχωριστό δώρο για εσάς</p>
          </div>

          <div style="background: white; border-radius: 20px; padding: 30px; text-align: center; margin-bottom: 20px;">
            <p style="color: #C49090; font-size: 18px; margin-bottom: 20px;">Έχετε λάβει ένα Memory Box!</p>
            <img src="cid:giftqr" alt="QR Code" style="width: 250px; height: 250px; margin: 0 auto; display: block;" />
            <p style="color: #B09880; font-size: 14px; margin-top: 20px;">Σκανάρετε τον κωδικό ή πατήστε το παρακάτω κουμπί για να ξεκινήσετε.</p>
            <a href="${giftUrl}" style="display: inline-block; margin-top: 15px; background-color: #C49090; color: white; padding: 12px 30px; border-radius: 30px; text-decoration: none; font-size: 14px;">Άνοιγμα δώρου</a>
          </div>
        </div>
      `,
      attachments,
    });

    return NextResponse.json({ success: true, giftUrl });
  } catch (error) {
    console.error("Error in send-gift:", error);
    return NextResponse.json({ error: "Failed to send gift" }, { status: 500 });
  }
}
