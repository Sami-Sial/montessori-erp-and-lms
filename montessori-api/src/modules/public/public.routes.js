import { Router } from 'express';
import { z } from 'zod';
import { sendEmail } from '../../lib/email.js';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  school: z.string().optional(),
  topic: z.string().min(1, 'Topic is required'),
  message: z.string().min(1, 'Message is required'),
});

router.post('/contact', async (req, res, next) => {
  try {
    const data = contactSchema.parse(req.body);

    const adminEmail = process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'admin@example.com';

    await sendEmail({
      to: adminEmail,
      subject: `New Contact Form Submission: ${data.topic}`,
      templateName: 'contact',
      context: data,
    });

    res.json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

export default router;
