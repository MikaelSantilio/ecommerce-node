import { SESClient } from '@aws-sdk/client-ses';

export const createSESClient = (): SESClient => {
  const config = {
    region: process.env.AWS_REGION || 'sa-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
  };

  if (!config.credentials.accessKeyId || !config.credentials.secretAccessKey) {
    console.warn('⚠️  AWS credentials not provided. SES functionality will be limited.');
  }

  return new SESClient(config);
};

export const sesClient = createSESClient();

export const getFromEmail = (): string => {
  return process.env.SES_FROM_EMAIL || 'no-reply@everythingto.shop';
};
