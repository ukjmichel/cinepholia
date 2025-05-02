import { EmailService } from '../../services/email.service';
import { Resend } from 'resend';

jest.mock('resend'); // <-- Mock Resend module

describe('🧪 EmailService Tests', () => {
  let emailService: EmailService;

  beforeEach(() => {
    jest.clearAllMocks();
    emailService = new EmailService();
  });

  it('should send a welcome email successfully', async () => {
    // Mock resend.emails.send to resolve successfully
    (Resend.prototype.emails as any) = {
      send: jest
        .fn()
        .mockResolvedValue({ data: { id: 'fake-id' }, error: null }),
    };

    await expect(
      emailService.sendWelcomeEmail('test@example.com', 'TestUser')
    ).resolves.not.toThrow();

    expect(Resend.prototype.emails.send).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if resend returns an error', async () => {
    (Resend.prototype.emails as any) = {
      send: jest.fn().mockResolvedValue({ data: null, error: 'Error sending' }),
    };

    await expect(
      emailService.sendWelcomeEmail('fail@example.com', 'TestUser')
    ).rejects.toThrow('Failed to send welcome email');
  });

  it('should throw an error if resend.emails.send itself throws', async () => {
    (Resend.prototype.emails as any) = {
      send: jest.fn().mockRejectedValue(new Error('Real exception')),
    };

    await expect(
      emailService.sendWelcomeEmail('boom@example.com', 'TestUser')
    ).rejects.toThrow('Failed to send welcome email');
  });
});
