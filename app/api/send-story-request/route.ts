import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { userEmail, templateId, formData } = await request.json();

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.eu",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_APP_PASSWORD,
      },
    });

    const isFirstYears = templateId === "first-years";

    const fieldsHtml = isFirstYears ? `
      <tr><td><strong>Ονομα παιδιου:</strong></td><td>${formData.child_name || "-"}</td></tr>
      <tr><td><strong>Φυλο:</strong></td><td>${formData.gender || "-"}</td></tr>
      <tr><td><strong>Ηλικια:</strong></td><td>${formData.age || "-"}</td></tr>
      <tr><td><strong>Χρωμα μαλλιων:</strong></td><td>${formData.hair_color || "-"}</td></tr>
      <tr><td><strong>Χρωμα ματιων:</strong></td><td>${formData.eye_color || "-"}</td></tr>
      <tr><td><strong>Αγαπημενο χρωμα:</strong></td><td>${formData.favorite_color || "-"}</td></tr>
      <tr><td><strong>Αγαπημενα πραγματα:</strong></td><td>${formData.favorite_things || "-"}</td></tr>
      <tr><td><strong>Αγαπημενο ζωακι:</strong></td><td>${formData.favorite_animal || "-"}</td></tr>
      <tr><td><strong>Μηνυμα μαμας:</strong></td><td>${formData.mom_message || "-"}</td></tr>
    ` : `
      <tr><td><strong>Ονομα του:</strong></td><td>${formData.his_name || "-"}</td></tr>
      <tr><td><strong>Ονομα της:</strong></td><td>${formData.her_name || "-"}</td></tr>
      <tr><td><strong>Πως γνωριστηκαν:</strong></td><td>${formData.how_met || "-"}</td></tr>
      <tr><td><strong>Αστειο χαρακτηριστικο του:</strong></td><td>${formData.his_funny || "-"}</td></tr>
      <tr><td><strong>Αστειο χαρακτηριστικο της:</strong></td><td>${formData.her_funny || "-"}</td></tr>
      <tr><td><strong>Ταλεντο του:</strong></td><td>${formData.his_talent || "-"}</td></tr>
      <tr><td><strong>Ταλεντο της:</strong></td><td>${formData.her_talent || "-"}</td></tr>
      <tr><td><strong>Αγαπημενη στιγμη:</strong></td><td>${formData.favorite_moment || "-"}</td></tr>
      <tr><td><strong>Μηνυμα αγαπης:</strong></td><td>${formData.love_message || "-"}</td></tr>
    `;

    await transporter.sendMail({
      from: `"My Little Memory Box" <${process.env.ZOHO_EMAIL}>`,
      to: process.env.ZOHO_EMAIL,
      subject: `Νεο Αιτημα Παραμυθιου - ${isFirstYears ? "Τα Πρωτα Χρονια" : "Εγω & Εσυ"}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background-color: #F9F2EC; padding: 40px; border-radius: 20px;">
          <h1 style="color: #8B5E3C; text-align: center; margin-bottom: 30px;">
            Νεο Αιτημα Παραμυθιου
          </h1>

          <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
            <p style="color: #8B5E3C;"><strong>Email Χρηστη:</strong> ${userEmail}</p>
            <p style="color: #8B5E3C;"><strong>Τυπος Memory Box:</strong> ${isFirstYears ? "Τα Πρωτα Χρονια 🍼" : "Εγω & Εσυ 💑"}</p>
          </div>

          <div style="background: white; border-radius: 15px; padding: 20px;">
            <h2 style="color: #8B5E3C; margin-bottom: 15px;">Στοιχεια Παραμυθιου:</h2>
            <table style="width: 100%; border-collapse: collapse; color: #7A6055;">
              ${fieldsHtml}
            </table>
          </div>

          <p style="text-align: center; color: #B09880; font-size: 12px; margin-top: 20px;">
            My Little Memory Box · info@mylittlememorybox.gr
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
