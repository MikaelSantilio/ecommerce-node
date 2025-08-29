import Queue from 'bull';
import { connectRedis } from '../config/redis';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';
import { Notification } from '../models/notification.model';
import { NotificationStatus } from '../types';

// Configurar filas
const emailQueue = new Queue('email_notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  },
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 20,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
});

const smsQueue = new Queue('sms_notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  },
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 20,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
});

// Worker para processamento de emails
emailQueue.process(async (job: any) => {
  const { notificationId, to, subject, html, priority } = job.data;

  try {
    console.log(`📧 Processing email notification ${notificationId} to ${to}`);

    // Enviar email
    const result = await EmailService.sendEmail({
      notificationId,
      to,
      subject,
      html,
      priority
    });

    // Atualizar status da notificação
    await Notification.findByIdAndUpdate(notificationId, {
      status: NotificationStatus.SENT,
      sentAt: new Date(),
      deliveredAt: new Date() // SES entrega quase instantaneamente
    });

    console.log(`✅ Email notification ${notificationId} sent successfully`);
    return result;
  } catch (error: any) {
    console.error(`❌ Failed to send email notification ${notificationId}:`, error);

    // Atualizar status da notificação
    await Notification.findByIdAndUpdate(notificationId, {
      status: NotificationStatus.FAILED,
      error: error.message,
      $inc: { retryCount: 1 }
    });

    throw error;
  }
});

// Worker para processamento de SMS
smsQueue.process(async (job: any) => {
  const { notificationId, to, message, priority } = job.data;

  try {
    console.log(`📱 Processing SMS notification ${notificationId} to ${to}`);

    // Enviar SMS
    const result = await SmsService.sendSms({
      notificationId,
      to,
      message,
      priority
    });

    // Atualizar status da notificação
    await Notification.findByIdAndUpdate(notificationId, {
      status: NotificationStatus.SENT,
      sentAt: new Date(),
      deliveredAt: new Date() // Twilio entrega quase instantaneamente
    });

    console.log(`✅ SMS notification ${notificationId} sent successfully`);
    return result;
  } catch (error: any) {
    console.error(`❌ Failed to send SMS notification ${notificationId}:`, error);

    // Atualizar status da notificação
    await Notification.findByIdAndUpdate(notificationId, {
      status: NotificationStatus.FAILED,
      error: error.message,
      $inc: { retryCount: 1 }
    });

    throw error;
  }
});

// Eventos da fila
emailQueue.on('completed', (job: any) => {
  console.log(`✅ Email job ${job.id} completed`);
});

emailQueue.on('failed', (job: any, err: any) => {
  console.error(`❌ Email job ${job.id} failed:`, err);
});

smsQueue.on('completed', (job: any) => {
  console.log(`✅ SMS job ${job.id} completed`);
});

smsQueue.on('failed', (job: any, err: any) => {
  console.error(`❌ SMS job ${job.id} failed:`, err);
});

// Funções para adicionar jobs às filas
export const addEmailJob = async (data: any, options: any = {}) => {
  return await emailQueue.add(data, {
    priority: data.priority === 'high' ? 1 : (data.priority === 'medium' ? 2 : 3),
    delay: options.delay || 0,
    ...options
  });
};

export const addSmsJob = async (data: any, options: any = {}) => {
  return await smsQueue.add(data, {
    priority: data.priority === 'high' ? 1 : (data.priority === 'medium' ? 2 : 3),
    delay: options.delay || 0,
    ...options
  });
};

// Função para fechar as filas
export const closeQueues = async () => {
  await emailQueue.close();
  await smsQueue.close();
  console.log('📊 Notification queues closed');
};

// Função para obter status das filas
export const getQueueStats = async () => {
  const emailStats = await emailQueue.getJobCounts();
  const smsStats = await smsQueue.getJobCounts();

  return {
    email: emailStats,
    sms: smsStats
  };
};

// Função para iniciar os workers
export const startNotificationWorkers = async (): Promise<void> => {
  try {
    // Conectar ao Redis
    await connectRedis();

    console.log('🚀 Notification workers started successfully');
    console.log('📧 Email queue ready');
    console.log('📱 SMS queue ready');
  } catch (error) {
    console.error('❌ Failed to start notification workers:', error);
    throw error;
  }
};
