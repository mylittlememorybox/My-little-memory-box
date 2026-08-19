import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  "https://jephluxdlbabgufalgtz.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userEmail, templateId, formData, memoryBoxId } = await request.json();

    // 1. Γράφουμε ΠΡΩΤΑ τα δεδομένα στη βάση — πριν οτιδήποτε άλλο
    const { error: insertError } = await supabase.from("story_requests").insert({
      memory_box_id: memoryBoxId || null,
      template_id: templateId || null,
      form_data: formData,
      parent_email: userEmail || null,
      status: "pending",
    });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { success: false, error: "Δεν ήταν δυνατή η αποθήκευση των δεδομένων." },
        { status: 500 }
      );
    }

    // 2. Μόνο αν τα δεδομένα αποθηκεύτηκαν, προχωράμε στο email
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

    const sendToClientUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/send-ebook-to-client?memoryBoxId=${memoryBoxId}&clientEmail=${userEmail}`;

    try {
      await transporter.sendMail({
        from: `"My Little Memory Box" <${process.env.ZOHO_EMAIL}>`,
        to: process.env.ZOHO_EMAIL,
        subject: `📦 Νεο Αιτημα - ${isFirstYears ? formData.child_name : formData.his_name}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background-color: #F9F2EC; padding: 40px; border-radius: 20px;">
            <h1 style="color: #8B5E3C; text-align: center;">Νεο Αιτημα Παραμυθιου</h1>

            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
              <p style="color: #8B5E3C;"><strong>Email Χρηστη:</strong> ${userEmail}</p>
              <p style="color: #8B5E3C;"><strong>Τυπος:</strong> ${isFirstYears ? "Τα Πρωτα Χρονια 🍼" : "Εγω & Εσυ 💑"}</p>
            </div>

            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 30px;">
              <h2 style="color: #8B5E3C;">Στοιχεια:</h2>
              <table style="width: 100%; border-collapse: collapse; color: #7A6055;">
                ${fieldsHtml}
              </table>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${sendToClientUrl}"
                 style="background: #8B5E3C; color: white; padding: 16px 40px; border-radius: 999px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
                ✅ Στειλε το e-book στον πελατη
              </a>
              <p style="color: #B09880; font-size: 12px; margin-top: 10px;">
                Μολις ετοιμασεις το e-book, πατησε το κουμπι παραπανω
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      // Τα δεδομένα είναι ήδη ασφαλή στη βάση — απλά καταγράφουμε το πρόβλημα email
      console.error("Email send error (data already saved):", emailError);
      return NextResponse.json({ success: true, emailSent: false });
    }

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
