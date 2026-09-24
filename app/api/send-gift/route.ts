import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const supabase = createClient(
  "https://jephluxdlbabgufalgtz.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Reads the already-transparent logo from public/logo-transparent.png
// (tries a few likely casings, since file managers/uploads sometimes
// change extension case). Falls back to the regular public/logo.png if
// the transparent file isn't there, and to no logo at all if neither
// exists — so a missing/misnamed file can never block the gift email.
async function getLogoBuffer(): Promise<Buffer | null> {
  const candidates = [
    "logo-transparent.png",
    "logo-transparent.PNG",
    "logo-transparent.Png",
    "logo.png",
  ];
  for (const filename of candidates) {
    try {
      const filePath = path.join(process.cwd(), "public", filename);
      return await readFile(filePath);
    } catch {
      // try the next candidate
    }
  }
  console.error("No logo file found in /public (looked for logo-transparent.png/.PNG and logo.png) — sending email without a logo.");
  return null;
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
    // The gift-card page already has a working, tested "download as
    // image" button (html2canvas, client-side) — instead of re-building
    // that image-composition logic on the server (fragile: no easy way
    // to render this exact card + custom fonts server-side without a
    // heavy new dependency), we just link to that existing page. One
    // tap there gives the recipient the same download button already
    // proven to work.
    const giftCardUrl = `https://www.mylittlememorybox.gr/gift-card/${giftToken}`;

    const qrCodeDataUrl = await QRCode.toDataURL(giftUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#C49090",
        light: "#F9F2EC",
      },
    });

    const base64QR = qrCodeDataUrl.split(",")[1];

    const logoBuffer = await getLogoBuffer();

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

    if (logoBuffer) {
      attachments.push({
        filename: "logo.png",
        content: logoBuffer,
        cid: "giftlogo",
      });
    }

    const logoRowHtml = logoBuffer
      ? `<img src="cid:giftlogo" alt="My Little Memory Box" width="100" style="display:block;margin:0 auto 12px;width:100px;height:auto;border:0;" />`
      : `<div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#C49090 !important;margin-bottom:12px;">My Little Memory Box</div>`;

    // ---------------------------------------------------------------
    // Full HTML document (not just a fragment) so the <meta> tags below
    // can actually take effect: these two lines are what stop Apple
    // Mail / Outlook.com's automatic "dark mode" from recoloring the
    // email to dark brown/black. Every color below is ALSO backed by
    // !important and, on table cells, a plain bgcolor="" attribute —
    // belt-and-braces against different clients' dark-mode engines,
    // which don't all respect the same override method.
    // ---------------------------------------------------------------
    const html = `<!doctype html>
<html lang="el">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<title>Το δώρο σας από το My Little Memory Box</title>
<style>
  :root { color-scheme: light only; supported-color-schemes: light only; }
  body { margin:0; padding:0; background-color:#E8DDD4 !important; }
  /* Explicit re-assertion for clients that still try to invert colors
     even with the meta tags above (Apple Mail "Smart Dark" in particular). */
  [data-ogsc] body,
  [data-ogsb] body { background-color:#E8DDD4 !important; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#E8DDD4 !important;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#E8DDD4" style="background-color:#E8DDD4 !important;padding:32px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="500" cellpadding="0" cellspacing="0" style="width:500px;max-width:92%;">

        <!-- medallion -->
        <tr>
          <td align="center" style="padding-bottom:0;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td width="56" height="56" align="center" valign="middle" bgcolor="#C49090" style="width:56px;height:56px;border-radius:50%;background-color:#C49090 !important;border:2px solid #FBF3E7;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#F2E8DE !important;">
                  &#9825;
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- card -->
        <tr>
          <td bgcolor="#FBF3E7" style="background-color:#FBF3E7 !important;border:1px solid #D4BC98;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

              <tr>
                <td align="center" bgcolor="#FBF3E7" style="background-color:#FBF3E7 !important;padding:28px 32px 0;font-family:Georgia,'Times New Roman',serif;">
                  ${logoRowHtml}
                  <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#A99075 !important;margin-bottom:24px;">
                    Ένα Δώρο Για Εσένα
                  </div>
                  <div style="font-size:28px;font-style:italic;color:#C49090 !important;line-height:1.25;margin-bottom:28px;">
                    Με αγάπη,<br />για εσένα
                  </div>
                </td>
              </tr>

              <!-- ticket-line divider -->
              <tr>
                <td bgcolor="#FBF3E7" style="background-color:#FBF3E7 !important;padding:0 32px;">
                  <div style="border-top:2px dashed #D4BC98;line-height:0;font-size:0;">&nbsp;</div>
                </td>
              </tr>

              <tr>
                <td align="center" bgcolor="#FBF3E7" style="background-color:#FBF3E7 !important;padding:24px 32px 32px;font-family:Georgia,'Times New Roman',serif;">
                  <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#B08D5E !important;margin-bottom:14px;">
                    Σκανάρετε για να ανοίξετε το δώρο σας
                  </div>

                  <img src="cid:giftqr" alt="QR Code" width="150" style="display:block;margin:0 auto 20px;width:150px;height:150px;border:1px solid #D4BC98;" />

                  <a href="${giftUrl}" style="display:block;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#C49090 !important;background-color:#ffffff !important;border:1px solid #D4BC98;border-radius:14px;padding:12px 16px;text-decoration:none;word-break:break-all;line-height:1.5;text-align:center;margin-bottom:18px;">
                    ${giftUrl.replace("https://www.", "")}
                  </a>

                  <div style="font-size:9px;color:#B08D5E !important;letter-spacing:0.5px;">
                    © ${new Date().getFullYear()} My Little Memory Box · info@mylittlememorybox.gr
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- open gift button -->
        <tr>
          <td align="center" style="padding-top:16px;">
            <a href="${giftUrl}" style="display:inline-block;width:100%;box-sizing:border-box;background-color:#C49090 !important;color:#ffffff !important;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:16px;text-align:center;">
              Άνοιγμα Δώρου
            </a>
          </td>
        </tr>

        <!-- download as image button — links to the existing, working
             download feature on the gift-card page itself -->
        <tr>
          <td align="center" style="padding-top:12px;">
            <a href="${giftCardUrl}" style="display:inline-block;width:100%;box-sizing:border-box;background-color:#ffffff !important;color:#C49090 !important;border:1px solid #C4A882;font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:15px;text-align:center;">
              Λήψη Κάρτας ως Εικόνα
            </a>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding-top:14px;font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#C49090 !important;opacity:0.7;">
            Στείλτε μέσω Viber, WhatsApp ή Instagram
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

    await transporter.sendMail({
      from: `"My Little Memory Box" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: "Το δώρο σας από το My Little Memory Box",
      html,
      attachments,
    });

    return NextResponse.json({ success: true, giftUrl });
  } catch (error) {
    console.error("Error in send-gift:", error);
    return NextResponse.json({ error: "Failed to send gift" }, { status: 500 });
  }
}
