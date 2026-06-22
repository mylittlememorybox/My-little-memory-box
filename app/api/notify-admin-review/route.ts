import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_APP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { name, content, rating, templateId } = await request.json();

    await transporter.sendMail({
      from: `"My Little Memory Box" <${process.env.ZOHO_EMAIL}>`,
      to: process.env.ZOHO_EMAIL,
      subject: "⭐ Νέα Αξιολόγηση — My Little Memory Box",
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F9F2EC; padding: 40px; border-radius: 20px;">
          <h2 style="color: #8B5E3C;">Νέα Αξιολόγηση! ⭐</h2>
          <div style="background: white; border-radius: 16px; padding: 24px; margin: 20px 0;">
            <p style="color: #5C3820; font-size: 16px;"><strong>${name}</strong></p>
            <p style="color: #C4A882; font-size: 13px;">${templateId} · ${"⭐".repeat(rating)}</p>
            <p style="color: #7A6055; font-size: 14px; line-height: 1.8; font-style: italic;">"${content}"</p>
          </div>
          <a href="https://www.mylittlememorybox.gr/admin/reviews"
             style="display: inline-block; background: #C49090; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">
            Πήγαινε στο Admin Panel
          </a>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
