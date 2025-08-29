import { twilioClient, getTwilioPhoneNumber } from '../config/twilio';
import { SmsJobData } from '../types';

export class SmsService {
  /**
   * Envia um SMS usando Twilio
   */
  static async sendSms(data: SmsJobData): Promise<{ messageId: string }> {
    try {
      if (!twilioClient) {
        throw new Error('Twilio client not configured');
      }

      const message = await twilioClient.messages.create({
        body: data.message,
        from: getTwilioPhoneNumber(),
        to: data.to
      });

      console.log(`✅ SMS sent successfully to ${data.to}. Message SID: ${message.sid}`);

      return {
        messageId: message.sid
      };
    } catch (error: any) {
      console.error('❌ Failed to send SMS:', error);
      throw new Error(`SMS sending failed: ${error.message}`);
    }
  }

  /**
   * Valida se um número de telefone é válido (formato brasileiro)
   */
  static isValidPhoneNumber(phone: string): boolean {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');

    // Verifica se tem 11 dígitos (com DDD) ou 13 dígitos (com +55)
    return cleanPhone.length === 11 || cleanPhone.length === 13;
  }

  /**
   * Formata número de telefone para o padrão internacional
   */
  static formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');

    // Se já tem 13 dígitos (com +55), retorna como está
    if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
      return `+${cleanPhone}`;
    }

    // Se tem 11 dígitos (DDD + número), adiciona +55
    if (cleanPhone.length === 11) {
      return `+55${cleanPhone}`;
    }

    // Retorna o número original se não conseguir formatar
    return phone;
  }

  /**
   * Verifica se o serviço Twilio está configurado
   */
  static isConfigured(): boolean {
    return twilioClient !== null && getTwilioPhoneNumber() !== '';
  }

  /**
   * Envia SMS de teste
   */
  static async sendTestSms(to: string): Promise<{ messageId: string }> {
    const testData: SmsJobData = {
      notificationId: 'test',
      to: this.formatPhoneNumber(to),
      message: 'Test SMS from E-commerce Notifications service. If you received this, Twilio is configured correctly!',
      priority: 'low' as any
    };

    return await this.sendSms(testData);
  }
}
