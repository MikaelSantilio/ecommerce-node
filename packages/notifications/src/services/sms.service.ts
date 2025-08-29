import { twilioClient, getTwilioPhoneNumber } from '../config/twilio';
import { SmsJobData } from '../types';

export class SmsService {
  // Limite de caracteres considerando o prefixo do Twilio trial (~30 chars)
  private static readonly SMS_MAX_LENGTH = 110; // Twilio trial adiciona "Sent from your Twilio trial - "

  /**
   * Envia um SMS usando Twilio
   */
  static async sendSms(data: SmsJobData): Promise<{ messageId: string }> {
    try {
      if (!twilioClient) {
        throw new Error('Twilio client not configured');
      }

      // Truncar mensagem se for muito longa
      const truncatedMessage = this.truncateMessage(data.message);

      const message = await twilioClient.messages.create({
        body: truncatedMessage,
        from: getTwilioPhoneNumber(),
        to: data.to
      });

      console.log(`✅ SMS sent successfully to ${data.to}. Message SID: ${message.sid}`);
      
      if (truncatedMessage !== data.message) {
        console.warn(`⚠️ SMS message was truncated from ${data.message.length} to ${truncatedMessage.length} characters`);
      }

      return {
        messageId: message.sid
      };
    } catch (error: any) {
      console.error('❌ Failed to send SMS:', error);
      
      // Verificar se é erro de trial message length
      if (error.message && error.message.includes('Trial Message Length Exceeded')) {
        throw new Error(`SMS too long for Twilio trial account. Message length: ${data.message.length}, max allowed: ${this.SMS_MAX_LENGTH}`);
      }
      
      // Verificar se é erro de número não verificado
      if (error.message && error.message.includes('not a valid phone number')) {
        throw new Error(`Invalid phone number: ${data.to}. For Twilio trial, phone must be verified.`);
      }
      
      throw new Error(`SMS sending failed: ${error.message}`);
    }
  }

  /**
   * Trunca mensagem se exceder limite de caracteres
   */
  private static truncateMessage(message: string): string {
    if (message.length <= this.SMS_MAX_LENGTH) {
      return message;
    }

    // Trunca e adiciona reticências
    return message.substring(0, this.SMS_MAX_LENGTH - 3) + '...';
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
      message: 'Teste SMS E-commerce. Twilio configurado!',
      priority: 'low' as any
    };

    return await this.sendSms(testData);
  }

  /**
   * Valida se mensagem está dentro do limite de caracteres
   */
  static isMessageValid(message: string): { valid: boolean; length: number; maxLength: number } {
    return {
      valid: message.length <= this.SMS_MAX_LENGTH,
      length: message.length,
      maxLength: this.SMS_MAX_LENGTH
    };
  }

  /**
   * Otimiza mensagem para SMS
   */
  static optimizeMessage(message: string): string {
    // Remove quebras de linha extras
    let optimized = message.replace(/\n+/g, ' ');
    
    // Remove espaços duplos
    optimized = optimized.replace(/\s+/g, ' ');
    
    // Remove acentos para economizar caracteres
    optimized = this.removeAccents(optimized);
    
    // Trim
    optimized = optimized.trim();
    
    // Trunca se necessário
    return this.truncateMessage(optimized);
  }

  /**
   * Remove acentos de uma string
   */
  private static removeAccents(str: string): string {
    const accentsMap: { [key: string]: string } = {
      'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
      'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
      'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
      'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
      'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
      'ç': 'c', 'ñ': 'n',
      'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A',
      'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
      'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
      'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
      'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
      'Ç': 'C', 'Ñ': 'N'
    };

    return str.replace(/[áàãâäéèêëíìîïóòõôöúùûüçñÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇÑ]/g, (match) => {
      return accentsMap[match] || match;
    });
  }
}
