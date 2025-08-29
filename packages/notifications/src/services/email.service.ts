import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { sesClient, getFromEmail } from '../config/aws';
import { EmailJobData } from '../types';

export class EmailService {
  private static client: SESClient = sesClient;

  /**
   * Envia um email usando AWS SES
   */
  static async sendEmail(data: EmailJobData): Promise<{ messageId: string }> {
    try {
      const command = new SendEmailCommand({
        Source: getFromEmail(),
        Destination: {
          ToAddresses: [data.to]
        },
        Message: {
          Subject: {
            Data: data.subject,
            Charset: 'UTF-8'
          },
          Body: {
            Html: {
              Data: data.html,
              Charset: 'UTF-8'
            }
          }
        }
      });

      const result = await this.client.send(command);

      console.log(`✅ Email sent successfully to ${data.to}. Message ID: ${result.MessageId}`);

      return {
        messageId: result.MessageId || ''
      };
    } catch (error: any) {
      console.error('❌ Failed to send email:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  /**
   * Valida se um endereço de email é válido
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Verifica se o serviço SES está configurado
   */
  static isConfigured(): boolean {
    const fromEmail = getFromEmail();
    return fromEmail !== 'noreply@yourdomain.com' && fromEmail.includes('@');
  }

  /**
   * Envia email de teste
   */
  static async sendTestEmail(to: string): Promise<{ messageId: string }> {
    const testData: EmailJobData = {
      notificationId: 'test',
      to,
      subject: 'Test Email - E-commerce Notifications',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from your E-commerce Notifications service.</p>
        <p>If you received this email, AWS SES is configured correctly!</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
      priority: 'low' as any
    };

    return await this.sendEmail(testData);
  }
}
