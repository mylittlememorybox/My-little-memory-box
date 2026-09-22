import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL!,
    pass: process.env.ZOHO_APP_PASSWORD!,
  },
});

export async function alertAdmin(subject: string, details: Record<string, any>) {
  try {
    await transporter.sendMail({
      from: process.env.ZOHO_EMAIL,
      to: "info@mylittlememorybox.gr",
      subject: `⚠️ ${subject}`,
      html: `
        <h3>${subject}</h3>
        <pre>${JSON.stringify(details, null, 2)}</pre>
        <p>Ώρα: ${new Date().toISOString()}</p>
      `,
    });
  } catch (err) {
    console.error("Failed to send admin alert email:", err);
  }
}
