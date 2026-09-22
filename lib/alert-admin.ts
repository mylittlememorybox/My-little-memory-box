import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_SMTP_USER!,
    pass: process.env.ZOHO_SMTP_PASS!,
  },
});

export async function alertAdmin(subject: string, details: Record<string, any>) {
  try {
    await transporter.sendMail({
      from: process.env.ZOHO_SMTP_USER,
      to: "info@mylittlememorybox.gr",
      subject: `⚠️ ${subject}`,
      html: `
        <h3>${subject}</h3>
        <pre>${JSON.stringify(details, null, 2)}</pre>
        <p>Ώρα: ${new Date().toISOString()}</p>
      `,
    });
  } catch (err) {
    // Αν αποτύχει το ίδιο το email alert, μην ρίξεις όλο το request εξαιτίας του
    console.error("Failed to send admin alert email:", err);
  }
}
