import { Resend } from 'resend';

interface ContactData {
  name: string;
  email: string;
  message: string;
}

export async function sendContactEmail(data: ContactData): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;

  if (!resendApiKey || !contactEmail) {
    throw new Error('Email configuration missing');
  }

  const resend = new Resend(resendApiKey);

  await resend.emails.send({
    from: 'Portfolio Contact <onboarding@resend.dev>',
    to: contactEmail,
    subject: `Portfolio Contact: ${data.name}`,
    text: `
Name: ${data.name}
Email: ${data.email}

Message:
${data.message}
    `.trim(),
    replyTo: data.email,
  });
}
