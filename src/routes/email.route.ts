import { Router, Request, Response } from 'express';
import { EmailService } from '../services/email.service';

const router = Router();
const emailService = new EmailService();

router.get(
  '/test-welcome',
  async (req: Request, res: Response): Promise<any> => {
    const to = req.query.to as string;
    const username = req.query.username as string;

    if (!to) {
      return res.status(400).json({ message: 'Missing "to" query parameter.' });
    }

    try {
      await emailService.sendWelcomeEmail(to, username);
      res.status(200).json({ message: `Test welcome email sent to ${to}` });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send email.' });
    }
  }
);

export default router;
